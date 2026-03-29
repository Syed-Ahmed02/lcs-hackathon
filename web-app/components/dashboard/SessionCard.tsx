"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer, Circle } from "lucide-react";

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

  const durationMin = activeSession
    ? Math.round((Date.now() - activeSession.startedAt) / 60_000)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Active Session</CardTitle>
          <Badge variant={activeSession ? "default" : "secondary"} className="gap-1.5">
            <Circle
              className={`size-2 fill-current ${activeSession ? "text-green-400" : "text-muted-foreground"}`}
            />
            {activeSession ? "Live" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {activeSession ? (
          <div className="flex flex-col gap-4">
            {activeSession.goalDescription && (
              <p className="text-sm text-muted-foreground">
                Goal:{" "}
                <span className="font-medium text-foreground">
                  {activeSession.goalDescription}
                </span>
              </p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="size-4" />
              <span>
                Running for{" "}
                <span className="font-semibold text-foreground">{durationMin} min</span>
              </span>
            </div>
            <Button variant="destructive" size="sm" onClick={handleEnd} className="w-fit">
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
                placeholder="What are you focusing on? (optional)"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !starting && handleStart()}
                className="max-w-sm"
              />
              <Button onClick={handleStart} disabled={starting} size="sm">
                {starting ? "Starting…" : "Start"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
