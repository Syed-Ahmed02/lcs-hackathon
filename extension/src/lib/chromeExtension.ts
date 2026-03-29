/** Guards for chrome.* APIs that are only present in an unpacked / packed extension. */

export function hasTabsApi(): boolean {
  return typeof chrome !== "undefined" && typeof chrome.tabs !== "undefined" && !!chrome.tabs.query;
}

export function hasRuntimeMessaging(): boolean {
  return typeof chrome !== "undefined" && typeof chrome.runtime?.sendMessage === "function";
}

export async function queryTabsCurrentWindow(): Promise<
  Array<{ id?: number; title?: string; url?: string }>
> {
  if (!hasTabsApi()) return [];
  return chrome.tabs.query({ currentWindow: true });
}

export async function queryActiveTab(): Promise<{ id?: number; title?: string; url?: string } | undefined> {
  if (!hasTabsApi()) return undefined;
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

export function sendMessageToTab(
  tabId: number,
  message: object,
): Promise<{ text?: string; title?: string } | undefined> {
  return new Promise((resolve) => {
    if (!hasTabsApi()) {
      resolve(undefined);
      return;
    }
    chrome.tabs.sendMessage(tabId, message, (response) => {
      void chrome.runtime.lastError;
      resolve(response as { text?: string; title?: string } | undefined);
    });
  });
}

export function sendRuntimeMessage(message: object): void {
  if (!hasRuntimeMessaging()) return;
  try {
    chrome.runtime.sendMessage(message, () => {
      void chrome.runtime.lastError;
    });
  } catch {
    /* ignore */
  }
}

export function sendRuntimeMessageWithResponse<T>(
  message: object,
  callback: (res: T | undefined) => void,
): void {
  if (!hasRuntimeMessaging()) {
    callback(undefined);
    return;
  }
  try {
    chrome.runtime.sendMessage(message, (res) => {
      void chrome.runtime.lastError;
      callback(res as T | undefined);
    });
  } catch {
    callback(undefined);
  }
}
