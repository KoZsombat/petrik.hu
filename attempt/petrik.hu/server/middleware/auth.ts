import type { NextFunction, Request, Response } from 'express'
import type { Capability, SessionUser } from '../../shared/pnw/types.ts'
import { hasCapability } from '../../shared/pnw/roles.ts'
import { findUserById } from '../data/users-repo.ts'

export function sessionUser(req: Request): SessionUser | null {
  const userId = req.session.userId
  if (!userId) return null

  const user = findUserById(userId)
  if (!user) return null

  return {
    id: user.id,
    displayName: user.displayName,
    role: user.role,
    allowedCategoryIds: user.allowedCategoryIds,
  }
}

/** Populates req.pnwUser when a session exists; never itself rejects the request. */
export function attachUser(req: Request, _res: Response, next: NextFunction): void {
  req.pnwUser = sessionUser(req) ?? undefined
  next()
}

export function requireLogin(req: Request, res: Response, next: NextFunction): void {
  if (!req.pnwUser) {
    res.status(401).json({ error: 'not_logged_in' })
    return
  }
  next()
}

/** Ported from PNW_Actions::require_login_and_cap(). */
export function requireCapability(capability: Capability) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.pnwUser || !hasCapability(req.pnwUser.role, capability)) {
      res.status(403).json({ error: 'forbidden' })
      return
    }
    next()
  }
}
