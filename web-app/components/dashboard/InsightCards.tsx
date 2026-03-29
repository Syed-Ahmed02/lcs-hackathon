"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function InsightCards() {
  const insight = useQuery(api.insights.getLatestInsights);

  if (insight === undefined) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-24 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <p className="text-muted-foreground text-sm">
          Complete a session to see your insights.
        </p>
      </div>
    );
  }

  const cards = [
    {
      label: "Distraction Rate",
      value: `${(insight.distractionRate * 100).toFixed(0)}%`,
      sub: "of tabs blocked",
    },
    { label: "Tabs Blocked", value: String(insight.blockedCount), sub: "last session" },
    { label: "Tabs Allowed", value: String(insight.allowedCount), sub: "last session" },
    {
      label: "Total Decisions",
      value: String(insight.totalDecisions),
      sub: "last session",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-4">
            <p className="text-muted-foreground text-xs">{c.label}</p>
            <p className="mt-1 text-2xl font-bold">{c.value}</p>
            <p className="text-muted-foreground text-xs">{c.sub}</p>
          </div>
        ))}
      </div>

      {insight.topBlockedDomains.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h4 className="mb-3 text-sm font-semibold">Top Distraction Domains</h4>
          <div className="space-y-2">
            {insight.topBlockedDomains.map((d) => (
              <div key={d.domain} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{d.domain}</span>
                <span className="font-medium">{d.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {insight.summaryText && (
        <div className="rounded-xl border bg-card p-5">
          <h4 className="mb-2 text-sm font-semibold">AI Summary</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">{insight.summaryText}</p>
        </div>
      )}
    </div>
  );
}
