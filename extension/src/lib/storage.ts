import type { ActiveSession } from './types'

// ---------------------------------------------------------------------------
// chrome.storage.local — persists across browser restarts
// ---------------------------------------------------------------------------

export async function getLinkedAuth(): Promise<{ extensionToken: string; userId: string } | null> {
  const result = await chrome.storage.local.get(['extensionToken', 'userId'])
  if (!result.extensionToken || !result.userId) return null
  return { extensionToken: result.extensionToken as string, userId: result.userId as string }
}

export async function setLinkedAuth(extensionToken: string, userId: string): Promise<void> {
  await chrome.storage.local.set({ extensionToken, userId })
}

export async function clearLinkedAuth(): Promise<void> {
  await chrome.storage.local.remove(['extensionToken', 'userId'])
}

export async function getActiveSession(): Promise<ActiveSession | null> {
  const result = await chrome.storage.local.get(['activeSession'])
  return (result.activeSession as ActiveSession) ?? null
}

export async function setActiveSession(session: ActiveSession): Promise<void> {
  await chrome.storage.local.set({ activeSession: session })
}

export async function clearActiveSession(): Promise<void> {
  await chrome.storage.local.remove(['activeSession'])
}

// ---------------------------------------------------------------------------
// chrome.storage.session — survives SW sleep/wake, clears on browser close
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

export interface CachedDecision {
  decision: 'allowed' | 'blocked'
  reasoning?: string
  decisionId: string
  cachedAt: number
}

export function buildCacheKey(url: string): string {
  try {
    const u = new URL(url)
    return `cache:${u.origin}${u.pathname}`
  } catch {
    return `cache:${url}`
  }
}

export async function getCachedDecision(cacheKey: string): Promise<CachedDecision | null> {
  const result = await chrome.storage.session.get(cacheKey)
  const entry = result[cacheKey] as CachedDecision | undefined
  if (!entry) return null
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    await chrome.storage.session.remove(cacheKey)
    return null
  }
  return entry
}

export async function setCachedDecision(cacheKey: string, entry: CachedDecision): Promise<void> {
  await chrome.storage.session.set({ [cacheKey]: entry })
}

export async function updateCachedDecisionToAllowed(url: string, decisionId: string): Promise<void> {
  const key = buildCacheKey(url)
  const entry: CachedDecision = { decision: 'allowed', decisionId, cachedAt: Date.now() }
  await chrome.storage.session.set({ [key]: entry })
}

export async function clearDecisionCache(): Promise<void> {
  await chrome.storage.session.clear()
}
