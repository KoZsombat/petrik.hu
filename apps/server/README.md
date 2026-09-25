# apps/server — the API

Express 5 + SQLite (better-sqlite3), sessions with express-session, uploads
with multer, passwords with bcrypt. It runs TypeScript directly with Node 24's
`--experimental-strip-types`, with no build step.

It serves the Hírkezelő (news workflow), the Szerkesztő (page editor), the
accounts, and the public data the website reads (published news, edited pages,
the menu).

## Running

```powershell
npm run server        # from the repo root; listens on http://localhost:4000
```

On first start it creates `data/db/hirkezelo.db`, migrates older databases in
place (`data/db.ts`), and seeds three accounts and the site's 37 categories
into an empty database.

Local demo accounts (only on a fresh local database; never on the live site):
`mk.vezeto` / `PetrikMK2026!`, `helyettes` / `PetrikHelyettes2026!`,
`igazgato` / `PetrikIgazgato2026!`.

If a `apps/client/dist` build exists, the server also serves the website, so
`npm run build` + `npm run server` is a complete single-process setup. In
Docker the website is a separate nginx container instead.

## Configuration

Environment variables (Docker Compose reads them from the root `.env`):

| Variable | Default | Meaning |
|---|---|---|
| `PNW_SESSION_SECRET` | a public dev value | Signs login cookies. **Set a real one** in production (`openssl rand -hex 32`); the server warns at start if you don't. |
| `PNW_SEED_PASSWORD` | — | Password for the three seeded accounts when the database is empty. Without it they get the public demo passwords. |
| `PNW_SHOW_DEMO_LOGINS` | `true` locally, `false` when `NODE_ENV=production` | Whether the login card lists the demo accounts. Never `true` on a public site. |
| `PNW_PORT` | `4000` | Port to listen on. |

## Data

| Path | Contents |
|---|---|
| `data/db/hirkezelo.db` | Everything: posts, audit log, accounts, categories/tags, Szerkesztő pages, page overrides, menu |
| `uploads/` | Uploaded images, served at `/uploads/…` |

Both are runtime state: git-ignored, and mounted as volumes in Docker so
rebuilds don't lose them. Back them up, and stop the server first so the
SQLite files are consistent.

## Permissions

There are no roles. Each account carries its own set of capabilities, granted
on the Hírkezelő's *Fiókok* screen (`shared/pnw/permissions.ts`):

| Capability | Allows |
|---|---|
| `pnw_submit_news` | Write news and submit it for review |
| `pnw_review_news` | Edit, approve, schedule or return submitted news |
| `pnw_manage_published_news` | Edit, archive and restore published news |
| `pnw_view_audit_log` | Statistics and the full audit log |
| `pnw_manage_terms` | Create categories and tags |
| `pnw_manage_users` | Create, edit and delete accounts |
| `pnw_manage_pages` | The Szerkesztő: edit pages, create/delete pages, edit the menu |

## Endpoints

All under `/api`. Unless marked *public*, they need a logged-in account, and
most need a specific capability.

| Prefix | Endpoints |
|---|---|
| `/auth` | `POST /login`, `POST /logout`, `GET /me`, `GET /config` (*public*: whether to show demo logins) |
| `/public` | *public*: `GET /posts`, `GET /posts/:slug`, `GET /site` (Szerkesztő pages, overrides, menu), `GET /pages/:slug` |
| `/posts` | the news workflow: `GET /dashboard`, `/published`, `/archived`, `/:id`, `/:id/audit`; `POST /`; `PUT /:id`, `/:id/reviewer`; `POST /:id/decision`, `/:id/archive`, `/:id/restore`; `DELETE /:id` |
| `/users` | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id` |
| `/terms` | `GET /` (*public*), `POST /` |
| `/audit`, `/statistics` | `GET /` |
| `/pages` | Szerkesztő (`pnw_manage_pages`): `GET/POST /`, `GET/PUT/DELETE /:id`, `GET/PUT/DELETE /overrides?route=`, `GET/PUT/DELETE /menu`, `GET/POST /media` |

Everything saved through `/pages` is validated by rebuilding it field by field
(`lib/validation.ts`). Unknown module types, unsafe links (`javascript:`) and
malformed colours reject the whole save.

## Code

```
index.ts        app setup, routes, the scheduled-publish sweep
config.ts       paths and environment variables
middleware/     session user, login/capability guards
routes/         one file per API prefix
data/           SQLite schema + migrations (db.ts) and one repository per table
lib/            validation, uploads, audit log, notifications
Dockerfile      production image (server + shared/ + production dependencies only)
```
