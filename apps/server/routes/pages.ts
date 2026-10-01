/**
 * The Szerkesztő's backend (AGENT.md 6.20) - every endpoint behind
 * `pnw_manage_pages`. The public side reads the same data through
 * GET /api/public/site (routes/public.ts), published pages and tombstones only.
 *
 * Two kinds of page share the `pages` table: pages created in the Szerkesztő
 * (`/:id`, served at `/<slug>/`) and edits of the 53 mirrored routes
 * (`/by-route`, keyed by the route itself - a missing row means "use the
 * bundled default document").
 */
import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import type { Request } from 'express'
import { CAPABILITY } from '../../../shared/pnw/types.ts'
import { RESERVED_SLUGS } from '../../../shared/pnw/page-types.ts'
import type { MenuNode, PageStatus, StoredPage } from '../../../shared/pnw/page-types.ts'
import { MIRROR_ROUTES } from '../../../shared/pnw/mirror-routes.ts'
import { uniqueSlug } from '../../../shared/pnw/slug.ts'
import { requireCapability } from '../middleware/auth.ts'
import {
  deletePage,
  deletePageByRoute,
  existingPageSlugs,
  getPage,
  getPageByRoute,
  listSummaries,
  savePage,
} from '../data/pages-repo.ts'
import { clearMenu, getMenu, putMenu } from '../data/menu-repo.ts'
import { sanitizePageDocument, sanitizeSiteMenu } from '../lib/validation.ts'
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

/** `?route=` of a mirrored page: `/nyolcadikos/`, `/`, `/docs/uv-mini/` - only the routes the bundled registry has. */
function mirroredRoute(req: Request): string | null {
  const route = req.query.route
  return typeof route === 'string' && Object.hasOwn(MIRROR_ROUTES, route) ? route : null
}

/** Drops every menu entry pointing at `to` - a deleted page leaves no dead link behind. */
function withoutTarget(nodes: MenuNode[], to: string): MenuNode[] {
  return nodes
    .filter((node) => node.to !== to)
    .map((node) => (node.children ? { ...node, children: withoutTarget(node.children, to) } : node))
}

/* --- overview ------------------------------------------------------------ */

/** Every saved page - created ones, edited and deleted mirrored ones - without their documents. */
router.get('/', (_req, res) => {
  res.json({ pages: listSummaries() })
})

/* --- mirrored pages ------------------------------------------------------- */

/** The saved edit (or tombstone) of a mirrored route; `page: null` means it is still the default. */
router.get('/by-route', (req, res) => {
  const route = mirroredRoute(req)
  if (!route) {
    res.status(400).json({ error: 'invalid_route' })
    return
  }
  res.json({ page: getPageByRoute(route) ?? null })
})

/** Saves a mirrored page as a full document that replaces its default. */
router.put('/by-route', (req, res) => {
  const route = mirroredRoute(req)
  if (!route) {
    res.status(400).json({ error: 'invalid_route' })
    return
  }
  const identity = MIRROR_ROUTES[route]
  const title = text(req.body?.title, 200)
  const document = sanitizePageDocument(req.body?.document, identity)
  if (!title || !document) {
    res.status(422).json({ error: title ? 'invalid_document' : 'missing_title' })
    return
  }

  const timestamp = now()
  const existing = getPageByRoute(route)
  const page: StoredPage = {
    id: existing?.id ?? randomUUID(),
    route,
    origin: 'mirror',
    template: identity.template,
    deleted: false,
    title,
    description: text(req.body?.description, 500),
    document,
    status: status(req.body?.status),
    authorId: existing?.authorId ?? req.pnwUser!.id,
    createdAt: existing?.createdAt ?? timestamp,
    modifiedAt: timestamp,
    modifiedById: req.pnwUser!.id,
  }
  savePage(page)
  res.json({ page })
})

/**
 * "Törlés" of a mirrored page: a tombstone, not a removed row - the route
 * serves the 404 and the page leaves the menu, until "Visszaállítás" drops the
 * tombstone and the default is back.
 */
