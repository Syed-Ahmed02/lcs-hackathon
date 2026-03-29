import { useCallback, useEffect, useState } from "react";
import {
  queryActiveTab,
  queryTabsCurrentWindow,
  sendMessageToTab,
  sendRuntimeMessage,
} from "../lib/chromeExtension";
import { api, getConvexClient } from "../lib/convexClient";
import { extensionFetch } from "../lib/http";
import { storageLocalGet, storageLocalRemove, storageLocalSet } from "../lib/chromeStorage";
import { STORAGE } from "../lib/storageKeys";
import { domainFromUrl } from "../lib/tiered";

type TabInfo = {
  id: number;
  title: string;
  url: string;
};

export function PopupApp() {
  const [linkCode, setLinkCode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [goal, setGoal] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [snapHint, setSnapHint] = useState<string | null>(null);

  const loadStorage = useCallback(async () => {
    const data = await storageLocalGet([
      STORAGE.TOKEN,
      STORAGE.SESSION_ID,
      STORAGE.GOAL,
    ]);
    setToken((data[STORAGE.TOKEN] as string | undefined) ?? null);
    setSessionId((data[STORAGE.SESSION_ID] as string | undefined) ?? null);
    setGoal((data[STORAGE.GOAL] as string | undefined) ?? "");
  }, []);

  useEffect(() => {
    void loadStorage();
  }, [loadStorage]);

  const refreshTabs = useCallback(async () => {
    const list = await queryTabsCurrentWindow();
    setTabs(
      list
        .filter((t) => t.id !== undefined && t.url?.startsWith("http"))
        .map((t) => ({
          id: t.id!,
          title: t.title || "(no title)",
          url: t.url || "",
        })),
    );
  }, []);

  useEffect(() => {
    void refreshTabs();
  }, [refreshTabs]);

  const linkAccount = async () => {
    setLinkError(null);
    setBusy(true);
    try {
      const client = getConvexClient();
      const res = await client.mutation(api.linking.exchangeLinkCodeWithToken, {
        code: linkCode.trim(),
      });
      if (!res.success) {
        setLinkError(res.reason);
        return;
      }
      await storageLocalSet({ [STORAGE.TOKEN]: res.token });
      setToken(res.token);
    } catch (e) {
      setLinkError(e instanceof Error ? e.message : "Link failed");
    } finally {
      setBusy(false);
    }
  };

  const startSession = async () => {
    if (!token) return;
    setBusy(true);
    try {
      await storageLocalSet({
        [STORAGE.MANUAL_ALLOWS]: JSON.stringify([]),
        [STORAGE.GOAL]: goal,
      });
      const res = await extensionFetch("/extension/startSession", token, {
        body: { goalDescription: goal || undefined },
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = (await res.json()) as { sessionId: string };
      await storageLocalSet({ [STORAGE.SESSION_ID]: data.sessionId });
      setSessionId(data.sessionId);

      const at = await queryActiveTab();
      if (at?.id !== undefined) {
        const response = await sendMessageToTab(at.id, { type: "PAGE_SNAPSHOT" });
        const snap = { text: response?.text ?? "" };
        setSnapHint(
          snap.text.trim()
            ? `Captured ~${Math.min(snap.text.length, 8000)} chars from the active tab for goal alignment.`
            : "Could not read page text on this tab (restricted page); classification uses title and URL.",
        );
      }
    } catch (e) {
      setSnapHint(e instanceof Error ? e.message : "Start session failed");
    } finally {
      setBusy(false);
    }
  };

  const endSession = async () => {
    if (!token || !sessionId) return;
    setBusy(true);
    try {
      await extensionFetch("/extension/endSession", token, {
        body: { sessionId },
      });
      await storageLocalRemove([STORAGE.SESSION_ID, STORAGE.GOAL]);
      setSessionId(null);
      setGoal("");
    } finally {
      setBusy(false);
    }
  };

  const classifyTabs = () => {
    sendRuntimeMessage({ type: "SCAN_TABS" });
  };

  return (
    <div className="panel">
      <div>
        <div className="label">Account</div>
        {!token ? (
          <div className="row">
            <input
              placeholder="Link code from dashboard"
              value={linkCode}
              onChange={(e) => setLinkCode(e.target.value)}
            />
            <button type="button" className="primary" disabled={busy} onClick={() => void linkAccount()}>
              Link
            </button>
          </div>
        ) : (
          <p className="hint">Linked — token stored locally.</p>
        )}
        {linkError ? <p className="hint" style={{ color: "var(--danger)" }}>{linkError}</p> : null}
      </div>

      <div>
        <div className="label">Session goals</div>
        <textarea
          placeholder="What are you trying to accomplish in this focus block?"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          disabled={!token}
        />
        <div className="row">
          <button type="button" className="primary" disabled={!token || busy} onClick={() => void startSession()}>
            Start focus session
          </button>
          <button type="button" disabled={!token || !sessionId || busy} onClick={() => void endSession()}>
            End session
          </button>
        </div>
        {sessionId ? (
          <p className="hint">
            Session active — off-goal pages redirect to the block screen. Open tabs use your goals plus page content
            for alignment checks.
          </p>
        ) : null}
        {snapHint ? <p className="hint">{snapHint}</p> : null}
      </div>

      <div>
        <div className="label">Open tabs (this window)</div>
        <button type="button" disabled={!sessionId} onClick={() => void refreshTabs()}>
          Refresh list
        </button>{" "}
        <button type="button" disabled={!sessionId} onClick={classifyTabs}>
          Classify all tabs now
        </button>
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          {tabs.map((t) => (
            <div key={t.id} className="tab-row">
              <span className="tab-title">{t.title}</span>
              <span className="tab-url">
                {domainFromUrl(t.url)} — {t.url}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
