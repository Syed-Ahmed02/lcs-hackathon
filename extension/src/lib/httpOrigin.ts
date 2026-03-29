export function convexHttpOrigin(convexUrl: string): string {
  return convexUrl.replace(/\.convex\.cloud\/?$/i, ".convex.site");
}
