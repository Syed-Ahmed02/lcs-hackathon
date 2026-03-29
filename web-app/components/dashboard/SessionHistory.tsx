"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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

export function SessionHistory() {
  const sessions = useQuery(api.sessions.getRecentSessions, { limit: 10 });

  if (sessions === undefined) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 font-semibold">Session History</h3>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-14 animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 font-semibold">Session History</h3>
      {sessions.length === 0 ? (
        <p className="text-muted-foreground text-sm">No sessions recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s._id} className="rounded-md border px-3 py-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {s.goalDescription ?? "Focus session"}
                  </p>
                  <p className="text-muted-foreground text-xs">{formatDate(s.startedAt)}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    {formatDuration(s.startedAt, s.endedAt)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.status === "active"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : s.status === "completed"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
