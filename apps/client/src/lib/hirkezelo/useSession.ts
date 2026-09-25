import { useCallback, useEffect, useState } from 'react'
import * as api from './api.ts'
import type { ApiUser } from './api.ts'

export type SessionState = {
  user: ApiUser | null
  /** True until the initial GET /api/auth/me call resolves. */
  loading: boolean
  login: (login: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

/** Current Hírkezelő session, backed by the Express server's cookie (server/middleware/auth.ts). */
export function useSession(): SessionState {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    api
      .me()
      .then(({ user }) => {
        if (!cancelled) setUser(user)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (loginValue: string, password: string) => {
    const { user } = await api.login(loginValue, password)
    setUser(user)
  }, [])

  const logout = useCallback(async () => {
    await api.logout()
    setUser(null)
  }, [])

  return { user, loading, login, logout }
}
