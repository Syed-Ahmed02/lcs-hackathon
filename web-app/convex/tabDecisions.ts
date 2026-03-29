import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./lib/user";

// Get recent tab decisions for the signed-in user (across all sessions)
export const getRecentDecisions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = requireUserId(identity);

    return await ctx.db
      .query("tabDecisions")
      .withIndex("by_user_and_decided_at", (q) => q.eq("userId", userId))
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
    const userId = requireUserId(identity);

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) return [];

    return await ctx.db
      .query("tabDecisions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(100);
  },
});

// Record a tab snapshot and AI/manual decision (called from web or extension with auth)
export const recordTabDecision = mutation({
  args: {
    sessionId: v.id("focusSessions"),
    url: v.string(),
    domain: v.string(),
    title: v.string(),
    decision: v.union(v.literal("allowed"), v.literal("blocked")),
    source: v.union(v.literal("ai"), v.literal("manual")),
    reasoning: v.optional(v.string()),
    pageContentExcerpt: v.optional(v.string()),
    contentHash: v.optional(v.string()),
    confidence: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = requireUserId(identity);

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    const snapshotId = await ctx.db.insert("tabSnapshots", {
      sessionId: args.sessionId,
      userId,
      url: args.url,
      title: args.title,
      capturedAt: Date.now(),
      pageContentExcerpt: args.pageContentExcerpt,
      contentHash: args.contentHash,
    });

    return await ctx.db.insert("tabDecisions", {
      sessionId: args.sessionId,
      userId,
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

// Manual override of a previous AI decision
export const overrideDecision = mutation({
  args: {
    decisionId: v.id("tabDecisions"),
    newDecision: v.union(v.literal("allowed"), v.literal("blocked")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = requireUserId(identity);

    const existing = await ctx.db.get(args.decisionId);
    if (!existing || existing.userId !== userId) {
      throw new Error("Decision not found");
    }

    await ctx.db.patch(args.decisionId, {
      decision: args.newDecision,
      source: "manual",
      decidedAt: Date.now(),
    });
  },
});

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
    pageContentExcerpt: v.optional(v.string()),
    contentHash: v.optional(v.string()),
    confidence: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== args.userId) {
      throw new Error("Session not found");
    }

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

export const overrideDecisionInternal = internalMutation({
  args: {
    userId: v.string(),
    decisionId: v.id("tabDecisions"),
    newDecision: v.union(v.literal("allowed"), v.literal("blocked")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.decisionId);
    if (!existing || existing.userId !== args.userId) {
      throw new Error("Decision not found");
    }

    await ctx.db.patch(args.decisionId, {
      decision: args.newDecision,
      source: "manual",
      decidedAt: Date.now(),
    });
  },
});
