"use client";

import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { AuthKitProvider, useAuth as useWorkOSAuth } from "@workos-inc/authkit-react";
import { useCallback } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function useConvexAuth() {
  const { isLoading, user, getAccessToken } = useWorkOSAuth();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      try {
        return await getAccessToken({ forceRefresh: forceRefreshToken });
      } catch {
        return null;
      }
    },
    [getAccessToken],
  );

  return {
    isLoading,
    isAuthenticated: !!user,
    fetchAccessToken,
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthKitProvider clientId={process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID!}>
      <ConvexProviderWithAuth client={convex} useAuth={useConvexAuth}>
        {children}
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  );
}
