/** Default distractor hosts for the simple local tier (no backend). */
export const DEFAULT_BLOCK_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "twitter.com",
  "x.com",
  "www.x.com",
  "reddit.com",
  "www.reddit.com",
  "instagram.com",
  "www.instagram.com",
  "tiktok.com",
  "www.tiktok.com",
  "youtube.com",
  "www.youtube.com",
]);

export function hostnameForUrl(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function isBlocklistedHost(hostname: string): boolean {
  return DEFAULT_BLOCK_HOSTS.has(hostname);
}

export function shouldBlockNavigation(
  url: string,
  allowlist: string[],
): boolean {
  const host = hostnameForUrl(url);
  if (!host) return false;
  if (allowlist.includes(host)) return false;
  return isBlocklistedHost(host);
}
