import type { ActiveSession } from './types'
import { storageLocalGet, storageLocalRemove, storageLocalSet } from './chromeStorage'

// ---------------------------------------------------------------------------
// chrome.storage.local — persists across browser restarts
// ---------------------------------------------------------------------------

export async function getLinkedAuth(): Promise<{ extensionToken: string; userId: string } | null> {
  const result = await storageLocalGet(['extensionToken', 'userId'])
  if (!result.extensionToken || !result.userId) return null
  return { extensionToken: result.extensionToken as string, userId: result.userId as string }
}

export async function setLinkedAuth(extensionToken: string, userId: string): Promise<void> {
  await storageLocalSet({ extensionToken, userId })
}

export async function clearLinkedAuth(): Promise<void> {
  await storageLocalRemove(['extensionToken', 'userId'])
}

export async function getActiveSession(): Promise<ActiveSession | null> {
  const result = await storageLocalGet(['activeSession'])
  return (result.activeSession as ActiveSession) ?? null
}

export async function setActiveSession(session: ActiveSession): Promise<void> {
  await storageLocalSet({ activeSession: session })
}

export async function clearActiveSession(): Promise<void> {
  await storageLocalRemove(['activeSession'])
}

// ---------------------------------------------------------------------------
// chrome.storage.session — survives SW sleep/wake, clears on browser close
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes
const SESSION_PREFIX = 'session:'

export interface CachedDecision {
  decision: 'allowed' | 'blocked'
  reasoning?: string
  decisionId: string
  cachedAt: number
}

export function buildCacheKey(url: string): string {
  try {
    const u = new URL(url)
    u.hash = ''
    return `cache:${u.origin}${u.pathname}${u.search}`
  } catch {
    return `cache:${url}`
  }
}

export async function getCachedDecision(cacheKey: string): Promise<CachedDecision | null> {
  const result = await storageLocalGet([SESSION_PREFIX + cacheKey])
  const entry = result[SESSION_PREFIX + cacheKey] as CachedDecision | undefined
  if (!entry) return null
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    await storageLocalRemove([SESSION_PREFIX + cacheKey])
    return null
  }
  return entry
}

export async function setCachedDecision(cacheKey: string, entry: CachedDecision): Promise<void> {
  await storageLocalSet({ [SESSION_PREFIX + cacheKey]: entry })
}

export async function updateCachedDecisionToAllowed(url: string, decisionId: string): Promise<void> {
  const key = buildCacheKey(url)
  const entry: CachedDecision = { decision: 'allowed', decisionId, cachedAt: Date.now() }
  await storageLocalSet({ [SESSION_PREFIX + key]: entry })
}

export async function clearDecisionCache(): Promise<void> {
  const result = await storageLocalGet([])
  const sessionKeys = Object.keys(result).filter((key) => key.startsWith(SESSION_PREFIX))
  if (sessionKeys.length > 0) {
    await storageLocalRemove(sessionKeys)
  }
}
