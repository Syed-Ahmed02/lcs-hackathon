import { convexHttpOrigin } from "./httpOrigin";

export { convexHttpOrigin } from "./httpOrigin";

export async function extensionFetch(
  path: string,
  token: string,
  init?: { method?: string; body?: unknown },
): Promise<Response> {
  const baseUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (!baseUrl) throw new Error("Missing VITE_CONVEX_URL");
  const origin = convexHttpOrigin(baseUrl);
  const method = init?.method ?? "POST";
  const hasBody = init?.body !== undefined && method !== "GET" && method !== "HEAD";
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(`${origin}${path}`, {
    method,
    headers,
    body: hasBody ? JSON.stringify(init.body) : undefined,
  });
}
