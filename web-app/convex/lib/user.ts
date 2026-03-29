import type { UserIdentity } from "convex/server";

/** WorkOS user id — JWT `sub`, same value AuthKit uses for `getAuthUser`. */
export function requireUserId(identity: UserIdentity | null): string {
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject;
}
