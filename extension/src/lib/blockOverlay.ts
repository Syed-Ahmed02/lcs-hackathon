// Injected into blocked tabs via chrome.scripting.executeScript({ files: ['content/overlay.js'] })
// Must be self-contained (no imports). Reads args from window.__overlayArgs set by the worker.
// Renders a full-screen overlay over the current page.

;(function mountBlockOverlay() {
  const existing = document.getElementById('__focus-guard-overlay')
  if (existing) existing.remove()

  const args = (window as unknown as {
    __overlayArgs?: { reason: string; decisionId: string; blockedUrl: string; goalDescription?: string }
  }).__overlayArgs ?? { reason: 'This page does not align with your focus goal.', decisionId: '', blockedUrl: '' }

  const { reason, decisionId, blockedUrl, goalDescription } = args

  let domain = blockedUrl
  try { domain = new URL(blockedUrl).hostname } catch { /* keep raw */ }

  const overlay = document.createElement('div')
  overlay.id = '__focus-guard-overlay'

  Object.assign(overlay.style, {
    all: 'initial',
    position: 'fixed',
    inset: '0',
    zIndex: '2147483647',
    background: '#0c0c16',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'safe center',
    overflowY: 'auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    fontSize: '16px',
    color: '#ffffff',
    padding: '2rem',
    boxSizing: 'border-box',
    zoom: '1',
    lineHeight: '1.5',
    webkitTextSizeAdjust: '100%',
  })

  const goalsHtml = goalDescription
    ? `<div style="
        width: 100%;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 10px;
        padding: 0.75rem 1rem;
        margin-bottom: 0.75rem;
        text-align: left;
      ">
        <p style="
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.35);
          margin: 0 0 0.25rem;
        ">Your focus goal</p>
        <p style="
          font-size: 0.8125rem;
          color: rgba(255,255,255,0.8);
          margin: 0;
          line-height: 1.5;
        ">${escapeHtml(goalDescription)}</p>
      </div>`
    : ''

  overlay.innerHTML = `
    <div style="
      max-width: 420px;
      width: 100%;
      text-align: center;
      animation: __fg_fadein 0.25s ease;
    ">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 0 1rem;">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <line x1="9" y1="9" x2="15" y2="15" />
        <line x1="15" y1="9" x2="9" y2="15" />
      </svg>

      <h1 style="
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0 0 0.25rem;
        letter-spacing: -0.02em;
        color: #fff;
      ">This page is off-track</h1>

      <p style="
        font-size: 0.75rem;
        color: rgba(255,255,255,0.25);
        margin: 0 0 1.25rem;
      ">${escapeHtml(domain)}</p>

      <div style="
        width: 100%;
        background: rgba(239,68,68,0.05);
        border: 1px solid rgba(239,68,68,0.12);
        border-radius: 10px;
        padding: 0.75rem 1rem;
        margin-bottom: 0.75rem;
        text-align: left;
      ">
        <p style="
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(248,113,113,0.6);
          margin: 0 0 0.25rem;
        ">Why it's blocked</p>
        <p style="
          font-size: 0.8125rem;
          color: rgba(255,255,255,0.75);
          margin: 0;
          line-height: 1.5;
        ">${escapeHtml(reason)}</p>
      </div>

      ${goalsHtml}

      <div style="
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
        width: 100%;
      ">
        <button id="__fg_back" style="
          flex: 1;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.6);
          font-weight: 600;
          font-size: 0.8125rem;
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        ">Go back</button>
        <button id="__fg_allow" style="
          flex: 1;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7);
          font-weight: 600;
          font-size: 0.8125rem;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        ">Allow this page</button>
      </div>

      <p style="
        font-size: 0.625rem;
        color: rgba(255,255,255,0.12);
        margin: 1.5rem 0 0;
        letter-spacing: 0.04em;
      ">FOCUSFLOW</p>
    </div>

    <style>
      @keyframes __fg_fadein {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      #__fg_allow:hover { background: rgba(255,255,255,0.12) !important; color: #fff !important; }
      #__fg_back:hover  { background: rgba(255,255,255,0.1) !important; color: #fff !important; }
      #__fg_allow:active, #__fg_back:active { transform: scale(0.97); }
    </style>
  `

  document.body.appendChild(overlay)

  document.getElementById('__fg_back')!.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.close()
    }
  })

  document.getElementById('__fg_allow')!.addEventListener('click', () => {
    chrome.runtime.sendMessage(
      { type: 'OVERRIDE_DECISION', decisionId, url: blockedUrl },
      () => {
        overlay.style.transition = 'opacity 0.2s'
        overlay.style.opacity = '0'
        setTimeout(() => overlay.remove(), 200)
      },
    )
  })

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
})()
