# Deploying to AWS (always on) with your Cloudflare domain

What you end up with: the site on `https://petrik.<your-domain>` 24/7. It runs
in Docker on a small AWS EC2 server, and Cloudflare publishes it through a
tunnel, so the server has **no open web ports** and you get HTTPS for free.

```
browser ──HTTPS──> Cloudflare ──tunnel──> EC2: [cloudflared] ──> [client: nginx :80] ──/api, /uploads──> [server :4000]
                                                                  the website                        SQLite + uploads on disk
```

Two containers: **client** (`apps/client`, the built website on nginx) and
**server** (`apps/server`, the API with the database). Only the client is
reachable; it forwards `/api/` and `/uploads/` to the server.

The Docker images are **built on your PC** and copied up by `deploy.ps1`. A
1 GB server can't build them, and the 271 MB of pictures in
`apps/client/public/media` aren't in git — they travel inside the client image.

Time: about 45 minutes the first time, one command after that.

---

## 1. Before you start

- Docker Desktop running on your PC, and `docker compose build` works in this folder.
- An AWS account. Pick one region and stay in it — e.g. **Europe (Frankfurt) `eu-central-1`**
  (top-right corner of the AWS console).
- Your domain added to Cloudflare (you have this).

**Set a spending alarm first**: AWS console → search **Budgets** → *Create budget* →
*Use a template* → **Zero spend budget** → your email → Create. You get an email
the moment anything costs money. AWS's free offer is time-limited (credits or 12
months, depending on the account's age); after it this server costs roughly
$8–10/month.

## 2. Launch the server

AWS console → **EC2** → **Launch instance**:

| Setting | Value |
|---|---|
| Name | `petrik` |
| Application and OS image | **Ubuntu Server 24.04 LTS** (64-bit x86) |
| Instance type | **t3.micro** (or t2.micro — whichever says *Free tier eligible*) |
| Key pair | **Create new key pair** → name `petrik`, RSA, `.pem` → it downloads `petrik.pem` |
| Network settings → Firewall | *Create security group*: keep **Allow SSH traffic from → My IP**. Leave *HTTP* and *HTTPS* **unticked** — the tunnel doesn't need them. |
| Configure storage | **25 GiB gp3** |

Click **Launch instance**, open it, and copy its **Public IPv4 address**
(e.g. `3.120.45.67`). Below, `SERVER` means this address.

