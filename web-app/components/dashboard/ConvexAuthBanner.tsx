"use client";

import { useConvexAuth } from "convex/react";

/**
 * Shown when WorkOS is signed in but Convex has no JWT (common when env URL ≠ active `convex dev` deployment).
 */
export function ConvexAuthBanner() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  if (isLoading) return null;
  if (isAuthenticated) return null;
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm dark:bg-amber-500/5">
      <p className="font-medium text-amber-950 dark:text-amber-100">Convex has no session yet</p>
      <p className="mt-1 text-muted-foreground">
        The dashboard will look empty until Convex accepts your login. Most often{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">NEXT_PUBLIC_CONVEX_URL</code> in{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.local</code> does not match the
        deployment from{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">npx convex dev</code>. Copy the
        <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-xs">.cloud</code> URL from the Convex
        CLI output, set it, then restart{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">pnpm dev</code> and refresh.
      </p>
    </div>
  );
}
