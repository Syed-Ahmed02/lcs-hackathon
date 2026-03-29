import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

type EvaluateResult = {
  decision: "blocked" | "allowed";
  reasoning?: string;
  decisionId: Id<"tabDecisions">;
};

export const evaluateTabPipeline = internalAction({
  args: {
    userId: v.string(),
    sessionId: v.id("focusSessions"),
    url: v.string(),
    domain: v.string(),
    title: v.string(),
    pageContentExcerpt: v.optional(v.string()),
    contentHash: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<EvaluateResult> => {
    const session: Doc<"focusSessions"> | null = await ctx.runQuery(
      internal.sessions.getSessionInternal,
      {
        sessionId: args.sessionId,
      },
    );
    if (!session || session.userId !== args.userId || session.status !== "active") {
      throw new Error("Session not found or not active");
    }

    const classification: {
      decision: "blocked" | "allowed";
      reasoning?: string;
    } = await ctx.runAction(internal.aiActions.classifyTab, {
      url: args.url,
      title: args.title,
      domain: args.domain,
      goalDescription: session.goalDescription,
      pageContentExcerpt: args.pageContentExcerpt,
    });

    const decision: "blocked" | "allowed" =
      classification.decision === "blocked" ? "blocked" : "allowed";

    const decisionId: Id<"tabDecisions"> = await ctx.runMutation(
      internal.tabDecisions.recordTabDecisionInternal,
      {
        userId: args.userId,
        sessionId: args.sessionId,
        url: args.url,
        domain: args.domain,
        title: args.title,
        decision,
        source: "ai",
        reasoning: classification.reasoning,
        pageContentExcerpt: args.pageContentExcerpt,
        contentHash: args.contentHash,
        confidence: undefined,
      },
    );

    return {
      decision,
      reasoning: classification.reasoning,
      decisionId,
    };
  },
});
