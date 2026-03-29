"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function TabEventsList() {
  const decisions = useQuery(api.tabDecisions.getRecentDecisions, { limit: 20 });

  if (decisions === undefined) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 font-semibold">Recent Tab Decisions</h3>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-muted h-8 animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 font-semibold">Recent Tab Decisions</h3>
      {decisions.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No tab decisions yet. Start a session and open some tabs.
        </p>
      ) : (
        <div className="space-y-2">
          {decisions.map((d) => (
            <div
              key={d._id}
              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{d.title || d.domain}</p>
                <p className="text-muted-foreground truncate text-xs">{d.domain}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    d.decision === "blocked"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-green-500/10 text-green-600 dark:text-green-400"
                  }`}
                >
                  {d.decision}
                </span>
                <span className="text-muted-foreground text-xs">
                  {d.source === "manual" ? "manual" : "ai"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
