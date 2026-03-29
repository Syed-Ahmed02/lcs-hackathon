import type { FocusSessionState } from "./types.ts";

const SESSION_KEY = "focusSession";

const defaultSession = (): FocusSessionState => ({
  active: false,
  goal: "",
  allowlist: [],
  linkCode: "",
});

export async function loadSession(): Promise<FocusSessionState> {
  const data = await chrome.storage.local.get(SESSION_KEY);
  const raw = data[SESSION_KEY] as FocusSessionState | undefined;
  if (!raw || typeof raw !== "object") return defaultSession();
  return {
    ...defaultSession(),
    ...raw,
    allowlist: Array.isArray(raw.allowlist) ? raw.allowlist : [],
  };
}

export async function saveSession(
  session: FocusSessionState,
): Promise<void> {
  await chrome.storage.local.set({ [SESSION_KEY]: session });
}
