"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function formatDuration(startedAt: number, endedAt?: number) {
  const ms = (endedAt ?? Date.now()) - startedAt;
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusVariant: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className:
      "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400",
  },
  completed: {
    label: "Completed",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  abandoned: {
    label: "Abandoned",
    className: "border-muted bg-muted text-muted-foreground",
  },
};

export function SessionHistory() {
  const sessions = useQuery(api.sessions.getRecentSessions, { limit: 10 });

  if (sessions === undefined) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Session History</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Session History</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => {
              const status = statusVariant[s.status] ?? statusVariant.abandoned;
              return (
                <div key={s._id} className="rounded-md border px-3 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {s.goalDescription ?? "Focus session"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(s.startedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(s.startedAt, s.endedAt)}
                      </span>
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
