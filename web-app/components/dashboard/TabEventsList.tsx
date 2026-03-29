"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, User } from "lucide-react";

export function TabEventsList() {
  const decisions = useQuery(api.tabDecisions.getRecentDecisions, { limit: 20 });

  if (decisions === undefined) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Recent Tab Decisions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Recent Tab Decisions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {decisions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tab decisions yet. Start a session and open some tabs.
          </p>
        ) : (
          <div className="space-y-1.5">
            {decisions.map((d) => (
              <div
                key={d._id}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.title || d.domain}</p>
                  <p className="truncate text-xs text-muted-foreground">{d.domain}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge
                    variant={d.decision === "blocked" ? "destructive" : "outline"}
                    className={
                      d.decision === "allowed"
                        ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                        : ""
                    }
                  >
                    {d.decision}
                  </Badge>
                  <span className="text-muted-foreground" title={d.source}>
                    {d.source === "manual" ? (
                      <User className="size-3" />
                    ) : (
                      <Bot className="size-3" />
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
