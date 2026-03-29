"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

// Summarize a completed session using OpenRouter and store the result
export const summarizeSession = internalAction({
  args: {
    rollupId: v.id("insightRollups"),
    sessionId: v.id("focusSessions"),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return;

    const rollup = (await ctx.runQuery(internal.aiActions.getRollup, {
      rollupId: args.rollupId,
    })) as Doc<"insightRollups"> | null;
    if (!rollup) return;

    const durationMin = Math.round((rollup.periodEnd - rollup.periodStart) / 60_000);
    const topDomains = rollup.topBlockedDomains
      .map((d) => `${d.domain} (${d.count}x)`)
      .join(", ");

    const prompt = [
      `You are a productivity coach summarizing a focus session.`,
      `Session duration: ${durationMin} minutes.`,
      `Total tab decisions: ${rollup.totalDecisions} (${rollup.blockedCount} blocked, ${rollup.allowedCount} allowed).`,
      `Distraction rate: ${(rollup.distractionRate * 100).toFixed(0)}%.`,
      topDomains ? `Top blocked domains: ${topDomains}.` : "",
      `Write a 2-3 sentence encouraging summary of this session's focus performance.`,
    ]
      .filter(Boolean)
      .join(" ");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
      }),
    });

    if (!response.ok) return;

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const summaryText = data.choices?.[0]?.message?.content?.trim();
    if (!summaryText) return;

    await ctx.runMutation(internal.insights.patchRollupSummary, {
      rollupId: args.rollupId,
      summaryText,
    });
  },
});

// Classify whether a tab URL/title is a distraction given a focus goal
export const classifyTab = internalAction({
  args: {
    url: v.string(),
    title: v.string(),
    domain: v.string(),
    goalDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return { decision: "allowed" as const, reasoning: "No API key configured" };

    const goal = args.goalDescription ?? "general productivity";
    const prompt = [
      `You are a focus assistant helping someone stay on task.`,
      `Their goal: "${goal}".`,
      `They just switched to a tab: "${args.title}" (${args.domain}).`,
      `Reply with exactly one word — "blocked" or "allowed" — followed by a colon and a short reason (max 15 words).`,
      `Example: blocked: social media is off-task during coding sessions.`,
    ].join(" ");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 60,
      }),
    });

    if (!response.ok) return { decision: "allowed" as const, reasoning: "Classification failed" };

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim().toLowerCase() ?? "";

    const decision = text.startsWith("blocked") ? ("blocked" as const) : ("allowed" as const);
    const reasoning = text.includes(":") ? text.split(":").slice(1).join(":").trim() : undefined;

    return { decision, reasoning };
  },
});

// Internal query to fetch a rollup (used by the action above)
import { internalQuery } from "./_generated/server";

export const getRollup = internalQuery({
  args: { rollupId: v.id("insightRollups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.rollupId);
  },
});
