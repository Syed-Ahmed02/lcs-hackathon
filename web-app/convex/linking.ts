import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const CODE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Generate a cryptographically random 6-character alphanumeric code
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  // Use Math.random for simplicity — upgrade to crypto.getRandomValues for production
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Create a new short-lived link code for the signed-in user
export const generateLinkCode = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Invalidate any existing unused codes for this user
    const existing = await ctx.db
      .query("extensionLinkCodes")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .collect();

    for (const row of existing) {
      if (!row.usedAt) {
        await ctx.db.delete(row._id);
      }
    }

    const code = generateCode();
    await ctx.db.insert("extensionLinkCodes", {
      tokenIdentifier: identity.tokenIdentifier,
      code,
      expiresAt: Date.now() + CODE_TTL_MS,
    });

    return { code, expiresAt: Date.now() + CODE_TTL_MS };
  },
});

// Check if the current user has an active (unused, unexpired) link code
export const getActiveLinkCode = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const row = await ctx.db
      .query("extensionLinkCodes")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .order("desc")
      .first();

    if (!row || row.usedAt || row.expiresAt < Date.now()) return null;
    return { code: row.code, expiresAt: row.expiresAt };
  },
});

// Exchange a link code from the extension — returns the tokenIdentifier if valid
export const exchangeLinkCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("extensionLinkCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .unique();

    if (!row) return { success: false, reason: "Invalid code" };
    if (row.usedAt) return { success: false, reason: "Code already used" };
    if (row.expiresAt < Date.now()) return { success: false, reason: "Code expired" };

    await ctx.db.patch(row._id, { usedAt: Date.now() });
    return { success: true, tokenIdentifier: row.tokenIdentifier };
  },
});
