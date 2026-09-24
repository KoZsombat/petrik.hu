import { Router } from 'express'
import { requireCapability } from '../middleware/auth.ts'
import { recentAudit } from '../lib/audit.ts'

const router = Router()

/** Mirrors render_audit() - the full 100-event log. */
router.get('/', requireCapability('pnw_view_audit_log'), async (req, res) => {
  const limit = Math.min(200, Number(req.query.limit) || 100)
  res.json({ entries: await recentAudit(limit) })
})

export default router
