# apps/client — the website

Vite + React 19 + TypeScript + React Router. It renders the 129 routes of the
mirrored petrik.hu site, plus the Hírkezelő (`/hirkezelo/`), the Szerkesztő
(`/szerkeszto/`), the shared login (`/bejelentkezes/`), published news
(`/hirek/<slug>/`) and pages created in the Szerkesztő (`/<slug>/`).

## Commands

From the repo root: `npm run dev`, `npm run build`, `npm run preview`,
`npx tsc -b`. In development the Vite server proxies `/api` and `/uploads` to
the API on `localhost:4000` (`npm run server`).

## Where things are

```
src/
  App.tsx                 the route table (written by hand, one route per page)
  pages/                  one component + stylesheet per mirrored page — GENERATED
  pages/docs/             the 27 documents — GENERATED
  components/             site chrome: Layout, Header, TopBar, Footer, Sidebar, …
  components/divi/        the Divi modules: Section, Row, Column, Text, Image, Blurb, …
  components/docs/        the BetterDocs frame around the documents
  components/hirkezelo/   the news workflow UI
  components/szerkeszto/  the page editor UI
  components/pagebuilder/ renders Szerkesztő page documents with the Divi modules
  lib/site/               fetches what the Szerkesztő saved (overrides, pages, menu)
  data/                   site data extracted from the mirror — GENERATED (except site.ts, footer.ts)
  styles/                 grid, sidebar layout, fonts
public/
  media/                  images and PDFs copied from the mirror (271 MB, not in git)
  fonts/                  web fonts copied from the mirror
scripts/                  dev-time tools; never part of the bundle
Dockerfile, nginx.conf    production image: static build served by nginx, /api proxied to the server
```

## Generated files

Most of `src/pages/` and `src/data/` is written by the scripts from the
WordPress mirror and must not be edited by hand. Change the generator
(usually `scripts/walk.ts`) and regenerate. Run scripts from this folder:

```powershell
cd apps/client
node --experimental-strip-types scripts/generate.ts          # all page components + stylesheets + page inventory
node --experimental-strip-types scripts/generate.ts HomePage # just one
```

The data generators run separately, in this order: `docs.ts`, `archives.ts`,
`seed-categories.ts`, `posts.ts`, `head.ts`. `page-inventory.ts` runs as the
last step of `generate.ts`.

**The mirror** is not in this repository. Its location is the `MIRROR_ROOT`
constant in `scripts/mirror.ts` — check it points at your copy before running
any generator.

## Checking fidelity

Compare the port against the mirror in headless Chrome. They need the dev
server on `:5173` and the mirror served on `:8899`
(`python -m http.server 8899` in the mirror folder); run one at a time:

| Script | Checks |
|---|---|
| `check-text.ts` | Rendered text of every page matches the mirror |
| `check-head.ts` | `<title>`, description, robots, canonical |
| `check-routes.ts` | Route table and page components agree (no browser needed) |
| `measure.ts` | Element positions and sizes, pixel by pixel |
| `matched-css.ts` | Which CSS rules really apply to an element — use it instead of guessing CSS |

If Chrome won't start, set `CHROME_PATH` to Playwright's headless shell
(AGENT.md §3).