> The public IP changes if you *stop* and *start* the instance (a reboot keeps it).
> Only SSH/deploys use it — the website is unaffected, because the tunnel
> connects outward.
>
> "My IP" in the firewall is your current home IP. If SSH stops working later
> (e.g. you're elsewhere), edit the security group's inbound rule to your new IP.

## 3. Put the key in place (PowerShell on your PC)

```powershell
mkdir $HOME\.ssh -Force
Move-Item $HOME\Downloads\petrik.pem $HOME\.ssh\petrik.pem
# ssh refuses a key other users can read:
icacls $HOME\.ssh\petrik.pem /inheritance:r
icacls $HOME\.ssh\petrik.pem /grant:r "$($env:USERNAME):(R)"

ssh -i $HOME\.ssh\petrik.pem ubuntu@SERVER      # answer "yes" to the fingerprint question
```

You are now on the server (the prompt ends in `ubuntu@ip-…:~$`).

## 4. Install Docker on the server

Still in that SSH session:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
exit
```

Log back in (`ssh -i $HOME\.ssh\petrik.pem ubuntu@SERVER`) and check that
`docker ps` prints an empty table without errors.

## 5. Create the server's `.env`

On the server:

```bash
mkdir -p ~/petrik
openssl rand -hex 32          # copy the output - that's your session secret
nano ~/petrik/.env
```

Paste this, fill it in, then save with **Ctrl+O, Enter** and exit with **Ctrl+X**:

```ini
PNW_SESSION_SECRET=<the random string from openssl>
PNW_SEED_PASSWORD=<a strong password, at least 8 characters>
PNW_SHOW_DEMO_LOGINS=false
CLOUDFLARE_TUNNEL_TOKEN=
# COMPOSE_PROFILES=tunnel
```

- `PNW_SEED_PASSWORD` is what the three starting accounts (`mk.vezeto`,
  `helyettes`, `igazgato`) get on a **fresh** database, instead of the demo
  passwords that are public in the repo.
- The tunnel lines are filled in at step 7.

This file stays on the server; deploys never overwrite it. Don't commit it.

## 6. First deploy (PowerShell on your PC, in this folder)

If PowerShell refuses to run scripts, prefix the command with
`powershell -ExecutionPolicy Bypass -File`.

**Option A — start with an empty site** (the three accounts, no news or pages):

```powershell
.\deploy.ps1 -Server SERVER -Key $HOME\.ssh\petrik.pem
```

**Option B — take your current local data along** (news, edited pages, menu,
uploads, and the accounts *with their current passwords*):

```powershell
.\deploy.ps1 -Server SERVER -Key $HOME\.ssh\petrik.pem -WithData
```

`-WithData` asks you to type `yes`, briefly stops your local container for a
consistent copy, and **replaces** whatever database the server had. Use it only
now, never on later deploys. With option B, `PNW_SEED_PASSWORD` has no effect —
the copied accounts keep their passwords. If those are the demo ones,
change them at step 8.

The upload is several hundred MB the first time. At the end the script prints
`docker compose ps` with the `server` and `client` containers **running**. Check it on the server:

```bash
curl -s localhost:4000 | head -c 200     # should print HTML
```

## 7. Connect your Cloudflare domain

1. Cloudflare dashboard → **Zero Trust** → **Networks** → **Tunnels** →
   **Create a tunnel** → **Cloudflared** → name it `petrik` → Save.
2. On the *Install and run connector* page, pick **Docker**. The command shown
   ends in `--token eyJ...` — copy **only the long token** after `--token`.
   (Don't run that command; compose does it.)
3. Next → **Public hostname**:
   - Subdomain: `petrik` (or leave empty to use the bare domain)
   - Domain: your domain
   - Service **Type: HTTP**, **URL: `client:80`**
     (`client` is the compose service name — **not** `localhost`)
   - Save.
4. On the server, put the token in `.env` and switch the tunnel on:

   ```bash
   nano ~/petrik/.env
   #   CLOUDFLARE_TUNNEL_TOKEN=eyJ...          <- paste
   #   COMPOSE_PROFILES=tunnel                 <- remove the leading "# "
   cd ~/petrik && docker compose up -d --no-build
   docker compose ps                           # server, client and tunnel running
   ```

5. In Cloudflare the tunnel turns **HEALTHY**. Open
   `https://petrik.<your-domain>/` — the site is live.

## 8. Lock it down (on the live site)

1. Go to `/bejelentkezes/` and log in as `igazgato` (with the seed password, or
   your local one if you used `-WithData`).
2. **Hírkezelő → Fiókok**: give every real person their own account, and change
   the passwords of `mk.vezeto`, `helyettes` and `igazgato` — or delete the ones
   you don't need (at least one account must keep "Fiókok kezelése").
3. "Oldalak szerkesztése" is the Szerkesztő right; tick it only for people who
   may change the website itself.

## 9. Updating after a code change

```powershell
.\deploy.ps1 -Server SERVER -Key $HOME\.ssh\petrik.pem
```

It rebuilds the image, uploads it, and restarts the container. The images are
built for the server's CPU (`-Platform`, default `linux/amd64`, so it works the
same from Windows and from an Apple Silicon Mac; pass `-Platform linux/arm64`
for an ARM/Graviton server). On macOS run it with `pwsh ./deploy.ps1 ...`. The database,
uploads and `.env` on the server are untouched. Everyone who is logged in has to
log in again (sessions live in memory).

## 10. Backups

The whole state is two folders on the server: `~/petrik/apps/server/data/db` and
`~/petrik/apps/server/uploads`.

- **Automatic**: EC2 → **Elastic Block Store → Lifecycle Manager** → *Create
  lifecycle policy* → *EBS snapshot policy* → target: the `petrik` instance
  (by its `Name` tag) → daily, keep 7. Snapshots cost a few cents per month.
- **By hand, to your PC**:

  ```powershell
  ssh -i $HOME\.ssh\petrik.pem ubuntu@SERVER "cd petrik && docker compose stop server && tar czf ~/backup.tgz apps/server/data/db apps/server/uploads && docker compose start server"
  scp -i $HOME\.ssh\petrik.pem ubuntu@SERVER:backup.tgz .\petrik-backup.tgz
  ```

## First deploy after the page-editor v2 (AGENT.md 6.20)

The server rebuilds its `pages` table by itself on first start, and the old
per-page overrides (`page_overrides`) are **not** applied any more until they
are migrated into documents - once, by hand, from the repo checkout:

```
# on the server: back up, then dry-run on a COPY of the database
cp apps/server/data/db/hirkezelo.db* /tmp/ && node --experimental-strip-types apps/client/scripts/migrate-overrides.ts /tmp/hirkezelo.db
# happy with the report? run it for real against the live database (server stopped)
docker compose stop server
node --experimental-strip-types apps/client/scripts/migrate-overrides.ts apps/server/data/db/hirkezelo.db --write
docker compose start server
```

