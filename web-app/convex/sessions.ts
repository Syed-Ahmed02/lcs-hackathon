import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get the currently active focus session for the signed-in user
export const getActiveSession = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("focusSessions")
      .withIndex("by_token_and_status", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier).eq("status", "active"),
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

    return await ctx.db
      .query("focusSessions")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
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

    // End any currently active session first
    const active = await ctx.db
      .query("focusSessions")
      .withIndex("by_token_and_status", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier).eq("status", "active"),
      )
      .first();

    if (active) {
      await ctx.db.patch(active._id, { status: "abandoned", endedAt: Date.now() });
    }

    return await ctx.db.insert("focusSessions", {
      tokenIdentifier: identity.tokenIdentifier,
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

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.tokenIdentifier !== identity.tokenIdentifier) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, { status: "completed", endedAt: Date.now() });
  },
});
