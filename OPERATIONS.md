# Running petrik.zsombor.dev — what you need to know

The one-time setup is in [DEPLOY.md](DEPLOY.md). This file is for after that:
what the live site is made of, how to update it, and what can go wrong.

## The setup at a glance

| | |
|---|---|
| Live site | https://petrik.zsombor.dev |
| Login (Hírkezelő + Szerkesztő) | https://petrik.zsombor.dev/bejelentkezes/ |
| Server | AWS EC2 `t3.micro`, Ubuntu, IP **SERVER** (your server's public IP) (changes if the instance is *stopped* and *started*) |
| SSH key | `$HOME\.ssh\petrik.pem` — the only way into the server; AWS cannot give you a new copy |
| Server folder | `~/petrik` |
| Domain | Cloudflare tunnel `petrik` → `http://client:80` (no open web ports on the server) |

Three containers run on the server (`docker-compose.yml`):

- **client** — nginx serving the website, forwarding `/api/` and `/uploads/` to the server
- **server** — the API: Hírkezelő, Szerkesztő, logins, database
- **tunnel** — connects the site to Cloudflare

## Two kinds of change

| You change… | Where | Deploy needed? |
|---|---|---|
| News, page content, menu, accounts, uploaded images | On the live site (Hírkezelő / Szerkesztő) | **No** — saved on the server immediately |
| Code (anything in `apps/`, `shared/`) | On your PC | **Yes** |

Your PC's local site has its **own, separate** database. Nothing you do there
reaches the live site, and live edits never come back to your PC.

## Deploying a code change

Docker Desktop must be running. In PowerShell:

```powershell
cd $HOME\Downloads\scrape\petrik.hu
.\deploy.ps1 -Server SERVER -Key $HOME\.ssh\petrik.pem
```

It builds both images on your PC, uploads them and restarts the containers.
It never touches the live database, uploads or `.env`. Everyone logged in has
to log in again afterwards.

> **Never use `-WithData` again.** It replaces the live database and uploads
> with your PC's copy — every news item, page edit and account change made on
> the live site since would be gone. It was for the first deploy only.

## Where the live data is

| What | On the server |
|---|---|
| Settings and secrets | `~/petrik/.env` |
| Database (news, pages, menu, accounts) | `~/petrik/apps/server/data/db/` |
| Uploaded images | `~/petrik/apps/server/uploads/` |

`.env` holds the session secret and the Cloudflare tunnel token — never commit
or share it. To change a setting:

```powershell
ssh -i $HOME\.ssh\petrik.pem ubuntu@SERVER
nano ~/petrik/.env                                  # Ctrl+O, Enter, Ctrl+X
cd ~/petrik && docker compose up -d --no-build
```

`PNW_SHOW_DEMO_LOGINS` must stay `false` on the live site.

## Accounts

- Accounts and their rights are managed in **Hírkezelő → Fiókok**.
- "Oldalak szerkesztése" lets someone edit the website itself (Szerkesztő);
  give it only to people who should.
- At least one account must keep "Fiókok kezelése".
- **To do once:** the three starting accounts (`mk.vezeto`, `helyettes`,
  `igazgato`) came over with their demo passwords, which are public in the
  repo. Change their passwords or delete them.

## Backups

Everything worth keeping is the database and uploads folders above.

- **Automatic (set up once):** EC2 → Elastic Block Store → **Lifecycle
  Manager** → EBS snapshot policy on the `petrik` instance, daily, keep 7.
- **Copy to your PC:**

  ```powershell
  ssh -i $HOME\.ssh\petrik.pem ubuntu@SERVER "cd petrik && docker compose stop server && tar czf ~/backup.tgz apps/server/data/db apps/server/uploads && docker compose start server"
  scp -i $HOME\.ssh\petrik.pem ubuntu@SERVER:backup.tgz .\petrik-backup.tgz
  ```

- **Restore a copy** (replaces the live data):

  ```powershell
  scp -i $HOME\.ssh\petrik.pem .\petrik-backup.tgz ubuntu@SERVER:backup.tgz
  ssh -i $HOME\.ssh\petrik.pem ubuntu@SERVER "cd petrik && docker compose stop server && sudo rm -rf apps/server/data/db apps/server/uploads && tar xzf ~/backup.tgz && docker compose start server"
  ```

> **Never copy `hirkezelo.db` over on its own.** The database folder holds
> three files: `hirkezelo.db`, `hirkezelo.db-wal` and `hirkezelo.db-shm`.
> Recent changes, often most of the data, live in the `-wal` file. Always
> move the whole `db` folder, as above. To upload a single `hirkezelo.db`
> (e.g. after editing a copy on your PC, see DEPLOY.md "Importing the old
> site's news"), stop the server and delete all three files on the server
> first. A leftover `-wal` is replayed over the new file, and the site
> silently shows the old data.

## When something is wrong

All from PowerShell on your PC:

```powershell
# Are all three containers "Up"?
ssh -i $HOME\.ssh\petrik.pem ubuntu@SERVER "cd petrik && docker compose ps"

# What is the server saying? (logins, news, pages failing)
ssh -i $HOME\.ssh\petrik.pem ubuntu@SERVER "cd petrik && docker compose logs --tail 50 server"

# Restart everything
ssh -i $HOME\.ssh\petrik.pem ubuntu@SERVER "cd petrik && docker compose restart"
```

| Symptom | What to do |
|---|---|
| Cloudflare error page (502, 1033) | Check `tunnel` is Up; restart. In Cloudflare the tunnel must show *Healthy* and its hostname must point to `http://client:80`. |
| Site loads, but logging in / saving fails | `docker compose logs server` |
| Site shows an old version after a deploy | Hard refresh (Ctrl+F5); check the deploy ended with "Deployed." |
| SSH times out | Your home IP changed: EC2 → Security Groups → inbound SSH rule → *My IP* |
| `Permission denied (publickey)` | User must be `ubuntu`, key must be `petrik.pem` |
| Deploy says `.env is missing` | The server's `~/petrik/.env` is gone — recreate it (DEPLOY.md step 5) |
| Disk full | `ssh … "docker system prune -f"` removes old images |

After a server reboot, everything starts by itself.

## AWS: money and the instance

- The **Zero spend budget** emails you the moment anything costs money. The
  free period is limited; after it this setup costs roughly $8–10/month
  (Lightsail is cheaper, ~$5, if it comes to that).
- **Stop** pauses the server (data kept; you pay only for the disk). After
  starting it again it has a **new IP** — use that in the deploy and SSH
  commands. The website itself keeps working, the tunnel doesn't care.
- **Terminate** deletes the server **and all its data**. Back up first.

## Working locally

From `scrape\petrik.hu`:

| Command | What |
|---|---|
| `npm run dev` | The website with hot reload, http://localhost:5173 (needs `npm run server` for logins/news) |
| `npm run server` | The API on :4000 |
| `docker compose up --build -d` | The whole thing like production, http://localhost:4000 |
| `npm run lint` / `npx tsc -b` | Checks before deploying |

After cloning on a new machine: `npm install --ignore-scripts` (the database
driver ships ready-made binaries; its build step would fail without Visual
Studio).

Commit your changes to git before deploying — the deploy uses the files on
your PC, not git, so git is your only history of what went live.

## More detail

- [DEPLOY.md](DEPLOY.md) — setting up a server from scratch
- [AGENT.md](AGENT.md) — how the codebase works (Hungarian)
