import { useMemo, useState } from "react";
import { sendRuntimeMessageWithResponse } from "../lib/chromeExtension";

export function BlockedApp() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const decisionId = params.get("decisionId") ?? "";
  const returnUrl = params.get("returnUrl") ?? "";
  const reason = params.get("reason") ?? "This page was judged off-goal for your session.";
  const sessionGoals = params.get("sessionGoals") ?? "";
  const [status, setStatus] = useState<string | null>(null);

  const allowOnce = () => {
    setStatus("Updating…");
    sendRuntimeMessageWithResponse<{ ok?: boolean }>(
      {
        type: "ALLOW_OVERRIDE",
        decisionId,
        returnUrl,
      },
      (res) => {
        if (res?.ok) {
          setStatus("Allowed for this session. Redirecting…");
        } else {
          setStatus("Could not update. Try reloading the extension.");
        }
      },
    );
  };

  return (
    <div className="blocked-wrap">
      <h1>Staying on task</h1>
      <p>{reason}</p>
      {sessionGoals ? (
        <p>
          <strong>Your goals:</strong> {sessionGoals}
        </p>
      ) : null}
      <p className="hint">You can allow this page for the rest of this session if it actually supports your work.</p>
      <button type="button" className="primary" disabled={!decisionId || !returnUrl} onClick={allowOnce}>
        Allow this page for this session
      </button>
      {status ? <p className="hint">{status}</p> : null}
    </div>
  );
}
