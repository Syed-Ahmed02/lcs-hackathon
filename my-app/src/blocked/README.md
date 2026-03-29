# Blocked interstitial

The live blocked page is shipped as static assets so the service worker can load it without a separate manifest HTML entry:

- [`public/blocked.html`](../../public/blocked.html)
- [`public/blocked.js`](../../public/blocked.js)

It is opened via `chrome.runtime.getURL("blocked.html?...")` from the background worker. Styling is intentionally small and self-contained; the popup uses the shared [`web-app`](../../web-app/app/globals.css) globals.
