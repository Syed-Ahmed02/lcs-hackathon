import { useState, useEffect } from 'react'
import { getLinkedAuth, clearLinkedAuth, clearActiveSession } from '../lib/storage'
import { LinkAccount } from './LinkAccount'
import { SessionControls } from './SessionControls'

type Screen = 'loading' | 'link' | 'session'

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function Popup() {
  const [screen, setScreen] = useState<Screen>('loading')
  const [extensionToken, setExtensionToken] = useState<string | null>(null)

  useEffect(() => {
    getLinkedAuth().then((auth) => {
      if (auth) {
        setExtensionToken(auth.extensionToken)
        setScreen('session')
      } else {
        setScreen('link')
      }
    })
  }, [])

  async function handleUnlink() {
    await clearLinkedAuth()
    await clearActiveSession()
    setExtensionToken(null)
    setScreen('link')
  }

  return (
    <>
      <div className="popup-header">
        <span className="logo" aria-hidden="true"><ShieldIcon /></span>
        <h1>FocusFlow</h1>
      </div>

      <div className={`popup-screen ${screen !== 'loading' ? 'popup-screen-visible' : ''}`}>
        {screen === 'loading' && (
          <div className="loading-center"><span className="spinner" /></div>
        )}

        {screen === 'link' && (
          <LinkAccount
            onLinked={() => {
              getLinkedAuth().then((auth) => {
                if (auth) {
                  setExtensionToken(auth.extensionToken)
                  setScreen('session')
                }
              })
            }}
          />
        )}

        {screen === 'session' && extensionToken && (
          <SessionControls
            extensionToken={extensionToken}
            onUnlink={handleUnlink}
          />
        )}
      </div>
    </>
  )
}
