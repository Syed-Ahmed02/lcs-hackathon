"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

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
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${activeSession ? "animate-pulse bg-green-500" : "bg-muted-foreground"}`}
        />
        <h3 className="font-semibold">
          {activeSession ? "Session Active" : "No Active Session"}
        </h3>
      </div>

      {activeSession ? (
        <div className="flex flex-col gap-3">
          {activeSession.goalDescription && (
            <p className="text-muted-foreground text-sm">
              Goal: <span className="text-foreground">{activeSession.goalDescription}</span>
            </p>
          )}
          <p className="text-muted-foreground text-sm">
            Duration:{" "}
            <span className="text-foreground font-medium">{durationMin} min</span>
          </p>
          <button
            onClick={handleEnd}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 mt-1 w-fit rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          >
            End Session
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="What are you focusing on? (optional)"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleStart}
            disabled={starting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-fit rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {starting ? "Starting…" : "Start Session"}
          </button>
        </div>
      )}
    </div>
  );
}
