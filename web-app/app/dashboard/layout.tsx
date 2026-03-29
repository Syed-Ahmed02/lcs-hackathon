"use client";

import { useAuth } from "@workos-inc/authkit-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/sign-in");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh">
      <header className="border-border sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Focus Dashboard</span>
            <nav className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Overview
              </Link>
              <Link
                href="/dashboard/link"
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  pathname === "/dashboard/link"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Link Extension
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">{user.email}</span>
            <button
              className="hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
