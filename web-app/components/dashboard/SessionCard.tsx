"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer, Circle, Play, Square } from "lucide-react";

function LiveDuration({ startedAt }: { startedAt: number }) {
  const [min, setMin] = useState(() => Math.round((Date.now() - startedAt) / 60_000));

  useEffect(() => {
    const id = setInterval(() => {
      setMin(Math.round((Date.now() - startedAt) / 60_000));
    }, 15_000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Timer className="size-3.5" />
      <span>
        Running for{" "}
        <span className="font-semibold tabular-nums text-foreground">{min} min</span>
      </span>
    </div>
  );
}

export function SessionCard() {
  const activeSession = useQuery(api.sessions.getActiveSession);
  const startSession = useMutation(api.sessions.startSession);
  const endSession = useMutation(api.sessions.endSession);
  const [goal, setGoal] = useState("");
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    try {
      await startSession({ goalDescription: goal || undefined });
      setGoal("");
    } finally {
      setStarting(false);
    }
  };

  const handleEnd = async () => {
    if (!activeSession) return;
    await endSession({ sessionId: activeSession._id });
  };

  if (activeSession === undefined) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Active Session</CardTitle>
          <Badge variant={activeSession ? "default" : "secondary"} className="gap-1.5">
            <Circle
              className={`size-1.5 fill-current ${activeSession ? "text-primary" : "text-muted-foreground"}`}
            />
            {activeSession ? "Live" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {activeSession ? (
          <div className="flex flex-col gap-3">
            {activeSession.goalDescription && (
              <p className="text-sm">
                <span className="font-medium text-foreground">
                  {activeSession.goalDescription}
                </span>
              </p>
            )}
            <LiveDuration startedAt={activeSession.startedAt} />
            <Button variant="destructive" size="sm" onClick={handleEnd} className="w-fit gap-1.5">
              <Square className="size-3" />
              End Session
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Start a focus session to track your tab activity.
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="What are you focusing on?"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !starting && handleStart()}
                className="max-w-sm"
              />
              <Button onClick={handleStart} disabled={starting} size="sm" className="gap-1.5">
                <Play className="size-3" />
                {starting ? "Starting…" : "Start"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
