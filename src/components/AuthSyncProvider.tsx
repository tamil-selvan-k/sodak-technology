'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'

const CHANNEL_NAME = 'auth-sync'
const LOGOUT_MSG = 'logout'

let channel: BroadcastChannel | null = null

export function broadcastLogout() {
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME)
    ch.postMessage(LOGOUT_MSG)
    ch.close()
  } catch {}
}

export default function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME)
    } catch {
      return
    }

    function handleMessage(event: MessageEvent) {
      if (event.data === LOGOUT_MSG) {
        signOut({ callbackUrl: '/admin/login' })
      }
    }

    channel.addEventListener('message', handleMessage)

    return () => {
      channel?.removeEventListener('message', handleMessage)
      channel?.close()
      channel = null
    }
  }, [])

  return <>{children}</>
}
