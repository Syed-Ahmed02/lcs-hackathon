import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get recent tab decisions for the signed-in user (across all sessions)
export const getRecentDecisions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("tabDecisions")
      .withIndex("by_token_and_decided_at", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .order("desc")
      .take(args.limit ?? 20);
  },
});

// Get all tab decisions for a specific session
export const getSessionDecisions = query({
  args: { sessionId: v.id("focusSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("tabDecisions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(100);
  },
});

// Record a tab snapshot and AI/manual decision
export const recordTabDecision = mutation({
  args: {
    sessionId: v.id("focusSessions"),
    url: v.string(),
    domain: v.string(),
    title: v.string(),
    decision: v.union(v.literal("allowed"), v.literal("blocked")),
    source: v.union(v.literal("ai"), v.literal("manual")),
    reasoning: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Record the snapshot first
    const snapshotId = await ctx.db.insert("tabSnapshots", {
      sessionId: args.sessionId,
      tokenIdentifier: identity.tokenIdentifier,
      url: args.url,
      title: args.title,
      capturedAt: Date.now(),
    });

    // Record the decision
    return await ctx.db.insert("tabDecisions", {
      sessionId: args.sessionId,
      tokenIdentifier: identity.tokenIdentifier,
      snapshotId,
      url: args.url,
      domain: args.domain,
      title: args.title,
      decision: args.decision,
      source: args.source,
      reasoning: args.reasoning,
      decidedAt: Date.now(),
    });
  },
});

// Manual override of a previous AI decision
export const overrideDecision = mutation({
  args: {
    decisionId: v.id("tabDecisions"),
    newDecision: v.union(v.literal("allowed"), v.literal("blocked")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const existing = await ctx.db.get(args.decisionId);
    if (!existing || existing.tokenIdentifier !== identity.tokenIdentifier) {
      throw new Error("Decision not found");
    }

    await ctx.db.patch(args.decisionId, {
      decision: args.newDecision,
      source: "manual",
      decidedAt: Date.now(),
    });
  },
});
