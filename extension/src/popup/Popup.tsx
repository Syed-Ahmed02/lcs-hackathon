import { useState, useEffect } from 'react'
import { getLinkedAuth, clearLinkedAuth, clearActiveSession } from '../lib/storage'
import { LinkAccount } from './LinkAccount'
import { SessionControls } from './SessionControls'

type Screen = 'loading' | 'link' | 'session'

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
        <h1>Focus Guard</h1>
      </div>

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
    </>
  )
}
