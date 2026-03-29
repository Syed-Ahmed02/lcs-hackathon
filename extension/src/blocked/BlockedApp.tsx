import { useMemo, useState } from "react";
import { sendRuntimeMessageWithResponse } from "../lib/chromeExtension";

function ShieldXIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  );
}

export function BlockedApp() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const decisionId = params.get("decisionId") ?? "";
  const returnUrl = params.get("returnUrl") ?? "";
  const reason = params.get("reason") ?? "This page was judged off-goal for your session.";
  const sessionGoals = params.get("sessionGoals") ?? "";
  const [status, setStatus] = useState<string | null>(null);

  let domain = returnUrl;
  try { domain = new URL(returnUrl).hostname; } catch { /* keep raw */ }

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

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  };

  return (
    <div className="blocked-wrap">
      <ShieldXIcon />
      <h1>This page is off-track</h1>
      {domain && <p className="blocked-domain">{domain}</p>}

      <div className="blocked-reason-card">
        <span className="blocked-card-label">Why it's blocked</span>
        <p>{reason}</p>
      </div>

      {sessionGoals ? (
        <div className="blocked-goals">
          <span className="blocked-goals-label">Your focus goal</span>
          <p>{sessionGoals}</p>
        </div>
      ) : null}

      <div className="blocked-actions">
        <button type="button" className="secondary" onClick={goBack}>
          Go back
        </button>
        <button type="button" className="primary" disabled={!decisionId || !returnUrl} onClick={allowOnce}>
          Allow this page
        </button>
      </div>

      {status ? <p className="hint">{status}</p> : null}

      <p className="blocked-brand">FOCUSFLOW</p>
    </div>
  );
}
