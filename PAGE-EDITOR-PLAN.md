# Szerkesztő v2 — every page fully rewritable and creatable

## Context

The first version of the Szerkesztő is built and running (AGENT.md §6.19). It
took the **"edit the lines"** option: the 53 generated pages
(`apps/client/src/pages/*.tsx`) stay compile-time code, and a runtime
**override layer** sits on top of them:

| What v1 can do on a mirrored page | How |
|---|---|
| Replace the content of a text/image/button/blurb module | `PageOverrides.modules['text:12']`, looked up by the Divi `index` prop |
| Hide / reorder sections, append new sections below | `hiddenSections`, `sectionOrder` (flex), `extraSections` |
| Title/description, "Rejtés" (serve as 404), reset | `PageOverrides.title/description/hidden`, `DELETE` |
| **Cannot:** move a module, add a module inside a section, change a row's columns, change any colour/size/spacing, edit the 18 "lossy" modules, edit sliders/feeds/team members/counters…, really delete a page | — |

New pages created in the Szerkesztő are already full `PageDocument`s
(section → row → column → module) rendered by `PageRenderer`.

**Decision (user, 2026-09-26): switch to the other option — the whole site is
rewritable and creatable.** Every mirrored page becomes a `PageDocument` like
a new page is, editable down to layout and design. **Pixel-accuracy with the
mirror is only guaranteed for a page nobody has edited**; once someone edits a
page, what it looks like is their choice. This is a deliberate reversal of
AGENT.md §1's "as pixel-accurate as possible" goal *for edited pages only*, and
gets its own §6 entry.

The v1 building blocks stay and grow: `PageDocument`, `PageRenderer`,
`SectionsEditor`/`ModuleEditor`/`RichTextField`, `MediaPicker`, `MenuEditor`,
`/bejelentkezes/`, `pnw_manage_pages`, the `pages`/`site_menu` tables, the
`/api/public/site` fetch with its offline fallback. What goes away is the
override layer (`PageOverrides`, `usePageOverride`, `PageExtras`,
`OverrideEditor`, `page-inventory.ts`, `html-to-richtext.ts`) and, at the end,
the 53 generated page components themselves.

## Confirmed scope decisions

| Decision | Choice |
|---|---|
| Which pages become documents | The 25 builder pages, the 27 docs pages (their content; the BetterDocs frame stays code), the 1 blog post (content; post header/sidebar stay code), the 1 classic page (its prose). **Not** the 64 archives, `/dokumentumtar/`, the doc taxonomies, `/kereses/`, `/hirek/:slug/` — those are views over data, not authored pages. |
| Unedited page | Renders **byte-identically** to today's generated TSX (this is the regression gate) |
| Edited page | No pixel guarantee — user decision |
| Source of truth | Default documents are generated from the mirror and bundled with the client (offline fallback + "reset" baseline); an edited page is a full document in the database that replaces its default |
| Deleting a mirrored page | Real delete (tombstone row → 404, pulled from the menu); "Visszaállítás" brings the default back |
| Styling | Structured design settings per module/row/section (colour, font size, weight, alignment, spacing, background, border), never raw CSS |
| URLs | A mirrored page keeps its URL; a new page gets `/<slug>/` as now |

Hard constraints unchanged (AGENT.md §1): no `dangerouslySetInnerHTML`; no
invented CSS for *unedited* output; no new npm dependencies without approval;
the site must fully render with the backend down.

---

## Phase 0 — Prerequisites

- **`MIRROR_ROOT` is broken.** The project moved to `scrape/petrik.hu` and the
  mirror to `Downloads/asd/mirror/petrik.hu/petrik.hu`; the constant in
  `apps/client/scripts/mirror.ts` resolves to `Downloads/mirror/…`, which does
  not exist. Point it at the new location (or make it read an env var
  `PETRIK_MIRROR`, falling back to the constant) before anything below.
- Commit the current state; the conversion is large and must be diffable.

## Phase 1 — Document model v2 (`shared/pnw/page-types.ts`)

