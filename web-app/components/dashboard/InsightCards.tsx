"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, ShieldCheck, MousePointerClick, Sparkles } from "lucide-react";

const statConfig = [
  {
    key: "distractionRate",
    label: "Distraction Rate",
    icon: ShieldAlert,
    color: "text-destructive",
    bg: "bg-destructive/8",
  },
  {
    key: "blockedCount",
    label: "Tabs Blocked",
    icon: ShieldAlert,
    color: "text-chart-4 dark:text-chart-2",
    bg: "bg-chart-4/8 dark:bg-chart-2/8",
  },
  {
    key: "allowedCount",
    label: "Tabs Allowed",
    icon: ShieldCheck,
    color: "text-chart-3 dark:text-chart-1",
    bg: "bg-chart-3/8 dark:bg-chart-1/8",
  },
  {
    key: "totalDecisions",
    label: "Total Decisions",
    icon: MousePointerClick,
    color: "text-primary",
    bg: "bg-primary/8",
  },
] as const;

export function InsightCards() {
  const insight = useQuery(api.insights.getLatestInsights);

  if (insight === undefined) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!insight) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Complete a session to see your insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  const values: Record<string, string> = {
    distractionRate: `${(insight.distractionRate * 100).toFixed(0)}%`,
    blockedCount: String(insight.blockedCount),
    allowedCount: String(insight.allowedCount),
    totalDecisions: String(insight.totalDecisions),
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statConfig.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.key}>
              <CardContent className="pt-5 pb-4">
                <div className={`mb-2.5 inline-flex rounded-lg p-2 ${c.bg}`}>
                  <Icon className={`size-4 ${c.color}`} />
                </div>
                <p className="text-xl font-bold tabular-nums">{values[c.key]}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {insight.topBlockedDomains.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Top Distraction Domains</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {insight.topBlockedDomains.map((d) => (
                <div
                  key={d.domain}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{d.domain}</span>
                  <span className="font-semibold tabular-nums">{d.count}×</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {insight.summaryText && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-primary" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {insight.summaryText}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
