"use client";

import { useAuth } from "@workos-inc/authkit-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.replace(user ? "/dashboard" : "/sign-in");
    }
  }, [isLoading, user, router]);

  return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-muted-foreground text-sm">Loading…</p>
    </div>
  );
}
