import {
  hostnameForUrl,
  isBlocklistedHost,
} from "./heuristic.ts";
import type { TabStatus } from "./types.ts";

export function tabStatusForTab(
  tab: chrome.tabs.Tab,
  sessionActive: boolean,
): TabStatus {
  const url = tab.url;
  if (!url || !/^https?:/i.test(url)) {
    return "checking";
  }
  const host = hostnameForUrl(url);
  if (!host) return "checking";

  if (!isBlocklistedHost(host)) {
    return "allowed";
  }

  if (!sessionActive) {
    return "checking";
  }

  return "blocked";
}
