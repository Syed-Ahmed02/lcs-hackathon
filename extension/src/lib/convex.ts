import { ConvexHttpClient } from 'convex/browser'
import type { ClassifyArgs, ClassifyResult } from './types'

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string

// One client per service worker module load (recreated on SW wake)
export const convexClient = new ConvexHttpClient(CONVEX_URL)

// ---------------------------------------------------------------------------
// Typed wrappers — use string-based function references so no generated
// api.ts import is needed from this separate package
// ---------------------------------------------------------------------------

function call<T>(
  method: 'query' | 'mutation' | 'action',
  path: string,
  args: Record<string, unknown>,
): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (convexClient as any)[method](path, args) as Promise<T>
}

export function extGetLinkedState(extensionToken: string) {
  return call<{ userId: string; activeSession: unknown | null }>(
    'query',
    'extensionApi:getLinkedState',
    { extensionToken },
  )
}

export function extStartSession(extensionToken: string, goalDescription?: string) {
  return call<{ sessionId: string }>(
    'mutation',
    'extensionApi:startSession',
    { extensionToken, goalDescription },
  )
}

export function extEndSession(extensionToken: string, sessionId: string) {
  return call<null>('mutation', 'extensionApi:endSession', { extensionToken, sessionId })
}

export function extClassifyAndRecord(args: ClassifyArgs): Promise<ClassifyResult> {
  return call<ClassifyResult>('action', 'extensionApiActions:classifyAndRecord', args as unknown as Record<string, unknown>)
}

export function extRecordManualOverride(
  extensionToken: string,
  decisionId: string,
  newDecision: 'allowed' | 'blocked',
) {
  return call<null>('mutation', 'extensionApi:recordManualOverride', {
    extensionToken,
    decisionId,
    newDecision,
  })
}

export function extGetSessionDecisions(extensionToken: string, sessionId: string, limit?: number) {
  return call<unknown[]>('query', 'extensionApi:getSessionDecisions', {
    extensionToken,
    sessionId,
    limit,
  })
}

export function extExchangeLinkCode(code: string) {
  return call<
    | { success: true; userId: string; extensionToken: string }
    | { success: false; reason: string }
  >('mutation', 'linking:exchangeLinkCode', { code })
}
