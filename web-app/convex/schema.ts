import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // A focus session started by the user via the extension
  focusSessions: defineTable({
    /** WorkOS user id (JWT subject); ties all rows to one user. */
    userId: v.string(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    goalDescription: v.optional(v.string()),
    // "active" | "completed" | "abandoned"
    status: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"]),

  // A point-in-time snapshot of a browser tab (incl. optional page text for classification)
  tabSnapshots: defineTable({
    sessionId: v.id("focusSessions"),
    userId: v.string(),
    url: v.string(),
    title: v.string(),
    capturedAt: v.number(),
    pageContentExcerpt: v.optional(v.string()),
    contentHash: v.optional(v.string()),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"]),

  // An allow/block decision for a tab, either by AI or manual override
  tabDecisions: defineTable({
    sessionId: v.id("focusSessions"),
    userId: v.string(),
    snapshotId: v.optional(v.id("tabSnapshots")),
    url: v.string(),
    domain: v.string(),
    title: v.string(),
    pageContentExcerpt: v.optional(v.string()),
    // "allowed" | "blocked"
    decision: v.string(),
    // "ai" | "manual"
    source: v.string(),
    reasoning: v.optional(v.string()),
    confidence: v.optional(v.number()),
    decidedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"])
    .index("by_user_and_decided_at", ["userId", "decidedAt"]),

  // Aggregated insight rollups per session or per time window
  insightRollups: defineTable({
    userId: v.string(),
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
    .index("by_user", ["userId"])
    .index("by_user_and_period", ["userId", "period"])
    .index("by_session", ["sessionId"]),

  // Short-lived codes for linking the browser extension to this userId
  extensionLinkCodes: defineTable({
    userId: v.string(),
    code: v.string(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    extensionToken: v.optional(v.string()),
  })
    .index("by_code", ["code"])
    .index("by_user", ["userId"])
    .index("by_token", ["extensionToken"]),

  // Bearer tokens issued after a successful link-code exchange (extension HTTP API)
  extensionAuthTokens: defineTable({
    userId: v.string(),
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),
});
