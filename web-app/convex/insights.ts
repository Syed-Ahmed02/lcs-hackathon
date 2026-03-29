import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireUserId } from "./lib/user";

// Get the most recent insight rollup for the signed-in user
export const getLatestInsights = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = requireUserId(identity);

    return await ctx.db
      .query("insightRollups")
      .withIndex("by_user_and_period", (q) =>
        q.eq("userId", userId).eq("period", "session"),
      )
      .order("desc")
      .first();
  },
});

// Get all insight rollups for the signed-in user
export const getInsightHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = requireUserId(identity);

    return await ctx.db
      .query("insightRollups")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit ?? 10);
  },
});

// Compute and store a session rollup — called after a session ends
export const computeSessionRollup = mutation({
  args: { sessionId: v.id("focusSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = requireUserId(identity);

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    const decisions = await ctx.db
      .query("tabDecisions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const blockedCount = decisions.filter((d) => d.decision === "blocked").length;
    const allowedCount = decisions.filter((d) => d.decision === "allowed").length;
    const totalDecisions = decisions.length;
    const distractionRate = totalDecisions > 0 ? blockedCount / totalDecisions : 0;

    // Tally top blocked domains
    const domainCounts: Record<string, number> = {};
    for (const d of decisions.filter((d) => d.decision === "blocked")) {
      domainCounts[d.domain] = (domainCounts[d.domain] ?? 0) + 1;
    }
    const topBlockedDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }));

    const rollupId = await ctx.db.insert("insightRollups", {
      userId,
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

    // Schedule AI summarization for this rollup
    await ctx.scheduler.runAfter(0, internal.aiActions.summarizeSession, {
      rollupId,
      sessionId: args.sessionId,
    });

    return rollupId;
  },
});

// Internal: fetch a rollup by id (used by aiActions.summarizeSession in Node runtime)
export const getRollup = internalQuery({
  args: { rollupId: v.id("insightRollups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.rollupId);
  },
});

// Internal: store the AI-generated summary text on an existing rollup
export const patchRollupSummary = internalMutation({
  args: { rollupId: v.id("insightRollups"), summaryText: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.rollupId, { summaryText: args.summaryText });
  },
});
