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
      <div style={{ textAlign: 'center', paddingBottom: '0.5rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔗</div>
        <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
          Open your dashboard, go to <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Link Extension</strong>, and enter the code below.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading || code.trim().length !== 6}>
          {loading ? <><span className="spinner" /> Linking…</> : 'Link Account'}
        </button>
      </form>
    </div>
  )
}
