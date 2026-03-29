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
    background: 'linear-gradient(135deg, #0a0a14 0%, #0f0f1e 100%)',
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
      max-width: 540px;
      width: 100%;
      text-align: center;
      animation: __fg_fadein 0.25s ease;
    ">
      <div style="
        width: 72px;
        height: 72px;
        background: rgba(255,255,255,0.06);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        font-size: 2rem;
        border: 1.5px solid rgba(255,255,255,0.12);
      ">🔒</div>

      <h1 style="
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0 0 0.5rem;
        letter-spacing: -0.02em;
        color: #fff;
      ">Focus Mode Active</h1>

      <p style="
        font-size: 0.8125rem;
        color: rgba(255,255,255,0.4);
        margin: 0 0 1.5rem;
        word-break: break-all;
        font-family: 'SF Mono', 'Fira Code', monospace;
      ">${escapeHtml(blockedUrl)}</p>

      <div style="
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 1rem 1.25rem;
        margin-bottom: 2rem;
        text-align: left;
      ">
        <p style="
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.4);
          margin: 0 0 0.375rem;
        ">Reason</p>
        <p style="
          font-size: 0.9375rem;
          color: rgba(255,255,255,0.85);
          margin: 0;
          line-height: 1.5;
        ">${escapeHtml(reason)}</p>
      </div>

      <button id="__fg_allow" style="
        padding: 0.75rem 2.5rem;
        border-radius: 10px;
        background: rgba(255,255,255,0.9);
        color: #0a0a14;
        font-weight: 600;
        font-size: 0.9375rem;
        border: none;
        cursor: pointer;
        transition: background 0.15s, transform 0.1s;
        letter-spacing: -0.01em;
      ">Allow for this session</button>

      <p style="
        font-size: 0.75rem;
        color: rgba(255,255,255,0.25);
        margin: 1.25rem 0 0;
      ">Focus Guard · Your AI productivity assistant</p>
    </div>

    <style>
      @keyframes __fg_fadein {
        from { opacity: 0; transform: scale(0.97); }
        to   { opacity: 1; transform: scale(1); }
      }
      #__fg_allow:hover {
        background: #ffffff !important;
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