router.delete('/by-route', (req, res) => {
  const route = mirroredRoute(req)
  if (!route) {
    res.status(400).json({ error: 'invalid_route' })
    return
  }
  const existing = getPageByRoute(route)
  const timestamp = now()
  savePage({
    id: existing?.id ?? randomUUID(),
    route,
    origin: 'mirror',
    template: MIRROR_ROUTES[route].template,
    deleted: true,
    title: existing?.title ?? route,
    description: '',
    document: null,
    status: 'publish',
    authorId: existing?.authorId ?? req.pnwUser!.id,
    createdAt: existing?.createdAt ?? timestamp,
    modifiedAt: timestamp,
    modifiedById: req.pnwUser!.id,
  })
  const stored = getMenu()
  if (stored) {
    putMenu({ primary: withoutTarget(stored.menu.primary, route), secondary: withoutTarget(stored.menu.secondary, route) })
  }
  res.json({ ok: true })
})

/** "Visszaállítás az eredetire": the edit or the tombstone goes, the bundled default is back. */
router.post('/by-route/reset', (req, res) => {
  const route = mirroredRoute(req)
  if (!route) {
    res.status(400).json({ error: 'invalid_route' })
    return
  }
  deletePageByRoute(route)
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

/* --- pages created in the Szerkesztő ----------------------------------------- */

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
  const page: StoredPage = {
    id: randomUUID(),
    route: `/${slug}/`,
    origin: 'custom',
    template: 'builder',
    deleted: false,
    slug,
    title,
    description: text(req.body?.description, 500),
    document,
    status: status(req.body?.status),
    authorId: req.pnwUser!.id,
    createdAt: timestamp,
    modifiedAt: timestamp,
    modifiedById: req.pnwUser!.id,
  }
  savePage(page)
  res.status(201).json({ page })
})

/** A page by id - only the ones created here; a mirrored page is addressed by its route. */
function customPage(id: string): StoredPage | undefined {
  const page = getPage(id)
  return page && page.origin === 'custom' ? page : undefined
}

router.get('/:id', (req, res) => {
  const page = customPage(req.params.id)
  if (!page) {
    res.status(404).json({ error: 'not_found' })
    return
  }
  res.json({ page })
})

router.put('/:id', (req, res) => {
  const existing = customPage(req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'not_found' })
    return
  }
  const title = text(req.body?.title, 200)
  const document = sanitizePageDocument(req.body?.document)
  if (!title || !document) {
    res.status(422).json({ error: title ? 'invalid_document' : 'missing_title' })
    return
  }

  const page = savePage({
    ...existing,
    title,
    description: text(req.body?.description, 500),
    document,
    status: status(req.body?.status),
    modifiedAt: now(),
    modifiedById: req.pnwUser!.id,
  })
  res.json({ page })
})

/**
 * WordPress's two-step delete: the first DELETE moves the page to the trash
 * (the route 404s and the menu loses its entry, but the document is kept and
 * can be restored); a DELETE on a page already in the trash removes it for good.
 */
router.delete('/:id', (req, res) => {
  const page = customPage(req.params.id)
  if (!page) {
    res.status(404).json({ error: 'not_found' })
    return
  }
  if (page.deleted) {
    deletePage(page.id)
    res.json({ ok: true, permanent: true })
    return
  }
  savePage({ ...page, deleted: true, modifiedAt: now(), modifiedById: req.pnwUser!.id })

  const stored = getMenu()
  if (stored) {
    putMenu({ primary: withoutTarget(stored.menu.primary, page.route), secondary: withoutTarget(stored.menu.secondary, page.route) })
  }
  res.json({ ok: true, permanent: false })
})

/** Out of the trash - back as a draft, so nothing goes live by surprise. */
router.post('/:id/restore', (req, res) => {
  const page = customPage(req.params.id)
  if (!page) {
    res.status(404).json({ error: 'not_found' })
    return
  }
  const restored = savePage({ ...page, deleted: false, status: 'draft', modifiedAt: now(), modifiedById: req.pnwUser!.id })
  res.json({ page: restored })
})

export default router
