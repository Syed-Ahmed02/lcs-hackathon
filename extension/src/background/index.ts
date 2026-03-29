import { extensionFetch } from "../lib/http";
import { storageLocalGet, storageLocalSet } from "../lib/chromeStorage";
import { STORAGE } from "../lib/storageKeys";
import { domainFromUrl, hashText } from "../lib/tiered";

const debounceTimers = new Map<number, ReturnType<typeof setTimeout>>();

function isInspectableUrl(url: string | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("chrome-extension:")) return false;
  if (url.startsWith("chrome://")) return false;
  if (url.startsWith("devtools://")) return false;
  if (url.startsWith("edge://")) return false;
  if (url.startsWith("about:")) return false;
  return /^https?:\/\//i.test(url);
}

async function getLocal<T>(key: string): Promise<T | undefined> {
  const v = await storageLocalGet([key]);
  return v[key] as T | undefined;
}

async function getSessionAllows(): Promise<Set<string>> {
  const raw = await getLocal<string>(STORAGE.MANUAL_ALLOWS);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

async function addManualAllow(url: string): Promise<void> {
  const set = await getSessionAllows();
  set.add(url);
  await storageLocalSet({
    [STORAGE.MANUAL_ALLOWS]: JSON.stringify([...set]),
  });
}

function scheduleTabCheck(tabId: number, delay = 450): void {
  const prev = debounceTimers.get(tabId);
  if (prev) clearTimeout(prev);
  debounceTimers.set(
    tabId,
    setTimeout(() => {
      debounceTimers.delete(tabId);
      void evaluateTab(tabId);
    }, delay),
  );
}

async function getSnapshot(tabId: number): Promise<{ text: string; title: string }> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type: "PAGE_SNAPSHOT" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        resolve({ text: "", title: "" });
        return;
      }
      const r = response as { text?: string; title?: string };
      resolve({
        text: r.text ?? "",
        title: r.title ?? "",
      });
    });
  });
}

type EvaluateResult = {
  decision: "blocked" | "allowed";
  reasoning?: string;
  decisionId?: string;
};

async function evaluateTab(tabId: number): Promise<void> {
  const token = await getLocal<string>(STORAGE.TOKEN);
  const sessionId = await getLocal<string>(STORAGE.SESSION_ID);
  if (!token || !sessionId) return;

  const tab = await chrome.tabs.get(tabId);
  const url = tab.url;
  if (!url || !isInspectableUrl(url)) return;

  const allows = await getSessionAllows();
  if (allows.has(url)) return;

  const snap = await getSnapshot(tabId);
  const title = snap.title || tab.title || "";
  const excerpt = snap.text.trim().slice(0, 6000);
  const domain = domainFromUrl(url);
  const contentHash = hashText(excerpt + url);

  const res = await extensionFetch("/extension/evaluateTab", token, {
    body: {
      sessionId,
      url,
      domain,
      title,
      pageContentExcerpt: excerpt || undefined,
      contentHash,
    },
  });

  if (!res.ok) {
    return;
  }

  const data = (await res.json()) as EvaluateResult;

  if (data.decision === "blocked") {
    const params = new URLSearchParams();
    params.set("decisionId", data.decisionId ?? "");
    params.set("returnUrl", url);
    params.set("reason", data.reasoning ?? "This page does not match your session goals.");
    params.set("sessionGoals", (await getLocal<string>(STORAGE.GOAL)) ?? "");
    const blockedPage = `${chrome.runtime.getURL("blocked.html")}?${params.toString()}`;
    await chrome.tabs.update(tabId, { url: blockedPage });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;
  void (async () => {
    const token = await getLocal<string>(STORAGE.TOKEN);
    const sessionId = await getLocal<string>(STORAGE.SESSION_ID);
    if (!token || !sessionId) return;
    if (!isInspectableUrl(tab.url)) return;
    scheduleTabCheck(tabId);
  })();
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  void (async () => {
    const token = await getLocal<string>(STORAGE.TOKEN);
    const sessionId = await getLocal<string>(STORAGE.SESSION_ID);
    if (!token || !sessionId) return;
    scheduleTabCheck(activeInfo.tabId, 200);
  })();
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "SCAN_TABS") {
    void (async () => {
      const token = await getLocal<string>(STORAGE.TOKEN);
      const sessionId = await getLocal<string>(STORAGE.SESSION_ID);
      if (!token || !sessionId) {
        sendResponse({ ok: false });
        return;
      }
      const tabs = await chrome.tabs.query({ currentWindow: true });
      for (const t of tabs) {
        if (t.id !== undefined && isInspectableUrl(t.url)) {
          await evaluateTab(t.id);
        }
      }
      sendResponse({ ok: true });
    })();
    return true;
  }
  if (msg?.type === "ALLOW_OVERRIDE") {
    const decisionId = msg.decisionId as string;
    const returnUrl = msg.returnUrl as string;
    void (async () => {
      const token = await getLocal<string>(STORAGE.TOKEN);
      if (!token) {
        sendResponse({ ok: false });
        return;
      }
      await extensionFetch("/extension/overrideDecision", token, {
        body: { decisionId, newDecision: "allowed" },
      });
      await addManualAllow(returnUrl);
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const t = tabs[0];
      if (t?.id && returnUrl) {
        await chrome.tabs.update(t.id, { url: returnUrl });
      }
      sendResponse({ ok: true });
    })();
    return true;
  }
  return false;
});
