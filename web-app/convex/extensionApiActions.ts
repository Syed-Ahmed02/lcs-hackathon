"use node";

import { action, type ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

type ClassifyResult = {
  decision: "allowed" | "blocked";
  reasoning?: string;
  decisionId: Id<"tabDecisions">;
};

const BROAD_CONTENT_DOMAINS = [
  "youtube.com",
  "youtu.be",
  "reddit.com",
  "x.com",
  "twitter.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "linkedin.com",
] as const;

const GOAL_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "be",
  "do",
  "for",
  "going",
  "have",
  "i",
  "im",
  "in",
  "is",
  "me",
  "my",
  "need",
  "no",
  "of",
  "on",
  "so",
  "study",
  "studying",
  "that",
  "the",
  "this",
  "to",
  "want",
  "with",
]);

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function extractGoalKeywords(goalDescription: string | undefined): string[] {
  if (!goalDescription) return [];
  const tokens = normalizeText(goalDescription)
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !GOAL_STOP_WORDS.has(token));

  return [...new Set(tokens)];
}

function hostMatchesBroadPlatform(domain: string): boolean {
  const host = domain.toLowerCase();
  return BROAD_CONTENT_DOMAINS.some(
    (candidate) => host === candidate || host.endsWith(`.${candidate}`),
  );
}

function shouldAllowBroadPlatformPage(
  url: string,
  title: string,
  domain: string,
  goalDescription: string | undefined,
  pageContentExcerpt: string | undefined,
): boolean {
  if (!hostMatchesBroadPlatform(domain)) return false;

  const keywords = extractGoalKeywords(goalDescription);
  if (keywords.length === 0) return false;

  const haystack = normalizeText(
    `${url} ${title} ${pageContentExcerpt ?? ""}`.slice(0, 4000),
  );

  const matchingKeywords = keywords.filter((keyword) => haystack.includes(keyword));
  return matchingKeywords.length >= 1;
}

// ---------------------------------------------------------------------------
// Classification helper — inlined to avoid cross-Node-action ctx.runAction calls
// ---------------------------------------------------------------------------

async function classifyPageAlignment(
  url: string,
  title: string,
  domain: string,
  goalDescription: string | undefined,
  pageContentExcerpt: string | undefined,
): Promise<{ decision: "allowed" | "blocked"; reasoning: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { decision: "allowed", reasoning: "No API key configured" };
  }

  if (
    shouldAllowBroadPlatformPage(
      url,
      title,
      domain,
      goalDescription,
      pageContentExcerpt,
    )
  ) {
    return {
      decision: "allowed",
      reasoning: "Relevant learning content on a broad platform",
    };
  }

  const goal = goalDescription?.trim() || "general productivity";
  const content = pageContentExcerpt?.trim() || "(no page content available)";

  const systemPrompt =
    `You are a focus session enforcer. Decide if a webpage is aligned with the user's session goal. ` +
    `Reply with valid JSON only: {"decision":"allowed","reasoning":"..."} or {"decision":"blocked","reasoning":"..."}. ` +
    `Keep reasoning under 15 words. ` +
    `Allow relevant educational, reference, research, or task-supporting pages even on usually distracting platforms. ` +
    `Do not block a page only because the site is YouTube, Reddit, or social media if the title/content clearly matches the goal. ` +
    `Use the page title and content as stronger evidence than the domain. ` +
    `Block pages that are entertainment, scrolling, or off-goal.`;

  const userPrompt =
    `Session goal: "${goal}"\n` +
    `Page: "${title}" (${domain})\n` +
    `URL: ${url}\n` +
    `Content excerpt: ${content.slice(0, 1500)}`;

  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://focus-guard.app",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 80,
        temperature: 0,
        response_format: { type: "json_object" },
      }),
    });
  } catch (err) {
    console.error("[FocusGuard] OpenRouter fetch error:", err);
    return { decision: "allowed", reasoning: "Network error during classification" };
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[FocusGuard] OpenRouter error:", response.status, body);
    return { decision: "allowed", reasoning: "Classification service error" };
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
  console.log("[FocusGuard] Classification raw response:", raw);

  try {
    const parsed = JSON.parse(raw) as { decision?: string; reasoning?: string };
    const decision =
      parsed.decision === "blocked" ? ("blocked" as const) : ("allowed" as const);
    return { decision, reasoning: parsed.reasoning ?? "" };
  } catch {
    // Fallback: scan the raw string
    const decision = raw.toLowerCase().includes('"blocked"')
      ? ("blocked" as const)
      : ("allowed" as const);
    return { decision, reasoning: "Could not parse model response" };
  }
}

// ---------------------------------------------------------------------------
// Public action — called from the extension background worker
// ---------------------------------------------------------------------------

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
  handler: async (ctx: ActionCtx, args): Promise<ClassifyResult> => {
    // Validate token server-side
    const userId: string | null = await ctx.runQuery(internal.extensionApi.resolveToken, {
      extensionToken: args.extensionToken,
    });
    if (!userId) throw new Error("Invalid extension token");

    // Classify inline (same Node runtime — no cross-action call needed)
    const { decision, reasoning } = await classifyPageAlignment(
      args.url,
      args.title,
      args.domain,
      args.goalDescription,
      args.pageContentExcerpt,
    );

    // Persist the decision
    const decisionId: Id<"tabDecisions"> = await ctx.runMutation(
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
