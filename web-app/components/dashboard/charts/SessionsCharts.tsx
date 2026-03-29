"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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

const durationConfig = {
  duration: { label: "Duration (min)", color: "var(--color-primary)" },
} satisfies ChartConfig;

const statusConfig = {
  completed: { label: "Completed", color: "var(--color-chart-1)" },
  abandoned: { label: "Abandoned", color: "var(--color-chart-3)" },
  active: { label: "Active", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

export function SessionsCharts() {
  const sessions = useQuery(api.sessions.getRecentSessions, { limit: 30 });

  if (sessions === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="col-span-full h-72 rounded-xl md:col-span-2" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            No sessions yet. Start a focus session to see your data here.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Duration bar data — reversed so oldest is on the left
  const durationData = [...sessions]
    .reverse()
    .filter((s) => s.endedAt)
    .map((s) => ({
      date: formatDate(s.startedAt),
      duration: Math.round(((s.endedAt ?? s.startedAt) - s.startedAt) / 60_000),
    }));

  // Status pie data
  const statusCounts = sessions.reduce<Record<string, number>>(
    (acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    fill: statusConfig[status as keyof typeof statusConfig]?.color ?? "var(--color-muted)",
  }));

  // Sessions per day bar data
  const perDayCounts = sessions.reduce<Record<string, number>>((acc, s) => {
    const day = formatDate(s.startedAt);
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});
  const perDayData = Object.entries(perDayCounts)
    .map(([date, count]) => ({ date, count }))
    .slice(-14); // last 14 days

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Session Duration */}
      <Card>
        <CardHeader>
          <CardTitle>Session Duration</CardTitle>
          <CardDescription>Length of each completed session in minutes</CardDescription>
        </CardHeader>
        <CardContent>
          {durationData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No completed sessions yet.
            </p>
          ) : (
            <ChartContainer config={durationConfig} className="h-56 w-full">
              <BarChart data={durationData} barSize={28}>
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
                  unit="m"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="duration" fill="var(--color-primary)" radius={4} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
          <CardDescription>Distribution of session outcomes</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <ChartContainer config={statusConfig} className="h-56 w-full">
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="status" hideLabel />}
              />
              <Pie
                data={pieData}
                dataKey="count"
                nameKey="status"
                innerRadius={55}
                outerRadius={90}
                strokeWidth={2}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="status" />}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Sessions Per Day */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Sessions Per Day</CardTitle>
          <CardDescription>How many focus sessions you logged each day</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ count: { label: "Sessions", color: "var(--color-chart-2)" } }}
            className="h-56 w-full"
          >
            <BarChart data={perDayData} barSize={28}>
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
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-chart-2)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
