"use client";

import { useAuth } from "@workos-inc/authkit-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const { isLoading, user, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Focus Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sign in to view your focus sessions and insights.
          </p>
        </div>
        <Button className="w-full" onClick={() => signIn()}>
          Sign in with WorkOS
        </Button>
      </div>
    </div>
  );
}
