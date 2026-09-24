# /bejelentkezes + /szerkeszto — a WordPress-like page editor for the ported site

## Context

The port at `attempt/petrik.hu` renders 129 mirrored routes from compile-time TSX
(`src/pages/*.tsx` + a per-page Divi stylesheet scoped to `.page-<slug>`). The only
dynamic part is `/hirkezelo/` — a news workflow backed by Express + SQLite with session
auth, per-account capabilities (**no roles** — AGENT.md §6.16), and a no-raw-HTML
`RichTextDocument` model (AGENT.md §6.15).

There is no way to change a page's text without editing code, and no way to add a page at
all. The goal is a CMS layer on top of the existing port:

- `/bejelentkezes/` — one login that then offers **Hírkezelő** or **Szerkesztő**.
- `/szerkeszto/` — edit the content of existing subpages (Nyolcadikosoknak & co.), create
  new pages that look like real site pages, delete them, and manage the main menu.

Confirmed scope decisions:

| Decision | Choice |
|---|---|
| Existing pages | Content overrides + section hide/reorder + appended sections (layout & pixel-accurate CSS untouched) |
| Access | New `pnw_manage_pages` capability, granted per account on the Fiókok screen (there are no roles — AGENT.md §6.16) |
| Menu | Full menu editor, fetched at runtime and merged over `src/data/site.ts` with static fallback |
| New page URLs | Top-level `/slug/`, resolved by a catch-all route before the 404 |
| Width | `/bejelentkezes/` and `/szerkeszto/` are 75% wide and centered, like `/hirkezelo/` (AGENT.md §6.17) |

No new npm dependencies (AGENT.md §1): `express-session`, `better-sqlite3`, `multer`,
`bcryptjs`, `node-html-parser` are all already present.

