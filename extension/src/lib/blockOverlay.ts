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
    background: '#0c0c16',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    color: '#ffffff',
    padding: '2rem',
    boxSizing: 'border-box',
  })

  overlay.innerHTML = `
    <div style="
      max-width: 460px;
      width: 100%;
      text-align: center;
      animation: __fg_fadein 0.2s ease;
    ">
      <div style="
        font-size: 2.25rem;
        margin: 0 0 1.25rem;
        opacity: 0.85;
      ">🛡</div>

      <h1 style="
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 0.375rem;
        letter-spacing: -0.02em;
        color: #fff;
      ">Focus Mode Active</h1>

      <p style="
        font-size: 0.75rem;
        color: rgba(255,255,255,0.3);
        margin: 0 0 1.25rem;
        word-break: break-all;
        font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      ">${escapeHtml(blockedUrl)}</p>

      <div style="
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 10px;
        padding: 0.875rem 1rem;
        margin-bottom: 1.75rem;
        text-align: left;
      ">
        <p style="
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.35);
          margin: 0 0 0.3rem;
        ">Reason</p>
        <p style="
          font-size: 0.875rem;
          color: rgba(255,255,255,0.8);
          margin: 0;
          line-height: 1.5;
        ">${escapeHtml(reason)}</p>
      </div>

      <button id="__fg_allow" style="
        padding: 0.625rem 2rem;
        border-radius: 8px;
        background: #fff;
        color: #0c0c16;
        font-weight: 600;
        font-size: 0.875rem;
        border: none;
        cursor: pointer;
        transition: background 0.15s, transform 0.1s;
        letter-spacing: -0.01em;
      ">Allow for this session</button>

      <p style="
        font-size: 0.6875rem;
        color: rgba(255,255,255,0.2);
        margin: 1.25rem 0 0;
      ">FocusGuard</p>
    </div>

    <style>
      @keyframes __fg_fadein {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      #__fg_allow:hover {
        background: rgba(255,255,255,0.92) !important;
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
