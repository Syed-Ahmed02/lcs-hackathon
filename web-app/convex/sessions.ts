import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireUserId } from "./lib/user";

// Get the currently active focus session for the signed-in user
export const getActiveSession = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = requireUserId(identity);

    return await ctx.db
      .query("focusSessions")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("status", "active"),
      )
      .order("desc")
      .first();
  },
});

// Get the most recent sessions for the signed-in user
export const getRecentSessions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = requireUserId(identity);

    return await ctx.db
      .query("focusSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit ?? 10);
  },
});

// Start a new focus session
export const startSession = mutation({
  args: { goalDescription: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = requireUserId(identity);

    // End any currently active session first
    const active = await ctx.db
      .query("focusSessions")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("status", "active"),
      )
      .first();

    if (active) {
      await ctx.db.patch(active._id, { status: "abandoned", endedAt: Date.now() });
    }

    return await ctx.db.insert("focusSessions", {
      userId,
      startedAt: Date.now(),
      goalDescription: args.goalDescription,
      status: "active",
    });
  },
});

// End the active focus session
export const endSession = mutation({
  args: { sessionId: v.id("focusSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = requireUserId(identity);

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, { status: "completed", endedAt: Date.now() });

    await ctx.scheduler.runAfter(0, internal.extensionApi.computeSessionRollupInternal, {
      userId,
      sessionId: args.sessionId,
    });
  },
});

export const getSessionInternal = internalQuery({
  args: { sessionId: v.id("focusSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});

export const getActiveSessionForUserInternal = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("focusSessions")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", args.userId).eq("status", "active"),
      )
      .order("desc")
      .first();
  },
});

export const startSessionInternal = internalMutation({
  args: { userId: v.string(), goalDescription: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const active = await ctx.db
      .query("focusSessions")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", args.userId).eq("status", "active"),
      )
      .first();

    if (active) {
      await ctx.db.patch(active._id, { status: "abandoned", endedAt: Date.now() });
    }

    return await ctx.db.insert("focusSessions", {
      userId: args.userId,
      startedAt: Date.now(),
      goalDescription: args.goalDescription,
      status: "active",
    });
  },
});

export const endSessionInternal = internalMutation({
  args: { userId: v.string(), sessionId: v.id("focusSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== args.userId) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, { status: "completed", endedAt: Date.now() });
  },
});
