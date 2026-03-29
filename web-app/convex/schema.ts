import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // A focus session started by the user via the extension
  focusSessions: defineTable({
    tokenIdentifier: v.string(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    goalDescription: v.optional(v.string()),
    // "active" | "completed" | "abandoned"
    status: v.string(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_token_and_status", ["tokenIdentifier", "status"]),

  // A point-in-time snapshot of a browser tab
  tabSnapshots: defineTable({
    sessionId: v.id("focusSessions"),
    tokenIdentifier: v.string(),
    url: v.string(),
    title: v.string(),
    capturedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_token", ["tokenIdentifier"]),

  // An allow/block decision for a tab, either by AI or manual override
  tabDecisions: defineTable({
    sessionId: v.id("focusSessions"),
    tokenIdentifier: v.string(),
    snapshotId: v.optional(v.id("tabSnapshots")),
    url: v.string(),
    domain: v.string(),
    title: v.string(),
    // "allowed" | "blocked"
    decision: v.string(),
    // "ai" | "manual"
    source: v.string(),
    reasoning: v.optional(v.string()),
    decidedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_token_and_decided_at", ["tokenIdentifier", "decidedAt"]),

  // Aggregated insight rollups per session or per time window
  insightRollups: defineTable({
    tokenIdentifier: v.string(),
    sessionId: v.optional(v.id("focusSessions")),
    // "session" | "daily" | "weekly"
    period: v.string(),
    periodStart: v.number(),
    periodEnd: v.number(),
    totalDecisions: v.number(),
    blockedCount: v.number(),
    allowedCount: v.number(),
    topBlockedDomains: v.array(v.object({ domain: v.string(), count: v.number() })),
    distractionRate: v.number(),
    summaryText: v.optional(v.string()),
    computedAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_token_and_period", ["tokenIdentifier", "period"])
    .index("by_session", ["sessionId"]),

  // Short-lived codes for linking the extension to a signed-in user
  extensionLinkCodes: defineTable({
    tokenIdentifier: v.string(),
    code: v.string(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_token", ["tokenIdentifier"]),
});