The model must express **everything the generator emits today**, losslessly,
or unedited pages cannot render identically.

**Module kinds.** Existing: `text`, `image`, `button`, `blurb`, `divider`,
`video`, `toggle`. Added — every module a generated page uses
(counts = pages using it):

| Kind | Component | Pages |
|---|---|---|
| `post-feed` | `PostFeed` (items, columns, `includeLive`, `hasOlder`…) | 13 |
| `team-member` | `TeamMember` | 3 |
| `social-follow` | `SocialFollow` | 2 |
| `number-counter` | `NumberCounter` | 1 |
| `testimonial` | `Testimonial` | 1 |
| `pricing-tables` | `PricingTables` | 1 |
| `hero-slider` | `HeroSlider` (slides, `headerOffset`) | 1 |
| `gallery` | `Gallery` | 1 |
| `fullwidth-header` | `FullwidthHeader` | 1 |
| `file-block` | `FileBlock` (docs) | 1 |

Each kind's fields are exactly the props `walk.ts` writes for it today — the
walker is the specification. Page-specific special cases that live in the
walker (`includeLive` on the home feeds, the slider's `headerOffset`) become
plain fields.

**Faithful markup fields** every node may carry, copied from what the generated
TSX passes today: `index` (the Divi number, see below), `className` (e.g.
`et_pb_with_border`), `first`, `fullwidth`, `withBackground`, dividers,
`gutters`, `last`, `align`, `bgLayout`, image `srcSet`/`sizes`/`loading`, button
`icon`, blurb `position`.

**Rich text v2** (`shared/pnw/types.ts`) — the vocabulary of
`scripts/extract.ts` `inlineJsx`/`blockJsx`, so the 18 modules v1 marked
"lossy" become editable:
- block types `h1`–`h6` (levels 5/6), `div` (the non-`<p>` inline wrapper
  §4.2 is about), nested lists (`items` with children), `blockquote`
  containing blocks;
- a whitelisted `style` on blocks and runs (`color`, `font-size`,
  `font-family`, `font-weight`, `letter-spacing`, `text-transform`,
  `text-align`, `line-height`) — the properties `styleProp()` actually meets
  in the mirror, validated server-side;
- inline `<img>` runs if the inventory shows any, otherwise dropped from scope;
- the whitespace nodes `extract.ts` emits between elements (`{' '}`), as an
  explicit `space` flag, because `check-text` compares them.

**The Divi index contract changes meaning.** Today `index` is keyed by
overrides; in v2 it only decides which numbered class a module wears
(`et_pb_text_12`), which is what the page's generated design stylesheet
(`Nyolcadikos.css`) targets. A converted module **keeps its original index**
wherever it is moved, so it keeps its original look; a module created in the
editor gets `index = max(existing of that kind) + 1`, so it can never collide
with a rule meant for another module. The page keeps its scope class
(`page-nyolcadikos`) in the document (`scope`), so its stylesheet keeps
applying.

**Design settings** (`design?: Design` on section, row, column, module):
colour, background (colour/image/gradient from a preset list), font size,
weight, alignment, padding/margin (top/bottom), border (width/colour). Values
are validated enums/numbers/colours, never free CSS.

**Page document** gains `template: 'builder' | 'docs' | 'post' | 'classic'`
(which frame renders around it: `#main-content > article` / `DocsLayout slug` /
`PostHeader + SharedCounts + Sidebar` / `#left-area + Sidebar`), `scope`, and
per-template data (`docsSlug`, post meta, body classes for `useBodyClass`).

## Phase 2 — Generating the default documents

**`apps/client/scripts/walk.ts` gains a document emitter** next to its TSX
emitter: the same tree walk, but writing `PageDocument` JSON instead of JSX
source. Both paths share one walk so they cannot disagree.

- `scripts/generate.ts` writes `apps/client/src/data/pages/<Component>.json`
  (one per page) plus `src/data/pages/index.ts` (route → document, template,
  head). The design stylesheets (`page-css.ts`) keep being generated and are
  imported from one registry, since a document cannot import CSS itself.
- While Phase 3 is verified, it writes **both** the TSX and the JSON.
- `page-inventory.ts` and `html-to-richtext.ts` are deleted once Phase 7 has
  migrated the v1 overrides (they are the migration's input format).

Bundle: the JSON is about the size of the TSX it replaces; it stays in the
eagerly loaded `data` chunk (AGENT.md §8.3 advises against route-level
`React.lazy` because of the Suspense flash).

## Phase 3 — One renderer, byte-identical

**`PageRenderer` renders every kind and every template**, emitting exactly the
markup the generated TSX emits — same classes, same wrappers, same whitespace
nodes, same `useBodyClass` classes.

**`scripts/compare-render.ts`** (new, the gate for the whole project): for every
one of the 53 pages, render the old TSX component and the new document into
the DOM (a dev-only route `/__compare/<route>` that mounts both side by side in
headless Chrome) and require **identical `innerHTML`**. Every difference is a
converter or renderer bug, fixed until the count is zero.

Only then: `src/App.tsx`'s 53 explicit page routes are replaced by one
route per entry of the documents registry, rendered by a `DocumentPage` that
picks the database version when it exists, else the bundled default.
`check-routes.ts` is updated to check registry ↔ mirror instead of files ↔
routes. The generated `src/pages/*.tsx` (and `pages/docs/*.tsx`) are deleted,
and `generate.ts` stops writing TSX.

## Phase 4 — Storage and API

`pages` table (v1) is generalised:

- `route TEXT UNIQUE` replaces `slug` as the key (`/nyolcadikos/`, `/nyilt-nap/`);
- `origin` `'mirror' | 'custom'`; `template`; `deleted` (tombstone for a deleted
  mirrored page — a missing row means "use the default");
- `document`, `title`, `description`, `status`, timestamps, `modified_by_id`.

API (`apps/server/routes/pages.ts`): `GET /api/pages` lists custom pages and
edited/deleted mirrored routes; `GET/PUT /api/pages/by-route?route=` saves a
full document for any route; `DELETE` means "delete" for custom pages and
"tombstone" for mirrored ones; `POST …/reset` removes a mirrored row. The
validator (`sanitizePageDocument`) covers every new kind, the rich-text v2
vocabulary and the design settings — same rebuild-don't-pass-through rule.

`GET /api/public/site` returns the published edited documents and tombstones
(not the defaults — the client has those). Backend down → every page is its
default, exactly as today.

The override endpoints and the `page_overrides` table are removed after the
migration (Phase 7).

## Phase 5 — The editor

- `PageList`: one list, every page with its state (*Eredeti* / *Szerkesztve* /
  *Törölve* / *Új*); actions *Szerkesztés*, *Törlés*, *Visszaállítás az
  eredetire* (mirrored), *Megtekintés*.
- **Every page opens in the tree editor** (`BuilderEditor` + `SectionsEditor`),
  starting from its database document or, for an unedited page, a copy of its
  default. `OverrideEditor` is deleted.
- **Module editors for the new kinds**: slides / team members / counters /
  pricing tables / gallery images as editable lists; post feeds by category and
  count; social links; file blocks with the media picker.
- **`RichTextField` v2**: heading levels 1–6, `div` blocks, nested lists, the
  style whitelist (size, font, spacing, case) as run/block controls.
- **Design panel** on every node (Phase 1 design settings), and drag-and-drop
  for sections, rows and modules (v1 has buttons only).
- **Live preview** as in v1 (portalled below the frame), now for every page,
  including the page's own design stylesheet.
- A banner on an unedited mirrored page: *"Ez az oldal még az eredeti. Az első
  mentés után a megjelenése már a te szerkesztésedtől függ."*

## Phase 6 — Design settings in CSS

The mirror's page stylesheets mark nearly everything `!important`
(`.page-nyolcadikos .et_pb_text_2.et_pb_text { color: #0c71c3 !important }`),
so an inline `style` cannot beat them. Design settings are therefore rendered
as **one generated `<style>` element per document**, with rules scoped to the
page and the node's own class, and `!important` where the value is set:

```css
.page-nyolcadikos .et_pb_text_12 { color: #c94300 !important; font-size: 22px !important }
```

It is built as a React text child from validated values only (enum sizes,
`isSafeColor`), never from user strings — so no `dangerouslySetInnerHTML` and
no CSS injection.

## Phase 7 — Migrating v1 data

`apps/client/scripts/migrate-overrides.ts` (dev-time, run once against a copy
of the database, then for real): for every `page_overrides` row, take the
page's default document, apply the module overrides (by index), drop hidden
sections, apply `sectionOrder`, append `extraSections`, carry `title`/
`description`, turn `hidden` into a tombstone; write the result as a `pages`
row. Then drop `page_overrides`, `usePageOverride`, `PageExtras`, the
`data-reordered` rule in `divi-layout.css`, and the override code in the five
Divi primitives.

## Phase 8 — Docs

- **AGENT.md**: new §6.20 (this reversal and why; that unedited pages are the
  only pixel-checked ones; the new index rule; design settings as generated
  CSS); rewrite §2 "Generálás" (documents, not TSX; the "never hand-edit
  `src/pages`" rule becomes "never hand-edit `src/data/pages`"); update §6.19
  to say which parts were superseded; §8.2's pixel table applies to unedited
  pages only.
- `DEPLOY.md`: a note that the first deploy after this runs the migration.

---

## Verification

1. `npm run lint`, `npx tsc -b`, `npm run build` clean.
2. **`compare-render.ts`: 53/53 pages byte-identical** between old TSX and new
   documents — before the TSX is deleted.
3. After deleting the TSX: `check-text.ts` 129/129 and `check-head.ts` 129/129
   with an empty database (run in batches, AGENT.md §7.15); `measure.ts`
   spot-checks on the home page and `/nyolcadikos/` at 1440/980/500px show 0px.
4. Editor, in headless Chrome against a scratch database:
   - edit a text on `/nyolcadikos/` → only that module changes;
   - move a module to another column, change a row from 3 to 2 columns, add a
     module inside an existing section → rendered as edited, the moved module
     keeps its original look;
   - set a colour/size in the design panel on a module the page stylesheet
     styles with `!important` → the setting wins;
   - edit one of the formerly "lossy" modules → saves, other formatting intact;
   - edit the home slider, a post feed, a team member;
   - delete a mirrored page → 404 and out of the menu; reset → identical to
     the unedited page again (compare-render on that route);
   - create a page, publish, menu, delete — as in v1.
5. Migration: a database with v1 overrides (text edit, hidden + reordered
   sections, appended section, hidden page) migrates to documents that render
   the same as v1 did.
6. Backend down → every page is its default, no console errors besides the
   failing API calls.
7. `docker compose up --build`: both images build; `deploy.ps1` to a test
   server.

## Risks

- **The byte-identical gate is the whole project.** The generated TSX encodes
  many hard-won fixes (AGENT.md §4: whitespace nodes, inline styles on
  `<p>`, lazy-loading copied verbatim, inert `<a>` elements…). The document
  path must reproduce every one; `compare-render` is what finds the misses.
  Don't delete the TSX until it reports zero.
- **Edited pages drift from the mirror** by design; §8.2's measurements say
  nothing about them.
- **Moving a converted module into another page's context**: its index-based
  classes follow it, the page stylesheet's rules may not fit the new
  surroundings. The design panel is the fix, not new CSS.
- **Hand-written page logic**: any generated page whose behaviour depends on
  code not captured by props (e.g. the home page's live-news feeds) must become
  a document field, or the page stays code. `compare-render` exposes these.
- **Bundle size**: documents ≈ TSX in size, but the rich-text JSON is more
  verbose than JSX; if the `data` chunk grows noticeably, split documents per
  template, not per route.
