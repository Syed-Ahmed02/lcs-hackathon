import type { GenericActionCtx } from "convex/server";
import { internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

const cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export function corsHeaders(): Record<string, string> {
  return cors;
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

export function optionsResponse(): Response {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function getUserIdFromBearer(
  ctx: GenericActionCtx<DataModel>,
  request: Request,
): Promise<string | null> {
  const auth = request.headers.get("Authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!token) return null;
  const row = await ctx.runQuery(internal.extensionAuth.getUserByExtensionToken, { token });
  return row?.userId ?? null;
}
