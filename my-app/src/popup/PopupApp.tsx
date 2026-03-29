import { useCallback, useEffect, useState } from "react";
import { buildBrowsingSummary } from "../lib/summary.ts";
import { loadSession, saveSession } from "../lib/storage.ts";
import { tabStatusForTab } from "../lib/tab-status.ts";
import type { FocusSessionState, TabStatus } from "../lib/types.ts";

function statusStyles(status: TabStatus): string {
  switch (status) {
    case "blocked":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "checking":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-primary/10 text-primary border-primary/25";
  }
}

export function PopupApp() {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
  const [summary, setSummary] = useState("");
  const [goal, setGoal] = useState("");
  const [session, setSession] = useState<FocusSessionState | null>(null);
  const [linkCode, setLinkCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refreshTabs = useCallback(async () => {
    try {
      const list = await chrome.tabs.query({ currentWindow: true });
      setTabs(list);
      setSummary(buildBrowsingSummary(list));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read tabs.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [list, s] = await Promise.all([
          chrome.tabs.query({ currentWindow: true }),
          loadSession(),
        ]);
        if (cancelled) return;
        setTabs(list);
        setSummary(buildBrowsingSummary(list));
        setSession(s);
        setGoal(s.goal);
        setLinkCode(s.linkCode);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Could not read tabs.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistLinkCode = async () => {
    const s = await loadSession();
    s.linkCode = linkCode.trim();
    await saveSession(s);
    setSession(s);
  };

  const startSession = async () => {
    await chrome.runtime.sendMessage({
      type: "START_SESSION",
      goal: goal.trim() || "Focused work",
    });
    const s = await loadSession();
    setSession(s);
  };

  const stopSession = async () => {
    await chrome.runtime.sendMessage({ type: "STOP_SESSION" });
    const s = await loadSession();
    setSession(s);
  };

  const active = session?.active ?? false;

  return (
    <div className="w-[400px] space-y-4 p-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Focus session</h1>
        <p className="text-xs text-muted-foreground">
          Local preview: blocklist + storage. Add{" "}
          <code className="rounded bg-muted px-1">VITE_CONVEX_URL</code> for
          Convex.
        </p>
      </header>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <p className="text-sm leading-snug text-muted-foreground">{summary}</p>
      )}

      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">
          Session goal
        </span>
        <textarea
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[72px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="What are you trying to get done?"
          disabled={active}
        />
      </label>

      <div className="flex gap-2">
        {!active ? (
          <button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 flex-1 items-center justify-center rounded-md px-3 text-sm font-medium"
            onClick={() => void startSession()}
          >
            Start session
          </button>
        ) : (
          <button
            type="button"
            className="border-input bg-background hover:bg-muted inline-flex h-9 flex-1 items-center justify-center rounded-md border px-3 text-sm font-medium"
            onClick={() => void stopSession()}
          >
            End session
          </button>
        )}
        <button
          type="button"
          className="border-input bg-background hover:bg-muted inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm"
          onClick={() => void refreshTabs()}
        >
          Refresh tabs
        </button>
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        <p className="text-xs font-medium text-muted-foreground">
          Dashboard link code (stub)
        </p>
        <div className="flex gap-2">
          <input
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 flex-1 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
            value={linkCode}
            onChange={(e) => setLinkCode(e.target.value)}
            placeholder="Paste code from web app"
          />
          <button
            type="button"
            className="border-input bg-background hover:bg-muted inline-flex h-9 shrink-0 items-center rounded-md border px-3 text-sm"
            onClick={() => void persistLinkCode()}
          >
            Save
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Open tabs
        </p>
        <ul className="max-h-48 space-y-1 overflow-y-auto pr-1 text-sm">
          {tabs.map((tab) => {
            const status = tabStatusForTab(tab, active);
            const label =
              tab.title && tab.title.length > 0 ? tab.title : tab.url ?? "Tab";
            return (
              <li
                key={tab.id ?? label}
                className="flex items-start justify-between gap-2 rounded-md border border-border px-2 py-1.5"
              >
                <span className="line-clamp-2 min-w-0 flex-1">{label}</span>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${statusStyles(status)}`}
                >
                  {status}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
