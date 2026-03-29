import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getUserByExtensionToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("extensionAuthTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!row || row.expiresAt < Date.now()) return null;
    return { userId: row.userId };
  },
});
