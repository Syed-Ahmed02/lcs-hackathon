import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// ---------------------------------------------------------------------------
// Token resolution helper (shared by all handlers)
// ---------------------------------------------------------------------------

async function resolveTokenToUserId(
  ctx: QueryCtx | MutationCtx,
  extensionToken: string,
): Promise<string> {
  const row = await ctx.db
    .query("extensionLinkCodes")
    .withIndex("by_token", (q) => q.eq("extensionToken", extensionToken))
    .first();

  if (!row) throw new Error("Invalid extension token");
  return row.userId;
}

// ---------------------------------------------------------------------------
// Internal helpers (called from extensionApiActions.ts)
// ---------------------------------------------------------------------------

// Resolve a token to userId — used by the Node action to validate before DB writes
export const resolveToken = internalQuery({
  args: { extensionToken: v.string() },
  handler: async (ctx, args): Promise<string | null> => {
    const row = await ctx.db
      .query("extensionLinkCodes")
      .withIndex("by_token", (q) => q.eq("extensionToken", args.extensionToken))
      .first();
    return row?.userId ?? null;
  },
});

// Write snapshot + decision row with an explicit userId (no JWT needed)
export const recordTabDecisionInternal = internalMutation({
  args: {
    userId: v.string(),
    sessionId: v.id("focusSessions"),
    url: v.string(),
    domain: v.string(),
    title: v.string(),
    decision: v.union(v.literal("allowed"), v.literal("blocked")),
    source: v.union(v.literal("ai"), v.literal("manual")),
    reasoning: v.optional(v.string()),
    confidence: v.optional(v.number()),
    pageContentExcerpt: v.optional(v.string()),
    contentHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const snapshotId = await ctx.db.insert("tabSnapshots", {
      sessionId: args.sessionId,
      userId: args.userId,
      url: args.url,
      title: args.title,
      capturedAt: Date.now(),
      pageContentExcerpt: args.pageContentExcerpt,
      contentHash: args.contentHash,
    });

    return await ctx.db.insert("tabDecisions", {
      sessionId: args.sessionId,
      userId: args.userId,
      snapshotId,
      url: args.url,
      domain: args.domain,
      title: args.title,
      pageContentExcerpt: args.pageContentExcerpt,
      decision: args.decision,
      source: args.source,
      reasoning: args.reasoning,
      confidence: args.confidence,
      decidedAt: Date.now(),
    });
  },
});

// Compute session rollup with explicit userId (no JWT)
export const computeSessionRollupInternal = internalMutation({
  args: {
    userId: v.string(),
    sessionId: v.id("focusSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== args.userId) throw new Error("Session not found");

    const decisions = await ctx.db
      .query("tabDecisions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const blockedCount = decisions.filter((d) => d.decision === "blocked").length;
    const allowedCount = decisions.filter((d) => d.decision === "allowed").length;
    const totalDecisions = decisions.length;
    const distractionRate = totalDecisions > 0 ? blockedCount / totalDecisions : 0;

    const domainCounts: Record<string, number> = {};
    for (const d of decisions.filter((d) => d.decision === "blocked")) {
      domainCounts[d.domain] = (domainCounts[d.domain] ?? 0) + 1;
    }
    const topBlockedDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }));

    const rollupId = await ctx.db.insert("insightRollups", {
      userId: args.userId,
      sessionId: args.sessionId,
      period: "session",
      periodStart: session.startedAt,
      periodEnd: session.endedAt ?? Date.now(),
      totalDecisions,
      blockedCount,
      allowedCount,
      topBlockedDomains,
      distractionRate,
      computedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.aiActions.summarizeSession, {
      rollupId,
      sessionId: args.sessionId,
    });

    return rollupId;
  },
});

// ---------------------------------------------------------------------------
// Public API for the extension (all accept extensionToken, no JWT)
// ---------------------------------------------------------------------------

// Check linked state and active session — popup calls this on open
export const getLinkedState = query({
  args: { extensionToken: v.string() },
  handler: async (ctx, args) => {
    const userId = await resolveTokenToUserId(ctx, args.extensionToken);

    const activeSession = await ctx.db
      .query("focusSessions")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("status", "active"),
      )
      .order("desc")
      .first();

    return { userId, activeSession };
  },
});

// Start a new focus session (abandons any existing active session)
export const startSession = mutation({
  args: {
    extensionToken: v.string(),
    goalDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveTokenToUserId(ctx, args.extensionToken);

    const active = await ctx.db
      .query("focusSessions")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("status", "active"),
      )
      .first();

    if (active) {
      await ctx.db.patch(active._id, { status: "abandoned", endedAt: Date.now() });
    }

    const sessionId = await ctx.db.insert("focusSessions", {
      userId,
      startedAt: Date.now(),
      goalDescription: args.goalDescription,
      status: "active",
    });

    return { sessionId };
  },
});

// End the active focus session and schedule rollup computation
export const endSession = mutation({
  args: {
    extensionToken: v.string(),
    sessionId: v.id("focusSessions"),
  },
  handler: async (ctx, args) => {
    const userId = await resolveTokenToUserId(ctx, args.extensionToken);

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) throw new Error("Session not found");

    await ctx.db.patch(args.sessionId, { status: "completed", endedAt: Date.now() });

    await ctx.scheduler.runAfter(0, internal.extensionApi.computeSessionRollupInternal, {
      userId,
      sessionId: args.sessionId,
    });
  },
});

// Manual override of a previous decision
export const recordManualOverride = mutation({
  args: {
    extensionToken: v.string(),
    decisionId: v.id("tabDecisions"),
    newDecision: v.union(v.literal("allowed"), v.literal("blocked")),
  },
  handler: async (ctx, args) => {
    const userId = await resolveTokenToUserId(ctx, args.extensionToken);

    const existing = await ctx.db.get(args.decisionId);
    if (!existing || existing.userId !== userId) throw new Error("Decision not found");

    await ctx.db.patch(args.decisionId, {
      decision: args.newDecision,
      source: "manual",
      decidedAt: Date.now(),
    });
  },
});

// Get recent decisions for a session (popup display)
export const getSessionDecisions = query({
  args: {
    extensionToken: v.string(),
    sessionId: v.id("focusSessions"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveTokenToUserId(ctx, args.extensionToken);

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) return [];

    return await ctx.db
      .query("tabDecisions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(args.limit ?? 20);
  },
});
