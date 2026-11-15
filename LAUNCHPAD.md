# Hosting petrik.hu on Launchpad

[Launchpad](https://github.com/KoZsombat/Launchpad) runs compose projects on a
Docker host and publishes them through its own Traefik + Cloudflare Tunnel.
The repository's root `docker-compose.yml` is written to be scanned by it as
is; this file is the setup.

## What Launchpad does to the compose file

Worth knowing, because it explains the shape of `docker-compose.yml`:

- it **removes** `name`, `ports`, `container_name` and `profiles`, adds Traefik
  labels to the service you publish, and attaches that service to the external
  `web` network - the published service keeps the project's own network as
  well, which is what lets the `tunnel` service reach it as `client:80`;
- it **deploys every service** in the file and only declares the deployment
  healthy once each of them is `running` (and the published one answers its
  health path) - a service that crash-loops fails the whole deploy;
- it **rewrites the named volume** `petrik-db` to `launchpad-<app-id>-petrik-db`
  and keeps it between deployments;
- it **builds** every service that has a `build:` section on the panel host,
  and it can only do that for a repository source;
- bind mounts are left alone. A bind mount into the repository checkout would
  resolve against the panel host, not the checkout, so this project keeps its
  data in the named volume instead.

There is exactly one compose file, and it carries the site's own `tunnel`
(cloudflared) next to `client` and `server`. It cannot be opt-in: Launchpad
ignores `profiles` and starts every service in the file, so the tunnel's token
is a **required** variable - `${CLOUDFLARE_TUNNEL_TOKEN:?}` - and a deployment
without it stops while parsing the file, with the variable named, instead of
starting a cloudflared that crash-loops and fails the whole deployment.

## 1. Add the app

**New app** → **Repository** source:

| Field | Value |
|---|---|
| Repository | this repository |
| Branch | `main` |
| Compose path | `docker-compose.yml` |
| Domain | `petrik.zsombor.dev`, or empty for `<subdomain>.<BASE_DOMAIN>` |

Click **Scan compose**. Confirm the detected services:

| Service | Publish | Subdomain | Container port | Health path |
|---|---|---|---|---|
| `client` | **yes** | `petrik` (or empty) | **80** | `/` |
| `server` | no | — | — (no port on purpose) | — |
| `tunnel` | no | — | — (no port by design) | — |

`server` has no `ports` entry deliberately: nginx reaches the API at
`server:4000` on the compose network, and the API should never have its own
public hostname. Launchpad will show "No container port detected" for it -
that is expected. `tunnel` is the same: cloudflared opens the connection
outbound, so it publishes nothing and only needs the token.

Submit. The deployment log should show both images building, then
`All compose services are running and routed services are healthy.`, then the
site answering on its hostname.

## 2. Environment

Launchpad asks for the variables the compose file references. Three are
**required** (the deploy fails with "Missing values for compose variables"
without them):

| Variable | Value |
|---|---|
| `PNW_SESSION_SECRET` | `openssl rand -hex 32` |
| `PNW_SEED_PASSWORD` | at least 8 characters; only used the first time an **empty** database is seeded |
| `CLOUDFLARE_TUNNEL_TOKEN` | the token of the site's own tunnel - see [2.1](#21-the-tunnels-hostname) |

Optional:

| Variable | Default | Meaning |
|---|---|---|
| `PNW_SHOW_DEMO_LOGINS` | `false` | print the demo accounts on the login card - never on a public site |
| `PNW_PORT` | `4000` | only the local published port; Launchpad removes `ports` anyway |

The server refuses to start (`apps/server/config.ts`) if the session secret is
the repository's public default or if a production database would be seeded
with the public demo passwords.

### 2.1 The tunnel's hostname

`tunnel` is a **remotely managed** Cloudflare tunnel: the compose file carries
only the token, all routing lives in the dashboard.

1. Zero Trust → **Networks → Tunnels → Create a tunnel → Cloudflared**, name it
   `petrik`, and copy the token into `CLOUDFLARE_TUNNEL_TOKEN`.
2. On the tunnel's **Public hostname** tab add the site's hostname (e.g.
   `petrik.hu`) with service `http://client:80` - the compose service name and
   nginx's port on the project network. Add `www` with the same target if it
   is served.
3. Cloudflare creates the proxied `CNAME`; delete any old `A`/`AAAA` record for
   the same name, or the tunnel is never reached.

Two rules this relies on:

- **One hostname, one tunnel.** If the app's Domain in Launchpad already
  resolves to the panel's own tunnel (Traefik → `client:80`), do not add that
  same hostname here - two tunnels behind one name is a coin toss. Use the
  name this tunnel should serve, or leave Domain empty.
- **The connector reaches `client` by service name.** Launchpad attaches the
  published `client` to `web` and keeps it on the project network, so
  `client:80` resolves from `tunnel`. Nothing has to be published for it.

Check with `docker compose logs -f tunnel`: `Registered tunnel connection`
means it works, `failed to authenticate` means the token is wrong or was
rotated (update the app's environment variable and redeploy).

## 3. One-time data restore

A fresh, empty volume starts the site with the three seeded accounts and the
categories, but **no news, no page edits and no images**: the mirrored media
(271 MB) is not in git, and the database is where it lives. Restore the live
database into the volume once.

On the old host (the EC2 instance, which still keeps the database as a folder
next to the compose file):

```bash
# stop the app first, so the -wal file is complete, then pack the whole folder
cd ~/petrik && docker compose stop server
tar czf ~/petrik-data.tgz -C apps/server/data/db .
docker compose start server
```

Copy `petrik-data.tgz` to the Launchpad host, then:

```bash
# stop the app in Launchpad (it must not be running), find the volume...
docker volume ls | grep petrik-db          # launchpad-<app-id>-petrik-db

# ...and replace its contents (the stop is what keeps SQLite consistent)
docker run --rm -v launchpad-<app-id>-petrik-db:/db -v "$PWD":/seed:ro alpine \
  sh -c 'rm -rf /db/* && tar xzf /seed/petrik-data.tgz -C /db'
```

Start (or redeploy) the app in Launchpad. Verify:

- `/api/public/posts` returns the published news;
- the homepage images and `/media/wp-content/uploads/2020/08/cropped-logo-nagy-32x32.png` load;
- `/bejelentkezes/` accepts a real account.

If `alpine` is not available on the host, use the project's own image instead:
`docker run --rm --entrypoint sh -v launchpad-<app-id>-petrik-db:/db ... petrikhu-server -c '...'`.

> Never copy `hirkezelo.db` on its own. Recent changes live in
> `hirkezelo.db-wal`, and a stale `-wal` replayed over a fresh `.db` silently
> brings the old data back.

## 4. Deploying changes

- **Redeploy** in the app page builds the configured branch again; or
- add the GitHub push webhook from the app's CI/CD panel
  (`https://<panel>/api/hooks/github/<app-id>`, content type `application/json`,
  the app's webhook secret, *Just the push event*). With CI/CD off, Launchpad
  builds the branch itself.

Sessions are stored in the database (`apps/server/lib/session-store.ts`), so a
redeploy no longer logs everyone out.

## 5. Backups

Everything is one volume:

```bash
docker run --rm -v launchpad-<app-id>-petrik-db:/db:ro -v "$PWD":/out alpine \
  sh -c 'cd /db && tar czf /out/petrik-data.tgz .'
```

Stop the app first for a consistent copy, or accept that the `-wal` file may
be a few seconds behind. Keep the three files together (`hirkezelo.db`,
`hirkezelo.db-wal`, `hirkezelo.db-shm`).

## Notes

- **TLS and cookies.** Cloudflare terminates HTTPS on both routes (the panel's
  tunnel → Traefik, or this project's `tunnel` → nginx) and the container hop
  is plain HTTP. `apps/client/nginx.conf` forwards the original scheme
  (Cloudflare's `CF-Visitor` survives the tunnel hop), and the API marks the
  login cookie `Secure` only when the visitor is actually on HTTPS.
- **Who can reach the admin screens.** The site is public; `/bejelentkezes/`,
  `/hirkezelo/` and `/szerkeszto/` are protected by the app's own login
  (bcrypt, 10 failed attempts per account per 15 minutes). Launchpad's
  Cloudflare Access only covers the panel. If you want the admin screens behind
  Cloudflare Access too, add a self-hosted Access application for the site
  hostname with path `/bejelentkezes/` (plus the other admin paths) and a
  policy for your own email.
- **Deleting the app** in Launchpad can optionally delete the volume. Say no
  unless the data is backed up.
