"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Classify a tab and record the decision — called from the extension background worker.
// Uses Node runtime to call the OpenRouter API (same as aiActions.classifyTab).
export const classifyAndRecord = action({
  args: {
    extensionToken: v.string(),
    sessionId: v.id("focusSessions"),
    url: v.string(),
    domain: v.string(),
    title: v.string(),
    goalDescription: v.optional(v.string()),
    pageContentExcerpt: v.optional(v.string()),
    contentHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate token server-side
    const userId = await ctx.runQuery(internal.extensionApi.resolveToken, {
      extensionToken: args.extensionToken,
    });
    if (!userId) throw new Error("Invalid extension token");

    // Run AI classification
    const { decision, reasoning } = (await ctx.runAction(internal.aiActions.classifyTab, {
      url: args.url,
      title: args.title,
      domain: args.domain,
      goalDescription: args.goalDescription,
      pageContentExcerpt: args.pageContentExcerpt,
    })) as { decision: "allowed" | "blocked"; reasoning?: string };

    // Persist the decision
    const decisionId = await ctx.runMutation(
      internal.extensionApi.recordTabDecisionInternal,
      {
        userId,
        sessionId: args.sessionId,
        url: args.url,
        domain: args.domain,
        title: args.title,
        decision,
        source: "ai",
        reasoning,
        pageContentExcerpt: args.pageContentExcerpt,
        contentHash: args.contentHash,
      },
    );

    return { decision, reasoning, decisionId };
  },
});
