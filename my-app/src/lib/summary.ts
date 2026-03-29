/** One-sentence snapshot of current browsing (plan: popup open). */
export function buildBrowsingSummary(tabs: chrome.tabs.Tab[]): string {
  const withUrl = tabs.filter((t) => t.url && /^https?:/i.test(t.url));
  if (withUrl.length === 0) {
    return "No ordinary web tabs are open right now.";
  }

  const hosts = new Map<string, number>();
  for (const t of withUrl) {
    try {
      const h = new URL(t.url!).hostname;
      hosts.set(h, (hosts.get(h) ?? 0) + 1);
    } catch {
      /* ignore */
    }
  }

  const top = [...hosts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h]) => h);

  const sitePhrase =
    top.length === 0
      ? "several sites"
      : top.length === 1
        ? top[0]
        : `${top.slice(0, -1).join(", ")} and ${top.at(-1)}`;

  return `You have ${withUrl.length} tab${withUrl.length === 1 ? "" : "s"} open across ${hosts.size} site${hosts.size === 1 ? "" : "s"}; highlights include ${sitePhrase}.`;
}
