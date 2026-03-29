"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1>Convex + AuthKit</h1>
        <div className="flex gap-2">
          {user ? (
            <button type="button" onClick={() => void signOut()}>
              Sign out
            </button>
          ) : (
            <>
              <Link href="/sign-in">
                <button type="button">Sign in</button>
              </Link>
              <Link href="/sign-up">
                <button type="button">Sign up</button>
              </Link>
            </>
          )}
        </div>
      </div>
      <Authenticated>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "default" }))}>
          Open dashboard
        </Link>
      </Authenticated>
      <Unauthenticated>
        <p>Please sign in to view data</p>
      </Unauthenticated>
    </div>
  );
}

