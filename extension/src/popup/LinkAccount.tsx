import { useState } from 'react'
import { extExchangeLinkCode } from '../lib/convex'
import { setLinkedAuth } from '../lib/storage'

interface Props {
  onLinked: () => void
}

export function LinkAccount({ onLinked }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.trim().length !== 6) {
      setError('Enter the 6-character code from your dashboard.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await extExchangeLinkCode(code.trim().toUpperCase())
      if (!result.success) {
        setError(result.reason)
        return
      }
      await setLinkedAuth(result.extensionToken, result.userId)
      onLinked()
    } catch (err) {
      setError('Connection failed. Check your internet and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="popup-body">
      <div className="link-hero">
        <svg className="link-hero-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 17H7A5 5 0 0 1 7 7h2" />
          <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
          <line x1="8" x2="16" y1="12" y2="12" />
        </svg>
        <p className="link-hero-title">Link to your dashboard</p>
      </div>

      <ol className="link-steps" aria-label="Steps to link your account">
        <li>Open your <strong>FocusFlow dashboard</strong></li>
        <li>Go to <strong>Link Extension</strong></li>
        <li>Copy the 6-character code</li>
      </ol>

      <form onSubmit={handleSubmit} className="link-form">
        <div>
          <label htmlFor="link-code">Link Code</label>
          <input
            id="link-code"
            type="text"
            className="code-input"
            maxLength={6}
            placeholder="ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            aria-describedby={error ? 'link-error' : undefined}
          />
        </div>

        {error && <p id="link-error" className="error-text" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading || code.trim().length !== 6}>
          {loading ? <><span className="spinner" /> Linking…</> : 'Link Account'}
        </button>
      </form>
    </div>
  )
}
