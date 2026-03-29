const params = new URLSearchParams(window.location.search);
const tabId = Number(params.get("tabId"));
const returnUrl = params.get("returnUrl") ?? "";
const goal = params.get("goal") ?? "";

function hostnameOf(u) {
  try {
    return new URL(u).hostname;
  } catch {
    return "";
  }
}

const goalEl = document.getElementById("goal");
const targetEl = document.getElementById("target");
const allowBtn = document.getElementById("allow");

if (goalEl) goalEl.textContent = goal || "(no goal set)";
if (targetEl) targetEl.textContent = returnUrl || "(unknown URL)";

if (allowBtn) {
  allowBtn.addEventListener("click", () => {
    const hostname = hostnameOf(returnUrl);
    chrome.runtime.sendMessage(
      {
        type: "ALLOW_ONCE",
        tabId,
        returnUrl,
        hostname,
      },
      () => {
        void chrome.runtime.lastError;
      },
    );
  });
}
