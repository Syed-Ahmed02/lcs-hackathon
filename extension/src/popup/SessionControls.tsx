import { useState, useEffect } from 'react'
import { extGetLinkedState, extStartSession, extEndSession } from '../lib/convex'
import { getActiveSession, setActiveSession, clearActiveSession } from '../lib/storage'
import type { ActiveSession } from '../lib/types'

interface Props {
  extensionToken: string
  onUnlink: () => void
}

function formatElapsed(startedAt: number): string {
  const secs = Math.floor((Date.now() - startedAt) / 1000)
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function SessionControls({ extensionToken, onUnlink }: Props) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [serverSession, setServerSession] = useState<{ startedAt?: number } | null>(null)
  const [goal, setGoal] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [elapsed, setElapsed] = useState('')

  // Load current state on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [localSession, state] = await Promise.all([
          getActiveSession(),
          extGetLinkedState(extensionToken),
        ])

        if (cancelled) return

        const activeOnServer = state.activeSession as { _id: string; goalDescription?: string; startedAt: number } | null

        if (activeOnServer) {
          // Sync local storage with server state
          const synced: ActiveSession = {
            sessionId: activeOnServer._id,
            goalDescription: activeOnServer.goalDescription,
            extensionToken,
          }
          await setActiveSession(synced)
          setSession(synced)
          setServerSession({ startedAt: activeOnServer.startedAt })
        } else if (localSession) {
          // Local session but no server session — clear stale local state
          await clearActiveSession()
          setSession(null)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [extensionToken])

  // Elapsed timer
  useEffect(() => {
    if (!serverSession?.startedAt) return
    const update = () => setElapsed(formatElapsed(serverSession.startedAt!))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [serverSession])

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    setActionLoading(true)
    setError(null)
    try {
      const { sessionId } = await extStartSession(extensionToken, goal.trim() || undefined)
      const newSession: ActiveSession = { sessionId, goalDescription: goal.trim() || undefined, extensionToken }
      await setActiveSession(newSession)
      setSession(newSession)
      setServerSession({ startedAt: Date.now() })
    } catch (err) {
      setError('Failed to start session. Try again.')
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleStop() {
    if (!session) return
    setActionLoading(true)
    setError(null)
    try {
      await extEndSession(extensionToken, session.sessionId)
      await clearActiveSession()
      setSession(null)
      setServerSession(null)
    } catch (err) {
      setError('Failed to end session. Try again.')
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div className="loading-center"><span className="spinner" /></div>
  }

  if (session) {
    return (
      <div className="popup-body">
        <div className="session-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span className="badge badge-allowed">● Active</span>
            <span className="session-meta">{elapsed}</span>
          </div>
          {session.goalDescription && (
            <p className="session-goal">{session.goalDescription}</p>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-danger" onClick={handleStop} disabled={actionLoading}>
          {actionLoading ? <><span className="spinner" /> Ending…</> : '⏹ End Session'}
        </button>

        <hr className="divider" />
        <button className="btn btn-ghost" onClick={onUnlink} style={{ alignSelf: 'center' }}>
          Unlink account
        </button>
      </div>
    )
  }

  return (
    <div className="popup-body">
      <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <label htmlFor="goal-input">Focus Goal</label>
          <textarea
            id="goal-input"
            rows={3}
            placeholder="e.g. Write unit tests for the auth module"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            autoFocus
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={actionLoading}>
          {actionLoading ? <><span className="spinner" /> Starting…</> : '▶ Start Focus Session'}
        </button>
      </form>

      <hr className="divider" />
      <button className="btn btn-ghost" onClick={onUnlink} style={{ alignSelf: 'center' }}>
        Unlink account
      </button>
    </div>
  )
}
