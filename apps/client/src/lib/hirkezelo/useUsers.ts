import { useEffect, useState } from 'react'
import * as api from './api.ts'
import type { ApiUser } from './api.ts'

// The 3-user directory never changes at runtime, so one fetch per page load
// (cached at module scope) is enough for every view that needs a display name.
let cache: Map<string, ApiUser> | null = null
let inflight: Promise<Map<string, ApiUser>> | null = null

function load(): Promise<Map<string, ApiUser>> {
  if (cache) return Promise.resolve(cache)
  inflight ??= api.listUsers().then(({ users }) => {
    cache = new Map(users.map((user) => [user.id, user]))
    return cache
  })
  return inflight
}

export function useUsers(): Map<string, ApiUser> {
  const [users, setUsers] = useState<Map<string, ApiUser>>(cache ?? new Map())

  useEffect(() => {
    let cancelled = false
    load().then((map) => {
      if (!cancelled) setUsers(map)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return users
}
