export type TabStatus = "allowed" | "blocked" | "checking";

export type FocusSessionState = {
  active: boolean;
  goal: string;
  /** Hostnames the user temporarily allowed for this session */
  allowlist: string[];
  /** Optional linking token placeholder for dashboard auth */
  linkCode: string;
};
