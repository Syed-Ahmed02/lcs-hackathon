import {
  getActiveSession,
  buildCacheKey,
  getCachedDecision,
  setCachedDecision,
  updateCachedDecisionToAllowed,
  clearDecisionCache,
} from '../lib/storage'
import { extClassifyAndRecord, extRecordManualOverride } from '../lib/convex'
import type { BackgroundMessage } from '../lib/types'

// ---------------------------------------------------------------------------
// Tab event listeners
// ---------------------------------------------------------------------------

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return
  if (!tab.url) return
  await handleTabNavigation(tabId, tab.url, tab.title ?? '')
})

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  let tab: chrome.tabs.Tab
  try {
    tab = await chrome.tabs.get(tabId)
  } catch {
    return
  }
  if (!tab.url) return
  await handleTabNavigation(tabId, tab.url, tab.title ?? '')
})

// ---------------------------------------------------------------------------
// Core navigation handler
// ---------------------------------------------------------------------------

// Track in-flight classifications to avoid duplicate requests
const classifying = new Set<string>()

async function handleTabNavigation(tabId: number, url: string, title: string): Promise<void> {
  // Skip extension pages and browser internals
  if (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('about:') ||
    url.startsWith('edge://')
  )
    return

  const session = await getActiveSession()
  if (!session) return

  const cacheKey = buildCacheKey(url)

  // Check decision cache first
  const cached = await getCachedDecision(cacheKey)
  if (cached) {
    if (cached.decision === 'blocked') {
      await injectBlockOverlay(tabId, url, cached.reasoning ?? 'This page does not align with your focus goal.', cached.decisionId)
    }
    return
  }

  // Skip if already classifying this URL
  if (classifying.has(cacheKey)) return
  classifying.add(cacheKey)

  try {
    // Extract page content
    const pageContentExcerpt = await extractPageContent(tabId)

    let domain = ''
    try {
      domain = new URL(url).hostname
    } catch {
      domain = url
    }

    // Classify via Convex (OpenRouter AI)
    const result = await extClassifyAndRecord({
      extensionToken: session.extensionToken,
      sessionId: session.sessionId,
      url,
      domain,
      title,
      goalDescription: session.goalDescription,
      pageContentExcerpt: pageContentExcerpt || undefined,
    })

    // Cache the result
    await setCachedDecision(cacheKey, {
      decision: result.decision,
      reasoning: result.reasoning,
      decisionId: result.decisionId,
      cachedAt: Date.now(),
    })

    // Enforce — inject overlay if blocked
    if (result.decision === 'blocked') {
      await injectBlockOverlay(
        tabId,
        url,
        result.reasoning ?? 'This page does not align with your focus goal.',
        result.decisionId,
      )
    }
  } catch (err) {
    console.error('[FocusGuard] Classification error:', err)
  } finally {
    classifying.delete(cacheKey)
  }
}

// ---------------------------------------------------------------------------
// Page content extraction
// ---------------------------------------------------------------------------

async function extractPageContent(tabId: number): Promise<string> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/extractor.js'],
    })
    const value = results[0]?.result
    if (typeof value === 'string') return value.slice(0, 2000)
    return ''
  } catch {
    // Content scripts may fail on some pages (e.g. chrome:// or protected pages)
    return ''
  }
}

// ---------------------------------------------------------------------------
// Block overlay injection
// ---------------------------------------------------------------------------

async function injectBlockOverlay(
  tabId: number,
  url: string,
  reason: string,
  decisionId: string,
): Promise<void> {
  try {
    // First, pass context to the overlay script via window.__overlayArgs
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (args: { reason: string; decisionId: string; blockedUrl: string }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).__overlayArgs = args
      },
      args: [{ reason, decisionId, blockedUrl: url }],
    })

    // Inject the overlay script
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/overlay.js'],
    })
  } catch (err) {
    console.error('[FocusGuard] Overlay injection error:', err)
  }
}

// ---------------------------------------------------------------------------
// Message listener — handles messages from the overlay and popup
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
  if (message.type === 'OVERRIDE_DECISION') {
    handleOverride(message.decisionId, message.url)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }))
    return true // Keep message channel open for async response
  }
})

async function handleOverride(decisionId: string, url: string): Promise<void> {
  const session = await getActiveSession()
  if (!session) return

  await extRecordManualOverride(session.extensionToken, decisionId, 'allowed')
  await updateCachedDecisionToAllowed(url, decisionId)
}

// ---------------------------------------------------------------------------
// Session lifecycle — listen for session cleared from popup
// ---------------------------------------------------------------------------

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'local' && changes.activeSession?.newValue === undefined && changes.activeSession?.oldValue !== undefined) {
    // Session was cleared — wipe the decision cache
    await clearDecisionCache()
  }
})
