"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const decisionConfig = {
  blocked: { label: "Blocked", color: "var(--color-destructive)" },
  allowed: { label: "Allowed", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

const distractionConfig = {
  rate: { label: "Distraction Rate", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

const domainConfig = {
  count: { label: "Blocked", color: "var(--color-destructive)" },
} satisfies ChartConfig;

export function InsightsCharts() {
  const insights = useQuery(api.insights.getInsightHistory, { limit: 20 });

  if (insights === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="col-span-full h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            No insight data yet. Complete a session to generate insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Chronological order (oldest first) for trend charts
  const chronological = [...insights].reverse();

  const decisionTrendData = chronological.map((r) => ({
    date: formatDate(r.periodStart),
    blocked: r.blockedCount,
    allowed: r.allowedCount,
  }));

  const distractionTrendData = chronological.map((r) => ({
    date: formatDate(r.periodStart),
    rate: Math.round(r.distractionRate * 100),
  }));

  // Aggregate top blocked domains across all sessions
  const domainTotals: Record<string, number> = {};
  for (const r of insights) {
    for (const d of r.topBlockedDomains) {
      domainTotals[d.domain] = (domainTotals[d.domain] ?? 0) + d.count;
    }
  }
  const topDomains = Object.entries(domainTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([domain, count]) => ({ domain, count }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Blocked vs Allowed Area Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Blocked vs Allowed Over Time</CardTitle>
          <CardDescription>Tab decisions per session, stacked over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={decisionConfig} className="h-64 w-full">
            <AreaChart data={decisionTrendData}>
              <defs>
                <linearGradient id="fillBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-destructive)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-destructive)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fillAllowed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Area
                type="monotone"
                dataKey="allowed"
                stroke="var(--color-chart-1)"
                fill="url(#fillAllowed)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="blocked"
                stroke="var(--color-destructive)"
                fill="url(#fillBlocked)"
                strokeWidth={2}
                dot={false}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Distraction Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Distraction Rate Trend</CardTitle>
          <CardDescription>Percentage of tabs blocked per session</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={distractionConfig} className="h-56 w-full">
            <LineChart data={distractionTrendData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                unit="%"
                domain={[0, 100]}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [`${value}%`, "Distraction Rate"]}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--color-chart-4)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--color-chart-4)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Blocked Domains */}
      <Card>
        <CardHeader>
          <CardTitle>Top Blocked Domains</CardTitle>
          <CardDescription>Most frequently blocked sites across all sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {topDomains.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blocked domains recorded.</p>
          ) : (
            <ChartContainer config={domainConfig} className="h-56 w-full">
              <BarChart data={topDomains} layout="vertical" barSize={18}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="domain"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={110}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-destructive)" radius={3} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
