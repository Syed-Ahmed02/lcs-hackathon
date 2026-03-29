import { shouldBlockNavigation } from "../lib/heuristic.ts";
import { loadSession, saveSession } from "../lib/storage.ts";

type AllowOnceMessage = {
  type: "ALLOW_ONCE";
  tabId: number;
  returnUrl: string;
  hostname: string;
};

type StartMessage = {
  type: "START_SESSION";
  goal: string;
};

type StopMessage = { type: "STOP_SESSION" };

type PingMessage = { type: "PING" };

export type BackgroundMessage =
  | AllowOnceMessage
  | StartMessage
  | StopMessage
  | PingMessage;

function extensionOrigin(): string {
  return chrome.runtime.getURL("");
}

function blockedPageUrl(params: {
  tabId: number;
  returnUrl: string;
  goal: string;
}): string {
  const q = new URLSearchParams({
    tabId: String(params.tabId),
    returnUrl: params.returnUrl,
    goal: params.goal,
  });
  return chrome.runtime.getURL(`blocked.html?${q.toString()}`);
}

chrome.runtime.onMessage.addListener(
  (
    message: BackgroundMessage,
    _sender,
    sendResponse: (r: unknown) => void,
  ) => {
    void (async () => {
      if (message.type === "PING") {
        sendResponse({ ok: true });
        return;
      }
      if (message.type === "START_SESSION") {
        const session = await loadSession();
        session.active = true;
        session.goal = message.goal.trim() || "Focused work";
        await saveSession(session);
        sendResponse({ ok: true });
        return;
      }
      if (message.type === "STOP_SESSION") {
        const session = await loadSession();
        session.active = false;
        session.allowlist = [];
        await saveSession(session);
        sendResponse({ ok: true });
        return;
      }
      if (message.type === "ALLOW_ONCE") {
        if (!Number.isFinite(message.tabId) || message.tabId < 0) {
          sendResponse({ ok: false, error: "bad_tab" });
          return;
        }
        const session = await loadSession();
        if (
          message.hostname &&
          !session.allowlist.includes(message.hostname)
        ) {
          session.allowlist.push(message.hostname);
        }
        await saveSession(session);
        await chrome.tabs.update(message.tabId, {
          url: message.returnUrl,
        });
        sendResponse({ ok: true });
      }
    })();
    return true;
  },
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = tab.url;
  if (changeInfo.status !== "complete" || !url) return;
  void (async () => {
    const session = await loadSession();
    if (!session.active) return;
    if (url.startsWith(extensionOrigin())) return;
    if (!/^https?:/i.test(url)) return;

    if (!shouldBlockNavigation(url, session.allowlist)) return;

    const blocked = blockedPageUrl({
      tabId,
      returnUrl: url,
      goal: session.goal,
    });
    await chrome.tabs.update(tabId, { url: blocked });
  })();
});
