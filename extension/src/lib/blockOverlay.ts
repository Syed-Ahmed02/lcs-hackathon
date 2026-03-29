// Injected into blocked tabs via chrome.scripting.executeScript({ files: ['content/overlay.js'] })
// Must be self-contained (no imports). Reads args from window.__overlayArgs set by the worker.
// Renders a full-screen overlay over the current page.

;(function mountBlockOverlay() {
  // Avoid double-mounting
  if (document.getElementById('__focus-guard-overlay')) return

  const args = (window as unknown as { __overlayArgs?: { reason: string; decisionId: string; blockedUrl: string } })
    .__overlayArgs ?? { reason: 'This page does not align with your focus goal.', decisionId: '', blockedUrl: '' }

  const { reason, decisionId, blockedUrl } = args

  const overlay = document.createElement('div')
  overlay.id = '__focus-guard-overlay'

  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483647',
    background:
      'linear-gradient(135deg, oklch(0.145 0 0) 0%, oklch(0.2 0.05 302) 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    color: 'oklch(0.985 0 0)',
    padding: '2rem',
    boxSizing: 'border-box',
  })

  overlay.innerHTML = `
    <div style="
      max-width: 540px;
      width: 100%;
      text-align: center;
      animation: __fg_fadein 0.25s ease;
    ">
      <div style="
        width: 72px;
        height: 72px;
        background: oklch(1 0 0 / 8%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        font-size: 2rem;
        border: 1.5px solid oklch(1 0 0 / 12%);
      ">🔒</div>

      <h1 style="
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0 0 0.5rem;
        letter-spacing: -0.02em;
        color: oklch(0.985 0 0);
      ">Focus Mode Active</h1>

      <p style="
        font-size: 0.8125rem;
        color: oklch(0.708 0 0);
        margin: 0 0 1.5rem;
        word-break: break-all;
        font-family: 'SF Mono', 'Fira Code', monospace;
      ">${escapeHtml(blockedUrl)}</p>

      <div style="
        background: oklch(0.205 0 0);
        border: 1px solid oklch(1 0 0 / 10%);
        border-radius: 0.75rem;
        padding: 1rem 1.25rem;
        margin-bottom: 2rem;
        text-align: left;
      ">
        <p style="
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: oklch(0.708 0 0);
          margin: 0 0 0.375rem;
        ">Reason</p>
        <p style="
          font-size: 0.9375rem;
          color: oklch(0.985 0 0);
          margin: 0;
          line-height: 1.5;
        ">${escapeHtml(reason)}</p>
      </div>

      <button id="__fg_allow" style="
        padding: 0.75rem 2.5rem;
        border-radius: 0.625rem;
        background: oklch(0.438 0.218 303.724);
        color: oklch(0.977 0.014 308.299);
        font-weight: 600;
        font-size: 0.9375rem;
        border: none;
        cursor: pointer;
        transition: background 0.15s, transform 0.1s;
        letter-spacing: -0.01em;
      ">Allow for this session</button>

      <p style="
        font-size: 0.75rem;
        color: oklch(0.708 0 0);
        margin: 1.25rem 0 0;
        opacity: 0.65;
      ">Focus Guard · Your AI productivity assistant</p>
    </div>

    <style>
      @keyframes __fg_fadein {
        from { opacity: 0; transform: scale(0.97); }
        to   { opacity: 1; transform: scale(1); }
      }
      #__fg_allow:hover {
        background: oklch(0.5 0.22 302) !important;
        transform: scale(1.02);
      }
      #__fg_allow:active {
        transform: scale(0.98);
      }
    </style>
  `

  document.body.appendChild(overlay)

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
