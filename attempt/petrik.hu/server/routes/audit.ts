import { Router } from 'express'
import { CAPABILITY } from '../../shared/pnw/types.ts'
import { requireCapability } from '../middleware/auth.ts'
import { recentAudit } from '../lib/audit.ts'

const router = Router()

/** Mirrors render_audit() - the full 100-event log. */
router.get('/', requireCapability(CAPABILITY.VIEW_AUDIT_LOG), async (req, res) => {
  const limit = Math.min(200, Number(req.query.limit) || 100)
  res.json({ entries: await recentAudit(limit) })
})

export default router
