import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

/** Convex `anyApi` proxy — avoids importing `web-app/convex/_generated/api` into the extension type graph. */
export const api = anyApi;

export function getConvexClient(): ConvexHttpClient {
  const url = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (!url) throw new Error("Missing VITE_CONVEX_URL");
  return new ConvexHttpClient(url);
}
