# petrik.hu

A React port of the petrik.hu WordPress site (BMSZC Petrik Lajos Két Tanítási
Nyelvű Technikum), rebuilt from a static mirror to be as pixel-accurate as
possible — plus two real tools the original ran as WordPress plugins:

- **Hírkezelő** (`/hirkezelo/`) — a news workflow: write, submit, review,
  approve, schedule, archive. A re-implementation of the Petrik News Workflow
  plugin.
- **Szerkesztő** (`/szerkeszto/`) — a page editor: change the content of the
  existing pages, create and delete new pages, edit the menu, upload images.

Both share one login at `/bejelentkezes/`, and accounts carry individual
permissions, not roles.

Live: **https://petrik.zsombor.dev**

## Repository layout

```
apps/client/     the website — Vite + React + TypeScript        → apps/client/README.md
apps/server/     the API — Express + SQLite, run without a build → apps/server/README.md
shared/pnw/      types and rules both apps import (permissions, rich text, page model)
docker-compose.yml   client (nginx) + server, the database in a named volume
```

An npm workspace: one `package.json` and one `package-lock.json` at the root.

## Getting started

Requires Node 24 (the server runs TypeScript directly with
`--experimental-strip-types`) and, for the production-like setup, Docker.

```powershell
npm install --ignore-scripts
```

`--ignore-scripts` is deliberate: the database driver (better-sqlite3) ships
ready-made binaries, but its install step tries to compile from source and
fails without Visual Studio.

| Command (from the root) | What it does |
|---|---|
| `npm run dev` | The website with hot reload — http://localhost:5173 |
| `npm run server` | The API on http://localhost:4000 (the dev site proxies `/api` and `/uploads` to it) |
| `npm run build` | Production build of the website → `apps/client/dist` |
| `npm run lint` | ESLint over the whole repo |
| `npx tsc -b` | Type-check the website |
| `docker compose up --build -d` | Everything as in production — http://localhost:4000 |

Run `npm run dev` and `npm run server` together for local work. Locally the
login card lists the demo accounts; the database is created and seeded on the
first server start (`apps/server/data/db/`).

Environment variables go in a root `.env` (template: `.env.example`, never
committed) — see [apps/server/README.md](apps/server/README.md#configuration).

## Deploying

The site is hosted on [Launchpad](https://github.com/KoZsombat/Launchpad), which
builds `docker-compose.yml` from this repository and publishes the `client`
service through its own Traefik + Cloudflare Tunnel.
[LAUNCHPAD.md](LAUNCHPAD.md) is the setup: the compose scan, the two required
environment variables, and the one-time database restore.

After that, a deploy is either **Redeploy** in the app page or a push to
`main`, depending on the push webhook.

`docker compose up --build` runs the same stack locally. The site's data -
news, pages, accounts, uploads and the mirrored images - is one SQLite file in
the `petrik-db` named volume (`apps/server/data/db` for a local
`npm run server`).

## Rules of the codebase

These apply to every change — [AGENT.md](AGENT.md) (Hungarian) explains why,
along with every deliberate difference from the original site:

- **No `dangerouslySetInnerHTML`** anywhere. Content is structured data or JSX.
- **No invented CSS** for ported pages — rules are lifted from the mirror
  (`apps/client/scripts/matched-css.ts` finds them).
- **Never hand-edit the generated files** (`apps/client/src/pages/*` page
  components and stylesheets, `apps/client/src/data/*`,
  `shared/pnw/seed-categories.ts`) — fix the generator and regenerate.
- **The site must work with the API down**: the static pages, menus and
  mirrored content render without it.
- **New npm dependencies only with the owner's approval.**

## Documentation

| File | For |
|---|---|
| [AGENT.md](AGENT.md) | How the port works, every decision and pitfall (Hungarian) — read this before changing anything |
| [apps/client/README.md](apps/client/README.md) | The website and its generator scripts |
| [apps/server/README.md](apps/server/README.md) | The API, its configuration and endpoints |
| [LAUNCHPAD.md](LAUNCHPAD.md) | Hosting on Launchpad (compose scan, env, data restore) |
