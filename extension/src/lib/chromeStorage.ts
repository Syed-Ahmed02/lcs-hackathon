/**
 * Safe access to chrome.storage.local. Outside a real extension context
 * (e.g. opening the popup HTML in a normal tab, or broken dev setup),
 * chrome.storage may be missing — we fall back to window.localStorage.
 */
const LS_PREFIX = "lcs_focus_ext_";

export function hasChromeStorage(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.storage !== "undefined" &&
    typeof chrome.storage.local !== "undefined"
  );
}

function fallbackGet(keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (typeof globalThis.localStorage === "undefined") return out;
  for (const k of keys) {
    const raw = globalThis.localStorage.getItem(LS_PREFIX + k);
    if (raw === null) continue;
    try {
      out[k] = JSON.parse(raw) as unknown;
    } catch {
      out[k] = raw;
    }
  }
  return out;
}

function fallbackSet(items: Record<string, unknown>): void {
  if (typeof globalThis.localStorage === "undefined") return;
  for (const [k, v] of Object.entries(items)) {
    globalThis.localStorage.setItem(LS_PREFIX + k, JSON.stringify(v));
  }
}

function fallbackRemove(keys: string[]): void {
  if (typeof globalThis.localStorage === "undefined") return;
  for (const k of keys) {
    globalThis.localStorage.removeItem(LS_PREFIX + k);
  }
}

export async function storageLocalGet(keys: string[]): Promise<Record<string, unknown>> {
  if (!hasChromeStorage()) {
    return fallbackGet(keys);
  }
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(new Error(err.message));
        return;
      }
      resolve(result as Record<string, unknown>);
    });
  });
}

export async function storageLocalSet(items: Record<string, unknown>): Promise<void> {
  if (!hasChromeStorage()) {
    fallbackSet(items);
    return;
  }
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items as Record<string, unknown>, () => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(new Error(err.message));
        return;
      }
      resolve();
    });
  });
}

export async function storageLocalRemove(keys: string[]): Promise<void> {
  if (!hasChromeStorage()) {
    fallbackRemove(keys);
    return;
  }
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(keys, () => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(new Error(err.message));
        return;
      }
      resolve();
    });
  });
}