**Hard constraints carried over from AGENT.md:** no `dangerouslySetInnerHTML` anywhere; no
invented CSS rules (lift them from the mirror's stylesheets); `src/pages/*.tsx` generated
files are never hand-edited; the site must still render fully when the backend is down.

---

## Architecture in one paragraph

Two content mechanisms, one editor. **Existing pages** stay exactly as they are and gain a
runtime *override layer*: the Divi primitives (`Text`, `Image`, `Button`, `Blurb`,
`Section`) look up an override by their existing `index` prop and render replacement
content when one exists. **New pages** are stored as a structured `PageDocument` and
rendered through those same Divi primitives, so their markup — and therefore their look —
is the same shape as a generated page. Both are served by one extra public fetch per page
load, mirroring how `PostsProvider` already merges live posts over static data.

---

## Phase 1 — Shared model

**`shared/pnw/types.ts`** — extend the rich-text model, all fields optional so
`/hirkezelo/` behaviour is unchanged:

- `TextRun` gains `color?: string`, `href?: string`, `underline?: boolean`.
- `RichTextBlock` gains `level?: 1 | 2 | 3 | 4` (used when `type === 'heading'`, default 2).
- New capability `'pnw_manage_pages'` in the `CAPABILITY` const / `Capability` union.

**`shared/pnw/permissions.ts`** (the file that replaced `roles.ts` in §6.16) — add
`pnw_manage_pages` to `ALL_CAPABILITIES` plus its `CAPABILITY_LABEL`/
`CAPABILITY_DESCRIPTION` entries (that is all it takes for the Fiókok screen to offer it
as a checkbox), and a `canManagePages(user)` helper next to the existing
`canManagePublished(user)`. No role table to edit — accounts carry their own permission
sets, and an existing account gets the new right by ticking it.

**`src/components/hirkezelo/RichText.tsx`** — render the new marks (`<a>`, `<span style>`,
`<u>`, `h1`–`h4`) and treat `\n` inside a run as `<br />`. Still pure JSX.

**`shared/pnw/page-types.ts`** (new) — the document model for builder pages:

```ts
export type PageModule =
  | { kind: 'text'; id: string; align?: TextAlign; bgLayout?: 'light' | 'dark'; content: RichTextDocument }
  | { kind: 'image'; id: string; src: string; alt?: string; href?: string; width?: number; height?: number }
  | { kind: 'button'; id: string; label: string; to?: string; href?: string; align?: Align }
  | { kind: 'blurb'; id: string; title?: string; titleHref?: string; image?: {...}; icon?: string; content: RichTextDocument }
  | { kind: 'divider'; id: string }
  | { kind: 'video'; id: string; url: string }
  | { kind: 'toggle'; id: string; title: string; content: RichTextDocument }

export type PageColumn = { id: string; span: ColumnSpan; modules: PageModule[] }
export type PageRow = { id: string; gutters?: 3 | 4; columns: PageColumn[] }
export type PageSection = { id: string; first?: boolean; background?: { color?: string; image?: string }; dividerTop?: boolean; dividerBottom?: boolean; rows: PageRow[] }
export type PageDocument = { sections: PageSection[] }

/** The override layer for a mirrored page. Keys are `<module-type>:<divi index>`. */
export type PageOverrides = {
  route: string
  modules: Record<string, ModuleOverride>   // 'text:12' -> { content }, 'button:3' -> { label, to }, …
  hiddenSections: number[]                  // Section index props
  sectionOrder?: number[]                   // omitted unless the user reordered
  extraSections: PageSection[]              // appended below the page
  title?: string; description?: string      // <head> overrides
}
```

`ColumnSpan` is re-exported from the existing `src/components/divi/Column.tsx` type (moved
into `page-types.ts` and re-imported there so `shared/` does not import from `src/`).

---

## Phase 2 — Backend

**`server/data/db.ts`** — three new tables (same inline `CREATE TABLE IF NOT EXISTS` style):

- `pages` — `id, slug UNIQUE, title, description, document TEXT (JSON), status ('draft'|'publish'), menu_parent, author_id, created_at, modified_at`
- `page_overrides` — `route TEXT PRIMARY KEY, data TEXT (JSON), modified_at, modified_by_id`
- `site_menu` — single row: `id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT (JSON), modified_at`

**New repos**, following `server/data/posts-repo.ts` exactly (prepared statements,
`fromRow`/`toRow`, JSON text columns, synchronous):

- `server/data/pages-repo.ts` — `listPages`, `getPage`, `getPageBySlug`, `createPage`,
  `updatePage`, `deletePage`; slugs via the existing `uniqueSlug()` in `shared/pnw/slug.ts`.
- `server/data/overrides-repo.ts` — `getOverrides(route)`, `putOverrides`, `clearOverrides`, `allOverrides`.
- `server/data/menu-repo.ts` — `getMenu()` (null when never edited), `putMenu`.

**`server/routes/pages.ts`** (new), all behind `requireCapability('pnw_manage_pages')`:

| Route | Purpose |
|---|---|
| `GET /api/pages` | list builder pages + which mirrored routes have overrides |
| `POST /api/pages` | create from a starter template |
| `GET/PUT/DELETE /api/pages/:id` | edit / delete a builder page |
| `GET/PUT/DELETE /api/pages/overrides?route=…` | read / save / reset a mirrored page's overrides |
| `GET/PUT /api/pages/menu` | read / save the menu tree (`DELETE` reverts to the static menu) |
| `POST /api/pages/media` | image upload — reuse the existing `multer` config from `server/routes/posts.ts` (8 MB, `server/uploads`, served at `/uploads`) |

**`server/routes/public.ts`** — one added endpoint, no auth:

- `GET /api/public/site` → `{ pages: [{slug,title,description,document}], overrides: Record<route, PageOverrides>, menu: MenuItem[] | null }` (published pages only).
- `GET /api/public/pages/:slug` for a direct load.

Validation lives in `server/lib/validation.ts` alongside the existing post validators: a
`PageDocument`/`PageOverrides` shape check that rejects unknown module kinds and
non-string content — the JSON columns must never round-trip untrusted shapes into the
renderer.

**`server/index.ts`** — `app.use('/api/pages', pageRoutes)`.

**`src/lib/hirkezelo/api.ts`** — add the typed client functions next to the existing ones.

---

## Phase 3 — Rendering (public site)

**`src/lib/site/SiteContentProvider.tsx`** (new, modelled 1:1 on
`src/lib/posts/PostsProvider.tsx`) — one `fetch('/api/public/site')` per page load,
`.catch()` → empty, so a dead backend leaves the site exactly as it is today. Exposes
`{ overrides, pages, menu }` through `src/lib/site/siteContext.ts`. Mounted in
`src/components/Layout.tsx` beside `PostsProvider`.

**`src/lib/site/usePageOverride.ts`** — `usePageOverride('text', index)` reads the context
for the current `pathname`; returns `undefined` when there is nothing (the normal case).

**Divi primitives gain an override branch** — five small, additive edits:

- `Text.tsx` — `const o = usePageOverride('text', index)`; when present render
  `<RichText document={o.content} />` instead of `children`.
- `Image.tsx` — override `src`/`alt`/`href`.
- `Button.tsx` — override `label`/`to`/`href`.
- `Blurb.tsx` — override `title`/`content`.
- `Section.tsx` — return `null` when hidden; apply `style={{ order }}` only when the page
  has a `sectionOrder` (and, in that case only, `.et_builder_inner_content` gets
  `display:flex;flex-direction:column` from a single rule in `src/styles/divi-layout.css`
  gated on a `data-reordered` attribute — off by default, so no existing page changes).

**`src/components/pagebuilder/PageRenderer.tsx`** (new) — `PageDocument` → the same
`Section`/`Row`/`Column`/`Text`/`Image`/`Button`/`Blurb`/`Divider`/`VideoEmbed`/`Toggle`
components, assigning Divi's per-type indices in document order. Reused for builder pages,
for appended sections on mirrored pages, and for the editor's live preview.

**`src/components/pagebuilder/builder-page.css`** (new) — the baseline design a new page
gets, scoped to `.page-builder`. Every rule is **copied** from an existing generated page
stylesheet (`src/pages/Nyolcadikos.css`, `Kozoktatas.css`) — section padding, heading
sizes, the `#72c3b6` accent, column borders — never invented.

**`src/components/pagebuilder/PageExtras.tsx`** — renders `extraSections` for the current
route inside the same `entry-content / et-l / et_builder_inner_content` wrapper the
generated pages use, placed right after `<Outlet />` in `Layout.tsx`. Renders nothing when
there are none.

**`src/pages/DynamicPage.tsx`** (new) — route `/:slug/` in `src/App.tsx`, placed
immediately before `<Route path="*">`; exact routes still win. Renders `PageRenderer`
inside the standard `#main-content > article > .entry-content` wrapper with
`className="page-builder page-<slug>"`, sets `document.title`/description itself (same
pattern as `PublishedPost.tsx`), and falls through to `<NotFound />` for an unknown slug.

**Menu** — `Header.tsx` and `TopBar.tsx` switch from importing `primaryMenu`/`secondaryMenu`
directly to `useSiteMenu()`, which returns the fetched tree or the static one from
`src/data/site.ts`. No markup changes.

**`src/lib/useDocumentHead.ts`** — add `/bejelentkezes/` and `/szerkeszto/` (noindex,
nofollow, like `/hirkezelo/`), and skip the 404 title for routes served by `DynamicPage`
or carrying a title override.

---

## Phase 4 — The editable-module inventory for mirrored pages

The editor needs to know which modules a mirrored page has and what they currently say.

**`scripts/page-inventory.ts`** (new) — for every `PageEntry` in `scripts/pages.ts`, parse
the mirror's `index.html` with `node-html-parser` (as `walk.ts` does) and collect each
`et_pb_text_N` / `et_pb_image_N` / `et_pb_button_N` / `et_pb_blurb_N` / `et_pb_section_N`,
taking **N straight from the class name** so the numbering can never drift from what the
generated component passes as `index`. Emits `src/data/page-inventory.ts`:

```ts
export const pageInventory: Record<string, PageInventory> = { '/nyolcadikos/': { sections: [...], modules: [...] } }
```

**`scripts/html-to-richtext.ts`** (new) — converts the mirror's module HTML into a
`RichTextDocument` (`p`/`h1`–`h4`/`ul`/`ol`/`blockquote`, `strong`/`em`/`u`/`a`/`span[style*=color]`,
`br` → `\n`). Shared by the inventory script and used as the starting content when the
editor first opens a module.

Both scripts run from `scripts/generate.ts`'s pipeline (add a step) and are dev-time only —
nothing in `server/` or `src/` imports them.

---

## Phase 5 — `/bejelentkezes/`

**`src/pages/Bejelentkezes.tsx`** + `Bejelentkezes.css` — route `/bejelentkezes/`.

- Uses the existing `useSession()`; not logged in → the existing
  `src/components/hirkezelo/LoginCard.tsx` (extract its demo-credential note behind a prop
  so this page can reuse it verbatim).
- Logged in → two cards, "Hírkezelő" → `/hirkezelo/` and "Szerkesztő" → `/szerkeszto/`,
  each shown only when the account holds the capability (`canSubmit(user) ||
  canReview(user)`, `canManagePages(user)`), plus the user's name and a logout button.
- Styled with the existing `.pnw-*` classes from `src/pages/Hirkezelo.css`, inside a
  `.pnw-app` wrapper — that is what carries the 75%-wide centered frame (§6.17), so both
  new pages inherit it without new CSS.
- `/hirkezelo/` keeps its own login card, so existing bookmarks are unaffected.

---

## Phase 6 — `/szerkeszto/`

**`src/pages/Szerkeszto.tsx`** — same dispatch shape as `Hirkezelo.tsx`: `useSearchParams`
on `?view=list|page|new|menu|media` + `?route=` / `?id=`, gated on `canManagePages(user)`,
`LoginCard` when logged out, `Unauthorized` otherwise. Its root element is `.pnw-app`, so
the page is 75% wide and centered like the Hírkezelő (§6.17).

**`src/components/szerkeszto/`** (new):

| File | Role |
|---|---|
| `Shell.tsx` | topbar + nav, copied from `hirkezelo/Shell.tsx` |
| `PageList.tsx` | every page in one table: the mirrored ones from `pageInventory`, the builder ones from the API; columns for title, URL, type, menu, last modified; "Új oldal", "Szerkesztés", "Törlés"/"Visszaállítás" |
| `OverrideEditor.tsx` | mirrored page: module list grouped by section, each with an inline editor; per-module and per-page "Eredeti visszaállítása"; section show/hide and drag-reorder; "Új szakasz hozzáadása" → the block builder |
| `BuilderEditor.tsx` | new page: section → row → column → module tree, add/remove/reorder at each level, column-layout picker (`4_4`, `1_2`+`1_2`, `1_3`×3, `1_4`×4) |
| `ModuleEditor.tsx` | one module's fields, per kind |
| `RichTextField.tsx` | wraps the existing `hirkezelo/RichTextEditor.tsx`, extended with heading level, link and colour controls (the new run marks) |
| `MediaPicker.tsx` | upload to `/api/pages/media` + pick from already-uploaded files |
| `MenuEditor.tsx` | the `primaryMenu`/`secondaryMenu` trees: add/rename/reorder/delete, target = a builder page, a mirrored route or an external URL; "Visszaállítás az eredetire" |
| `PagePreview.tsx` | `PageRenderer` in a `.page-builder` wrapper, live |
| `templates.ts` | starter documents |
| `Szerkeszto.css` | reuses `.pnw-*`, adds the builder tree styles |

**Quality of new pages** comes from `templates.ts`: starter documents whose section/row/column
structure is copied from `/nyolcadikos/` and `/kozoktatas/` (teal hero + lead paragraph,
three-column text block, bordered four-column card row, CTA button), so "Új oldal" produces
a page that already looks like the rest of the site rather than an empty white box.

**Deleting**: a builder page is really deleted (row removed, route 404s, menu entry pulled).
A mirrored page cannot be deleted — its code is the port — so the action there is "Rejtés"
(hidden from the menu and served as 404 via an override flag) plus "Eredeti visszaállítása"
to drop every override for that route.

---

## Phase 7 — Wiring and docs

- `src/App.tsx` — add `/bejelentkezes/`, `/szerkeszto/`, and `/:slug/` (last, just before `*`),
  each with a comment in the style of the existing `/hirkezelo/` note.
- `scripts/check-routes.ts` — the three new hand-written pages are not in `PAGES`
  (precedent: `Hirkezelo.tsx`, `PublishedPost.tsx`); confirm the "every page component is
  routed" direction still passes.
- **`AGENT.md`** — new §6 item **19** (16 is the permissions change, 17 the 75% width, 18
  the live posts in category archives) documenting the whole feature: the override model and why
  it was chosen over converting pages to documents, the index-keyed override contract (and
  that reordering modules in a generated page would break it), the new capability, the
  tables, the public `/api/public/site` fetch and its offline fallback, and the fact that
  `page-inventory.ts` is generated. Update §2's directory map and the "Aktuális állapot"
  section.

---

## Verification

1. `npm run lint` and `npx tsc --noEmit` clean.
2. `node --experimental-strip-types scripts/check-routes.ts` and `check-head.ts` pass.
3. `node --experimental-strip-types scripts/check-text.ts` — **must pass unchanged**: with
   no overrides saved, every mirrored page renders byte-identically to today. This is the
   regression test for Phase 3's changes to the Divi primitives.
4. Backend up (`npm run server` + `npm run dev`), then manually:
   - `/bejelentkezes/` → log in as an account holding `pnw_manage_pages` → both cards; as
     one without it (e.g. the seeded `mk.vezeto`) → only Hírkezelő; direct hit on
     `/szerkeszto/` with that account → `Unauthorized`.
   - Both new pages render 75% wide and centered at desktop width, and near-full-width
     below the 620px breakpoint (§6.17).
   - Edit a `Text` module on `/nyolcadikos/` → reload the public page → text changed,
     layout and CSS identical (compare with `scripts/shot.ts` before/after).
   - Hide a section, reorder two sections, append a new section → check each on the page.
   - "Eredeti visszaállítása" → the page matches the pre-edit screenshot exactly.
   - Create a page from a template, publish it, add it to the Oktatás dropdown → it appears
     in the desktop and mobile menus and renders at `/<slug>/` with correct `<title>`.
   - Delete it → menu entry gone, `/<slug>/` is the 404 page.
   - Upload an image in the media picker → served from `/uploads/…` on the public page.
5. Stop the backend and reload the site: every mirrored page renders as before, the static
   menu is used, builder pages 404 — no console errors, no blank pages.
6. `docker compose up --build` — one container still serves SPA + API, and the new tables
   are created in the mounted volume on first boot.

## Risks

- **Index-keyed overrides break if a generated page is regenerated with a different module
  order.** Mitigation: `scripts/page-inventory.ts` is regenerated in the same pipeline, and
  the editor shows each module's current source text next to its override, so a drift is
  visible. Documented in AGENT.md §6.19.
- **Section reordering** changes `.et_builder_inner_content` to flex for that page only.
  Verify with `scripts/measure.ts` on a reordered page; if it shifts anything, drop reorder
  to hide/show only.
- Phase 4's HTML→rich-text conversion is lossy for exotic mirror markup (tables, inline
  `<img>` inside a text module). Those modules are listed as read-only in the editor rather
  than silently degraded.
