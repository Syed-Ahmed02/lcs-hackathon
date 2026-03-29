export interface ActiveSession {
  sessionId: string
  goalDescription?: string
  extensionToken: string
}

export interface CachedDecision {
  decision: 'allowed' | 'blocked'
  reasoning?: string
  decisionId: string
  cachedAt: number
}

export interface ClassifyArgs {
  extensionToken: string
  sessionId: string
  url: string
  domain: string
  title: string
  goalDescription?: string
  pageContentExcerpt?: string
  contentHash?: string
}

export interface ClassifyResult {
  decision: 'allowed' | 'blocked'
  reasoning?: string
  decisionId: string
}

export type BackgroundMessage =
  | { type: 'OVERRIDE_DECISION'; decisionId: string; url: string }
  | { type: 'GET_TAB_STATUS'; url: string }
