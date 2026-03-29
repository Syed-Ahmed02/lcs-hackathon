"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogOut } from "lucide-react";

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">FocusGuard</h1>
          <p className="text-sm text-muted-foreground">
            Stay on task. Track your browsing habits and block distractions during focus sessions.
          </p>
        </div>

        <Authenticated>
          <div className="space-y-3">
            {user && (
              <p className="text-sm text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{user.email}</span>
              </p>
            )}
            <Button size="lg" className="w-full" render={<Link href="/dashboard" />}>
              Open Dashboard
            </Button>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => void signOut()}
              >
                <LogOut className="size-3.5" />
                Sign out
              </Button>
            )}
          </div>
        </Authenticated>

        <Unauthenticated>
          <div className="space-y-2">
            <Button size="lg" className="w-full" render={<Link href="/sign-in" />}>
              Sign in
            </Button>
            <Button size="lg" variant="outline" className="w-full" render={<Link href="/sign-up" />}>
              Create account
            </Button>
          </div>
        </Unauthenticated>
      </div>
    </div>
  );
}

