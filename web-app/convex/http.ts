import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { authKit } from "./auth";
import {
  getUserIdFromBearer,
  jsonResponse,
  optionsResponse,
} from "./extensionHttpHelpers";

const http = httpRouter();
authKit.registerRoutes(http);

function badAuth(): Response {
  return jsonResponse({ error: "Unauthorized" }, 401);
}

http.route({
  path: "/extension/startSession",
  method: "OPTIONS",
  handler: httpAction(async () => optionsResponse()),
});

http.route({
  path: "/extension/startSession",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const userId = await getUserIdFromBearer(ctx, request);
    if (!userId) return badAuth();

    let body: { goalDescription?: string };
    try {
      body = (await request.json()) as { goalDescription?: string };
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    const sessionId = await ctx.runMutation(internal.sessions.startSessionInternal, {
      userId,
      goalDescription: body.goalDescription,
    });

    return jsonResponse({ sessionId });
  }),
});

http.route({
  path: "/extension/endSession",
  method: "OPTIONS",
  handler: httpAction(async () => optionsResponse()),
});

http.route({
  path: "/extension/endSession",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const userId = await getUserIdFromBearer(ctx, request);
    if (!userId) return badAuth();

    let body: { sessionId: string };
    try {
      body = (await request.json()) as { sessionId: string };
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    await ctx.runMutation(internal.sessions.endSessionInternal, {
      userId,
      sessionId: body.sessionId as Id<"focusSessions">,
    });

    return jsonResponse({ ok: true });
  }),
});

http.route({
  path: "/extension/activeSession",
  method: "OPTIONS",
  handler: httpAction(async () => optionsResponse()),
});

http.route({
  path: "/extension/activeSession",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const userId = await getUserIdFromBearer(ctx, request);
    if (!userId) return badAuth();

    const session = await ctx.runQuery(internal.sessions.getActiveSessionForUserInternal, {
      userId,
    });

    return jsonResponse({ session });
  }),
});

http.route({
  path: "/extension/evaluateTab",
  method: "OPTIONS",
  handler: httpAction(async () => optionsResponse()),
});

http.route({
  path: "/extension/evaluateTab",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const userId = await getUserIdFromBearer(ctx, request);
    if (!userId) return badAuth();

    let body: {
      sessionId: string;
      url: string;
      domain: string;
      title: string;
      pageContentExcerpt?: string;
      contentHash?: string;
    };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    if (!body.sessionId || !body.url || !body.domain || !body.title) {
      return jsonResponse({ error: "Missing fields" }, 400);
    }

    try {
      const result = await ctx.runAction(internal.extensionTabActions.evaluateTabPipeline, {
        userId,
        sessionId: body.sessionId as Id<"focusSessions">,
        url: body.url,
        domain: body.domain,
        title: body.title,
        pageContentExcerpt: body.pageContentExcerpt,
        contentHash: body.contentHash,
      });
      return jsonResponse(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Evaluation failed";
      return jsonResponse({ error: message }, 400);
    }
  }),
});

http.route({
  path: "/extension/overrideDecision",
  method: "OPTIONS",
  handler: httpAction(async () => optionsResponse()),
});

http.route({
  path: "/extension/overrideDecision",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const userId = await getUserIdFromBearer(ctx, request);
    if (!userId) return badAuth();

    let body: { decisionId: string; newDecision: "allowed" | "blocked" };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    if (!body.decisionId || !body.newDecision) {
      return jsonResponse({ error: "Missing fields" }, 400);
    }

    try {
      await ctx.runMutation(internal.tabDecisions.overrideDecisionInternal, {
        userId,
        decisionId: body.decisionId as Id<"tabDecisions">,
        newDecision: body.newDecision,
      });
      return jsonResponse({ ok: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Override failed";
      return jsonResponse({ error: message }, 400);
    }
  }),
});

export default http;
