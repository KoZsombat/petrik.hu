/**
 * The Szerkesztő's backend (AGENT.md 6.19) - every endpoint behind
 * `pnw_manage_pages`. The public side reads the same data through
 * GET /api/public/site (routes/public.ts), published pages only.
 */
import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import type { Request } from 'express'
import { CAPABILITY } from '../../../shared/pnw/types.ts'
import { RESERVED_SLUGS } from '../../../shared/pnw/page-types.ts'
import type { BuilderPage, MenuNode, PageStatus } from '../../../shared/pnw/page-types.ts'
import { uniqueSlug } from '../../../shared/pnw/slug.ts'
import { requireCapability } from '../middleware/auth.ts'
import { createPage, deletePage, existingPageSlugs, getPage, listPages, updatePage } from '../data/pages-repo.ts'
import { allOverrides, clearOverrides, getOverrides, putOverrides } from '../data/overrides-repo.ts'
import { clearMenu, getMenu, putMenu } from '../data/menu-repo.ts'
import { sanitizePageDocument, sanitizePageOverrides, sanitizeSiteMenu } from '../lib/validation.ts'
import { listImages, storeImage, upload } from '../lib/uploads.ts'

const router = Router()

router.use(requireCapability(CAPABILITY.MANAGE_PAGES))

function now(): string {
  return new Date().toISOString()
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function status(value: unknown): PageStatus {
  return value === 'publish' ? 'publish' : 'draft'
}

/** A mirrored page's route: `/nyolcadikos/`, `/`, `/docs/uv-mini/` - never a query or a `..`. */
function mirroredRoute(req: Request): string | null {
  const route = req.query.route
  if (typeof route !== 'string' || route.length > 200) return null
  return /^\/([a-z0-9_-]+\/)*$/i.test(route) ? route : null
}

/** Drops every menu entry pointing at `to` - a deleted page leaves no dead link behind. */
function withoutTarget(nodes: MenuNode[], to: string): MenuNode[] {
  return nodes
    .filter((node) => node.to !== to)
    .map((node) => (node.children ? { ...node, children: withoutTarget(node.children, to) } : node))
}

/* --- overview ------------------------------------------------------------ */

router.get('/', (_req, res) => {
  res.json({
    pages: listPages(),
    overrides: allOverrides().map(({ overrides, modifiedAt }) => ({
      route: overrides.route,
      modifiedAt,
      hidden: overrides.hidden === true,
    })),
  })
})

/* --- mirrored pages: the override layer --------------------------------- */

router.get('/overrides', (req, res) => {
  const route = mirroredRoute(req)
  if (!route) {
    res.status(400).json({ error: 'invalid_route' })
    return
  }
  const stored = getOverrides(route)
  res.json({ overrides: stored?.overrides ?? null, modifiedAt: stored?.modifiedAt ?? null })
})

router.put('/overrides', (req, res) => {
  const route = mirroredRoute(req)
  if (!route) {
    res.status(400).json({ error: 'invalid_route' })
    return
  }
  const overrides = sanitizePageOverrides(req.body?.overrides, route)
  if (!overrides) {
    res.status(422).json({ error: 'invalid_overrides' })
    return
  }
  const stored = putOverrides(overrides, req.pnwUser!.id)
  res.json({ overrides: stored.overrides, modifiedAt: stored.modifiedAt })
})

/** "Eredeti visszaállítása" for the whole page. */
router.delete('/overrides', (req, res) => {
  const route = mirroredRoute(req)
  if (!route) {
    res.status(400).json({ error: 'invalid_route' })
    return
  }
  clearOverrides(route)
  res.json({ ok: true })
})

/* --- the menu ------------------------------------------------------------ */

router.get('/menu', (_req, res) => {
  const stored = getMenu()
  res.json({ menu: stored?.menu ?? null, modifiedAt: stored?.modifiedAt ?? null })
})

router.put('/menu', (req, res) => {
  const menu = sanitizeSiteMenu(req.body?.menu)
  if (!menu) {
    res.status(422).json({ error: 'invalid_menu' })
    return
  }
  putMenu(menu)
  res.json({ menu })
})

/** "Visszaállítás az eredetire" - the site falls back to src/data/site.ts. */
router.delete('/menu', (_req, res) => {
  clearMenu()
  res.json({ ok: true })
})

/* --- media ---------------------------------------------------------------- */

router.get('/media', async (_req, res) => {
  res.json({ items: await listImages() })
})

router.post('/media', upload.single('file'), async (req, res) => {
  const url = await storeImage(req.file)
  if (!url) {
    res.status(422).json({ error: 'not_an_image' })
    return
  }
  res.json({ url })
})

/* --- builder pages ---------------------------------------------------------- */

router.post('/', (req, res) => {
  const title = text(req.body?.title, 200)
  const document = sanitizePageDocument(req.body?.document)
  if (!title || !document) {
    res.status(422).json({ error: title ? 'invalid_document' : 'missing_title' })
    return
  }

  // Never a slug the app already routes, and never a bare number (the date archives live at /2026/...).
  const taken = new Set([...existingPageSlugs(), ...RESERVED_SLUGS])
  let slug = uniqueSlug(title, taken)
  if (/^\d+$/.test(slug)) slug = uniqueSlug(`oldal-${slug}`, taken)

  const timestamp = now()
  const page: BuilderPage = {
    id: randomUUID(),
    slug,
    title,
    description: text(req.body?.description, 500),
    document,
    status: status(req.body?.status),
    authorId: req.pnwUser!.id,
    createdAt: timestamp,
    modifiedAt: timestamp,
  }
  createPage(page)
  res.status(201).json({ page })
})

router.get('/:id', (req, res) => {
  const page = getPage(req.params.id)
  if (!page) {
    res.status(404).json({ error: 'not_found' })
    return
  }
  res.json({ page })
})

router.put('/:id', (req, res) => {
  if (!getPage(req.params.id)) {
    res.status(404).json({ error: 'not_found' })
    return
  }
  const title = text(req.body?.title, 200)
  const document = sanitizePageDocument(req.body?.document)
  if (!title || !document) {
    res.status(422).json({ error: title ? 'invalid_document' : 'missing_title' })
    return
  }

  const page = updatePage(req.params.id, (existing) => ({
    ...existing,
    title,
    description: text(req.body?.description, 500),
    document,
    status: status(req.body?.status),
    modifiedAt: now(),
  }))
  res.json({ page })
})

/** Really deleted: the row goes, the route 404s, and the menu loses its entry. */
router.delete('/:id', (req, res) => {
  const page = getPage(req.params.id)
  if (!page) {
    res.status(404).json({ error: 'not_found' })
    return
  }
  deletePage(page.id)

  const stored = getMenu()
  if (stored) {
    const to = `/${page.slug}/`
    putMenu({ primary: withoutTarget(stored.menu.primary, to), secondary: withoutTarget(stored.menu.secondary, to) })
  }
  res.json({ ok: true })
})

export default router