(Needs Node 24 on the machine that runs it; with no `page_overrides` rows it
reports "nothing to migrate".)

## Importing the old site's news (AGENT.md 6.24)

All 216 news posts of the old petrik.hu (`kutatok-ejszakaja-a-petrikben`
included, which used to be a static page) live in the Hírkezelő's database, with
their pictures in `apps/server/uploads/mirror/` (about 300 MB). The import reads
the mirror, which exists only on your PC, so it runs **there**:

- **Option B on the first deploy (`-WithData`)**: run the import locally first
  (`$env:PETRIK_MIRROR="<mirror folder>"; npm run import-posts -w apps/server`),
  and the posts and pictures travel with your data.
- **A server that already has live data**: do not use `-WithData`, because it
  would replace that data. Instead, deploy the code, then import into a copy of
  the server's data on your PC and put the copy back. The server stays stopped
  from step 2 to step 4, so nothing edited on the live site in between is lost.

  ```powershell
  # 1. The new code (leaves the data alone)
  .\deploy.ps1 -Server SERVER -Key $HOME\.ssh\petrik.pem

  # 2. Stop the server and download its data
  ssh -i $HOME\.ssh\petrik.pem ubuntu@SERVER "cd petrik && docker compose stop server && sudo chown -R ubuntu apps && tar czf ~/backup.tgz apps/server/data/db apps/server/uploads"
  scp -i $HOME\.ssh\petrik.pem ubuntu@SERVER:backup.tgz .\petrik-backup.tgz
  mkdir C:\petrik-backup; tar xzf .\petrik-backup.tgz -C C:\petrik-backup

  # 3. Import into the copy
  $env:PETRIK_MIRROR="<mirror folder>"
  $env:PNW_DATA_DIR="C:\petrik-backup\apps\server\data\db"
  $env:PNW_UPLOADS_DIR="C:\petrik-backup\apps\server\uploads"
  npm run import-posts -w apps/server

  # 4. Put the copy back and start the server
  ssh -i $HOME\.ssh\petrik.pem ubuntu@SERVER "cd petrik && rm -f apps/server/data/db/hirkezelo.db apps/server/data/db/hirkezelo.db-wal apps/server/data/db/hirkezelo.db-shm"
  scp -i $HOME\.ssh\petrik.pem C:\petrik-backup\apps\server\data\db\hirkezelo.db ubuntu@SERVER:petrik/apps/server/data/db/
  scp -i $HOME\.ssh\petrik.pem -C -r C:\petrik-backup\apps\server\uploads ubuntu@SERVER:petrik/apps/server/
  ssh -i $HOME\.ssh\petrik.pem ubuntu@SERVER "cd petrik && docker compose start server && docker compose ps"
  ```

  Close the PowerShell window afterwards: the `PNW_*` variables would otherwise
  point a later local `npm run server` at the copy.

  > **Delete the `-wal` and `-shm` files on the server before uploading** (the
  > `rm` in step 4). The database is SQLite in WAL mode: recent changes sit in
  > `hirkezelo.db-wal` next to the main file, and on the server that is often
  > where nearly all the data is. The import merges it into `hirkezelo.db` on
  > your PC, so only that one file goes back. A `-wal` left on the server is
  > replayed over the new file on start, and the imported posts vanish (their
  > pages answer 404) without any error.

The import is idempotent: a post already in the database is skipped, so a
second run changes nothing.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Permission denied (publickey)` | User must be `ubuntu`; check the `-Key` path. |
| `UNPROTECTED PRIVATE KEY FILE` | Redo the two `icacls` lines in step 3. |
| SSH hangs / times out | Your IP changed: EC2 → Security groups → inbound SSH rule → *My IP*. |
| Deploy stops with ".env is missing on the server" | Do step 5, then on the server: `cd ~/petrik && docker compose up -d --no-build --remove-orphans`. |
| Domain shows Cloudflare error **502/1033** | Tunnel service URL must be `client:80` (type HTTP); check `docker compose ps` shows `tunnel` running; `docker compose logs tunnel`. |
| Site shows the old version | Hard refresh (Ctrl+F5); check the deploy ended with "Deployed." |
| Site loads but logins/news fail (`/api` errors) | The server container: `cd ~/petrik && docker compose logs -f server` |
| Anything else | On the server: `cd ~/petrik && docker compose logs -f client` (or `server`) |

To pause everything: EC2 → instance → **Stop** (the disk and its data stay; you
pay only for the disk). **Terminate** deletes the server *and its data* — take a
backup first.
