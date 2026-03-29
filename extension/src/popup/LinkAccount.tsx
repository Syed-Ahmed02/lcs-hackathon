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
      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55, textAlign: 'center' }}>
        Open your dashboard, go to <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Link Extension</strong>, and enter the code below.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
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
