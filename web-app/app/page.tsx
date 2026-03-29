"use client";

import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1>Convex + AuthKit</h1>
        <div className="flex gap-2">
          {user ? (
            <button onClick={() => signOut()}>Sign out</button>
          ) : (
            <>
              <Link href="/sign-in">
                <button>Sign in</button>
              </Link>
              <Link href="/sign-up">
                <button>Sign up</button>
              </Link>
            </>
          )}
        </div>
      </div>
      <Authenticated>
        <Button>Dashboard</Button>
      </Authenticated>
      <Unauthenticated>
        <p>Please sign in to view data</p>
      </Unauthenticated>
    </div>
  );
}

