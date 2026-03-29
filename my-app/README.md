# LCS Focus extension (`my-app`)

Chrome extension (Vite + React + TypeScript + [`@crxjs/vite-plugin`](https://crxjs.dev/vite-plugin)). See [`extension-plan.md`](./extension-plan.md).

## What it does (simple)

- **Popup** (`src/popup/`): open tabs, one-line summary, session goal, stub link-code field, per-tab status (`allowed` / `blocked` / `checking`) via a local blocklist.
- **Background** (`src/background/`): while a focus session is active, redirects matching tabs to the blocked page.
- **Blocked page** (`public/blocked.html` + `public/blocked.js`): blocked UI and **Allow once** (session host allowlist).
- **Styles**: `src/styles.css` imports [`web-app/app/globals.css`](../web-app/app/globals.css) so tokens and Tailwind match the dashboard.
- **Convex**: optional — set `VITE_CONVEX_URL` (see [`.env.example`](./.env.example)); the popup uses `ConvexProvider` when present.

## Commands

```bash
cd my-app
pnpm install
pnpm dev
pnpm build
```

Load **unpacked** from **`my-app/dist`** in Chrome (Developer mode → Load unpacked).
