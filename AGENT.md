# petrik.hu — port állapot és tudnivalók

Ez a dokumentum egy folyamatban lévő munkát ír le: a `petrik.hu` WordPress-oldal
statikus mentésének átültetését React + TypeScript + Vite projektbe.

**Ez az egyetlen átadás a következő ügynöknek.** Amit ide nem írsz le, az a
következő kör számára nem létezik — vagy rosszabb, "megjavítja" azt, ami
szándékos eltérés (6. szakasz).

**2026-09-24-i tisztítás:** ez a fájl 1393 sorról erre a méretre rövidült. A
történeti "hogyan jöttem rá" elbeszélések (mérési számok, próbálkozás-sorrend)
kikerültek; ami megmaradt, az minden döntés, szabály, szándékos eltérés és
tanulság, ami még **most is** befolyásolja, mit szabad és mit nem szabad
csinálni. Ha egy részlet innen hiányzik, az `git log`/`git blame` még mindig
megvan — ezt a fájlt működési kézikönyvnek szánjuk, nem naplónak.

## Frissítsd ezt a fájlt minden változtatás után

Amit egy kör után frissíts:
- ha egy 8.2-es tétel elkészült vagy kiderült, hogy a premisszája téves volt,
- egy **rövid** (3-8 soros) bejegyzés a 4. szakaszban minden **nem nyilvánvaló**
  hibáról: mi volt az ok, és mi a **tanulság** — ne a teljes nyomozást írd le,
  csak amit a következő ügynöknek tudnia kell,
- a 6. szakasz, ha új *szándékos* eltérés keletkezett,
- a 7. szakasz, ha új csapdába futottál bele.

Ha kiderül, hogy egy itt leírt állítás **téves**, javítsd ki a helyén — ne írj
mellé egy másodikat (lásd 4.23, ahol ez korábban megtörtént).

---

## Aktuális állapot

A port **működik és kész**: mind a 129 mentett route renderelődik (2026-10-04
óta 128 oldalként + a mintaposzt Hírkezelő-hírként, 6.24), saját
címmel, metaadattal és favicon-nal, a szövegük **karakterre azonos** a
mentéssel (`check-text.ts`, utoljára ellenőrizve 2026-09-19), és a kezdőlap
minden szekciója **0,0px**-re egyezik. `npm run build`, `npm run lint`,
`check-routes.ts` és `check-titles.ts` ugyanekkor zöld volt.

**2026-10-04: a régi hírek a Hírkezelőben** (részletek: 6.24) — a mentés mind
a 216 hírje (a korábban statikus mintaposzt is) importálva a Hírkezelő
adatbázisába (`npm run import-posts -w apps/server`), az eredeti `/<slug>/`
URL-en elérhetők, a listák kártyái linkelnek rájuk, archiválva eltűnnek. A
generált oldalak száma ezzel 52 (a `KutatokEjszakaja` dokumentum törölve). A 253
összefoglalóból 44 marad placeholder: ezeket a mentés nem tartalmazza.

**Hátralévő 3 tétel** (részletek: 8. szakasz):
1. 44 hír, amelyet a listák említenek, de a mentés nem tartalmaz —
   placeholder kártyák, portból nem javítható.
2. A 128 nem-kezdőlap oldal pixelellenőrzése nincs végigmérve szekciónként
   (a kezdőlap, a klasszikus oldal, a docs és az archívumok igen).
3. ~~`public/media` 271 MB — bemegy-e a gitbe~~ — eldőlt: adatbázisban van, nincs a gitben (6.25).

**2026-09-25: AWS-telepítés** (lépésről lépésre: `DEPLOY.md`) — EC2 +
Cloudflare-tunnel a felhasználó saját domainjén. Az image a **helyi gépen**
épül (`deploy.ps1`: build → `docker save` → `scp` → `docker load` →
`docker compose up -d --no-build`), mert 1 GB RAM-on a build elfogy, és a
`public/media` nincs a gitben. A `docker-compose.yml` kapott fix
`name`/`image` nevet és egy `tunnel` (cloudflared) szolgáltatást a `tunnel`
profil mögött (`COMPOSE_PROFILES=tunnel` a szerver `.env`-jében); a tunnel
nyilvános hostneve a `client:80`-ra mutat (a 2026-09-26-i szétválasztás óta
két image: `petrikhu-server`, `petrikhu-client`). Új
környezeti változók (`server/config.ts`): `PNW_SHOW_DEMO_LOGINS` (a
bejelentkező kártya demó-jelszavai — helyben alapból látszanak,
`NODE_ENV=production`-ben, tehát Dockerben alapból **nem**; a kártya a
`GET /api/auth/config`-ból tudja), `PNW_SEED_PASSWORD` (üres adatbázisnál a
három seedelt fiók jelszava a nyilvános demó-jelszavak helyett), és
induláskor figyelmeztetés, ha élesben a nyilvános alap `PNW_SESSION_SECRET`
fut. **Élesben nem ellenőrizve** — a szkript szintaxisa, a compose-konfig
és a változók egy helyi szerveren igen.

**2026-10-01: Szerkesztő v2 — minden oldal dokumentum** (részletek: 6.20) —
az 53 generált oldal `PageDocument` (`src/data/pages/`), egy renderer rajzolja
mindet, az alapértelmezett render bájtra azonos a régi TSX-ével
(`render-pages.ts check`, 53/53); szerkesztve már teljes elrendezés/design
szintig átírható, törölhető (tombstone), visszaállítható. A v1 felülírási réteg
(6.19) ezzel **megszűnt**; a migrációja `migrate-overrides.ts`.

**2026-09-25: oldalszerkesztő — `/bejelentkezes/` + `/szerkeszto/`**
(részletek: 6.19; a v2-é: 6.20) — közös bejelentkezés a
Hírkezelőhöz és a Szerkesztőhöz; a mentett oldalak tartalma egy
index-kulcsos **felülírási rétegen** át szerkeszthető (a generált TSX
érintetlen), új oldal hozható létre a webhely saját Divi-komponenseiből és
másolt CSS-éből, és a menü szerkeszthető. Új jog: `pnw_manage_pages`. Mentett
felülírás nélkül minden oldal szövege és feje változatlan (`check-text` és
`check-head` 129/129, 2026-09-25). **Új generált fájl:**
`src/data/page-inventory.ts` — a `generate.ts` már magától újraírja.

**2026-09-24: mobil fejléc-munka** (részletek: 4.24, 6.14) — a fejléc mobilon
`position: sticky`, szándékos eltérés a mentéstől (felhasználói kérés). Ez a
munka **nem** CSS-only volt vakon: a mentés ezen a gépen elérhető
(`MIRROR_ROOT`, lásd lent), és Playwright-tal ellenőrizve lett, de a 8.2-es
geometriai táblázat **nem lett újramérve** ez után — ha valaki a mobil
nézetet auditálja, ezt vegye figyelembe.

**2026-09-24: 75%-os Hírkezelő + élő hírek a Hírek oldalon** (részletek: 6.17
és 6.18) — a `/hirkezelo/` minden képernyője (a bejelentkezés is) a viewport
75%-a, középre igazítva; és a Hírkezelőből publikált hír mostantól megjelenik
a kategória-archívumok (pl. a főmenü "Hírek" pontja, `/kategoria/hirek/`)
listájának élén is, nem csak az oldalsáv widgetjében és a Kezdőlap
hírfolyamaiban. Futó backend ellen, fejetlen Chrome-mal ellenőrizve.

**2026-09-24: a Hírkezelőben nincsenek szerepkörök** (részletek: 6.16) — a
fiókok fiókonként kapcsolható **jogosultságokat** kapnak (hír beküldése,
jóváhagyás, kint lévő hírek, napló, kategóriák/címkék létrehozása, fiókok
kezelése), és **minden fiók használhat minden kategóriát és címkét** — újat
csak `pnw_manage_terms` joggal lehet létrehozni. A kategóriák/címkék ezzel
szerkeszthető `terms` táblába kerültek, a poszt kapott `tagIds`-t, a régi
adatbázis pedig induláskor migrálódik. **Figyelem:** ez a kör futó backend
nélkül készült (a `better-sqlite3` ezen a gépen nem fordul — 2026-09-26 óta
`--ignore-scripts`-szel mégis fut, lásd 2.), így `curl`- és
böngésző-ellenőrzés nem történt — lásd 6.16 végét.

**2026-09-24: `/hirkezelo/` valódi funkció lett** (részletek: 6.15) — a
Petrik News Workflow WordPress plugin újraimplementációja, saját Express
backenddel (`server/`). **Ez az egyetlen rész a repóban, ami nem a mentés
portja**, és az egyetlen, aminek futó Node-folyamat kell (`npm run server`)
— minden más route továbbra is tisztán statikus. Playwright-tal
végigvitt teljes workflow-val ellenőrizve (beküldés → jóváhagyás/
visszaküldés → javítás → újraküldés, mindhárom demó szerepkörrel).

---

## 1. Mit kell tudni ahhoz, hogy bármit is csinálj

### A mentés helye

Az `apps/client/scripts/mirror.ts` `MIRROR_ROOT` konstansa a forrás: jelenleg
`<repo>/../../mirror/petrik.hu/petrik.hu`, két szinttel a repo gyökere fölött
(a konstans az `apps/client`-hez képest számol, ezért `../../../../`).
**Ez gépfüggő** — ezen a gépen (macOS, `zsombor`) ez ténylegesen
`/Users/zsombor/Documents/school/petrik.hu/mirror/petrik.hu/petrik.hu`, és
létezik is (ellenőrizve 2026-09-24). Ne írj be ide konkrét elérési utat
szó szerint máshova: mindig a konstansból indulj ki, és ha a mentés hiányzik,
ellenőrizd a konstanst, mielőtt feltételeznéd, hogy nincs mentés.

A mentés WordPress + **Divi 4.27** téma + **BetterDocs** plugin.

| Típus | Darab | Állapot |
|---|---|---|
| Oldal (`body.page`) | 25 (home-mal) | **kész** |
| Klasszikus WP-oldal (nincs Divi-fa) | 1 (`adatkezelesi-tajekoztato`) | **kész** |
| Bejelentkezési űrlap (`hirkezelo`) | 1 | **lecserélve** — valódi, Express-backendes újraimplementáció, lásd 6.15 |
| Docs oldal (`docs/*`) | 27 | **kész** |
| `dokumentumtar` | 1 | **kész** |
| Doc-kategória (`dokumentum-kategoria/*`) | 10 | **kész** |
| Doc-címke (`dokumentum-cimke/tananyag`) | 1 | **kész** |
| Blogposzt (`body.single-post`) | 216 | mind importálva a Hírkezelőbe, eredeti URL-en (6.24) — **kész** |
| Archívum (kategória + dátum + szerző) | **64** | **kész** |

### Jóváhagyott scope-döntések (a felhasználótól)

- **A blogposztok a Hírkezelőben élnek** (2026-10-04, felhasználói döntés: ott
  legyenek kezelhetők, ne statikus oldalak) — mind a 216, az eredeti URL-en,
  lásd 6.24. Korábban csak a `kutatok-ejszakaja-a-petrikben` volt (statikus)
  oldal; ma egyik sem az. Placeholder kártya csak a mentésből hiányzó 44 hírnek jár.
- **Az archívumok benne vannak** a scope-ban, **valódi lapozó route-okkal**
  (`/kategoria/hirek/page/2/`), a mentés oldalméretével.
- **A Hírkezelő jogosultság-alapú, nem szerepkör-alapú**, és minden fiók
  minden kategóriát/címkét használhat (újat létrehozni külön jog) — lásd 6.16.
- **A `/hirkezelo/` mostantól valódi funkció** — nem a mentés portja, hanem a
  Petrik News Workflow WordPress plugin újraimplementációja, saját Express
  backenddel (`server/`), felhasználói kérésre. Nincs menüpont rá, ahogy az
  eredeti pluginnak sincs — csak közvetlen URL-lel érhető el. Lásd 6.15.
- **A 2 jelszóvédett docs oldal megkapja a keretet**, a tartalom helyén jelzéssel.
- **A `/dokumentum-kategoria/` 10 oldala benne van** a scope-ban.
- **A `/dokumentumtar/` rácsa sorrendhű** (nem pakolás-hű), lásd 6.5.
- **A docs kereső működő React-szűrő** a 27 dokumentum címére.
- **A PDF-ek a `public/`-ba kerülnek**, az eredeti `wp-content/uploads/...`
  útvonalat megtartva.
- **A cél a lehető legpixelpontosabb** egyezés az eredetivel — kivéve, ahol a
  felhasználó kifejezetten mást kért (6. szakasz).
- **Oldalanként külön `.tsx` fájl**; ami több helyen kell, megosztott komponens.
- Új npm dependency **csak a felhasználó jóváhagyásával**. Eddig egy van:
  `node-html-parser` (devDependency, csak a `scripts/` használja).

### Kötelező szabályok (a felhasználótól, változatlanul érvényesek)

- WordPress-szemét nem kerül át: jQuery, `wp-embed`, `wp-emoji`, `admin-ajax`,
  inline WP script blokkok, Divi/plugin JS. Helyettük React-megoldás.
  **Pontosítás:** ez a *kódra* vonatkozik, nem a *helyfoglalásra* — két
  plugin-widget markupja átkerül inertként, `href` nélkül, mert eldobva
  valódi elrendezés-eltolást okoztak. Lásd 6.9.
- **Nincs `dangerouslySetInnerHTML`.** A tartalom strukturált adatból vagy
  közvetlen JSX-ből renderelődik.
- A CSS-t nem egy blokkban másoljuk: csak a szükséges szabályokat, a projekt
  styling-megoldásához illesztve (komponens melletti sima `.css` fájl).
- A törött linkekre nem generálunk route-ot; placeholder kerül a helyükre.
- **Ne találj ki CSS-szabályt.** Eszköz van rá, lásd 3.3.

---

## 2. A projekt felépítése

**2026-09-26 óta kliens és szerver külön mappában** (felhasználói kérés):
`apps/client` (a weboldal: `src/`, `public/`, `scripts/`, `index.html`, Vite-
és TS-konfig) és `apps/server` (a korábbi `server/` teljes tartalma), npm
workspace-ként (gyökér `package.json`, egy közös `package-lock.json`); a
`shared/` a gyökérben maradt, mindkettő relatív úttal importálja. **Ebben a
dokumentumban a régebbi bejegyzések `src/…`, `scripts/…`, `public/…`,
`index.html`, `vite.config.ts` útvonalai `apps/client/` alatt, a `server/…`
útvonalak `apps/server/` alatt értendők**, a `scripts/*.ts` parancsokat pedig
az `apps/client` könyvtárból futtasd (`cd apps/client && node
--experimental-strip-types scripts/…`). Gyökérből: `npm run dev`, `npm run
build`, `npm run server`, `npm run lint`, `npx tsc -b`.

Két részlet, ami ezzel járt: (1) a `shared/pnw/seed-terms.ts` korábban a
kliens `src/data/archives.ts`-ét importálta — a szerver-image ezt nem
tartalmazza, ezért a 37 kategória most generált fájl
(`shared/pnw/seed-categories.ts`, `apps/client/scripts/seed-categories.ts`
írja; az `archives.ts` után futtasd). (2) A `better-sqlite3` 13-as verziója
**előre fordított binárist hoz** (win32-x64, linuxmusl-x64 stb.); a
`node-gyp rebuild` install-szkriptje az, ami Visual Studio nélkül elbukik.
`npm install --ignore-scripts` után ezért ezen a Windows-gépen is fut a
szerver (2026-09-26, ellenőrizve) — a korábbi „itt nem indítható” állítások
erre értendők.

### Konvenciók

TypeScript, `.tsx`, `jsx: react-jsx`. A `tsconfig.app.json` szigorú:
`verbatimModuleSyntax` (típusimport mindig `import type`), `erasableSyntaxOnly`
(**nincs enum, parameter property, namespace**), `noUnusedLocals`,
`noUnusedParameters`. Sima CSS a komponens mellett, natív nesting, `:root`
custom property-k. Pontosvessző nélküli, egyes idézőjeles importok `.tsx`
kiterjesztéssel.

### Könyvtárak

```
package.json        npm workspace-gyökér: apps/client + apps/server, lint-eszközök
docker-compose.yml  server + client (+ opcionális tunnel) — lásd DEPLOY.md
deploy.ps1          AWS-telepítés a helyi gépről (DEPLOY.md)

apps/client/        a weboldal (Vite + React); Dockerfile: build → nginx,
                    nginx.conf: SPA + /api és /uploads továbbítása a szervernek
apps/client/scripts/  fejlesztői eszközök, sosem kerülnek a bundle-be
  mirror.ts         MIRROR_ROOT és a többi útvonal-konstans
  pages.ts          az oldaltérkép: mirror-könyvtár → route → komponens
  extract.ts        közös segédek: osztályok, URL-átírás, inline HTML → JSX
  walk.ts           a bejáró: négy oldalforma → TSX
  generate.ts       mind az 53 oldal újragenerálása (ezt hívd)
  page-css.ts       az oldal Divi design-stíluslapjának kinyerése + scope-olása
  docs.ts           a BetterDocs index → src/data/docs.ts
  archives.ts       a 64 archívum → src/data/archives.ts
  collect-css.ts    stíluslap építése a ténylegesen illeszkedő szabályokból
  posts.ts          poszt-összefoglalók gyűjtése → src/data/posts.ts
  fonts.ts          Google-fontok kinyerése → public/fonts + src/styles/fonts.css
  copy-assets.ts    képek/PDF-ek másolása → public/media
  measure.ts        geometria-összehasonlítás CDP-n át
  matched-css.ts    egy elemre ténylegesen illeszkedő szabályok
  css-rules.ts      szabályok kiszedése egy stíluslapból szelektor szerint
  check-text.ts     renderelt szöveg összehasonlítása
  check-head.ts     cím/leírás/robots/canonical összehasonlítása
  check-routes.ts   route-tábla és oldalkomponensek egyezése
  layout-report.ts  oldalankénti legnagyobb eltérés a mentéshez (lásd 8.2 korlátja)
  shot.ts           screenshot pontos viewport-szélességen
  tsx-to-document.ts   a walk.ts TSX-kimenete → PageDocument (6.20)
  documents.ts      src/data/pages/*.json + registry + shared/pnw/mirror-routes.ts írása (6.20)
  render-pages.ts   az alapértelmezett dokumentumok SSR-je; `check` = a bájtazonos kapu (6.20)
  render-baseline.json  a 53 oldal eredeti (TSX-ből vett) HTML-jének SHA-256-ja
  migrate-overrides.ts  a v1 `page_overrides` → dokumentumok, egyszeri (6.20)
  seed-categories.ts   a Hírkezelő 37 kezdő kategóriája → shared/pnw/seed-categories.ts

apps/client/src/
  components/       Layout, TopBar, Header, Footer, Sidebar, ...
                    PostHeader, SharedCounts                  (a poszt)
                    ArchiveView, ArchiveCard, ArchivePagination  (a 64 archívum)
  components/divi/  a Divi modulok: Section, Row, Column, Text, Blurb, ...
  components/docs/  a BetterDocs keret: DocsLayout, DocsSearch,
                    DocsCategoryList, DocsBreadcrumb, DocsNav,
                    DocsReactions, DocsIcons, FileBlock, DocsProtectedNote
  components/pagebuilder/  PageRenderer, RichContent, builder-page.css —
                    MINDEN oldal renderelése dokumentumból (6.20)
  components/szerkeszto/   a /szerkeszto/ felülete (6.19)
  data/             site.ts, footer.ts, posts.ts, docs.ts, archives.ts,
                    pages/ — az 53 oldal alapértelmezett dokumentuma (.json),
                    stíluslapja (.css) és a registry (index.ts) — GENERÁLT (6.20)
  lib/              useColumnCount.ts, text.ts (fold), useBodyClass.ts,
                    useFixedHeader.ts (a görgetéskor zsugorodó fejléc)
  lib/site/         SiteContentProvider — a Szerkesztő szerkesztett oldalai,
                    tombstone-jai és menüje a publikus oldalon (6.20)
  pages/            oldalanként egy .tsx + egy .css; kézzel írt, nem generált:
                    Hirkezelo, PublishedPost, Bejelentkezes, Szerkeszto,
                    DynamicPage
  pages/docs/       a 27 generált docs oldal
  pages/            Dokumentumtar.tsx, DocTaxonomy.tsx (kategória + címke)
  routes/           docsRoutes.tsx — a 27 docs route
  styles/           divi-layout.css (rács), sidebar-layout.css (kétoszlopos
                    keret, generált), fonts.css (generált)

apps/server/        az Express backend (Hírkezelő + Szerkesztő API) — NEM a
                    mentés portja, lásd 6.15. `npm run server` (gyökérből)
                    indítja, build nélkül, ahogy a scripts/*.ts-eket.
                    Dockerfile: csak a szerver + shared/ + prod-függőségek.
shared/pnw/         típusok/jogosultságok/állapotok/kategória-seed, amit a
                    kliens (Vite) ÉS a szerver (Node) is importál — lásd 6.15
                    és 6.16; page-types.ts a Szerkesztő modellje (6.19). Szerepkör nincs: `permissions.ts` (a törölt
                    `roles.ts` helyén) fiókonkénti capability-készlettel
                    dolgozik, a kategóriák pedig a `terms` táblában élnek
                    (`seed-terms.ts` csak az üres adatbázis feltöltése).
```

### Generálás

Az `apps/client` könyvtárból:

```bash
node --experimental-strip-types scripts/generate.ts
```

Ez újraírja mind az 53 oldal `.tsx` és `.css` fájlját a mentésből. **A
`src/pages/` alatti fájlokat ne szerkeszd kézzel** — a következő generálás
felülírja őket. Ha egy oldal rosszul néz ki, a `scripts/walk.ts`-t javítsd.

Komponensnevekkel szűkíthető:

```bash
node --experimental-strip-types scripts/generate.ts HomePage
```

Ismeretlen névre hangosan megáll, nem generál semmit.

Az adatgenerátorok külön futnak, és **ebben a sorrendben** (a `posts.ts`
olvassa az `archives.ts` kimenetét):

```bash
node --experimental-strip-types scripts/docs.ts       # → src/data/docs.ts
node --experimental-strip-types scripts/archives.ts   # → src/data/archives.ts
node --experimental-strip-types scripts/posts.ts      # → src/data/posts.ts
node --experimental-strip-types scripts/head.ts       # → src/data/head.ts
```

A `head.ts` a `pages.ts` `MIRRORED` felsorolásából dolgozik, tehát **minden új
route-nak oda kell bekerülnie**, különben cím nélkül marad (és a
`check-head.ts` szól érte).

A gyűjtött stíluslapok (futó mentés-szerver kell hozzá, lásd 3.):

```bash
node --experimental-strip-types scripts/collect-css.ts docs     # → betterdocs.css
node --experimental-strip-types scripts/collect-css.ts frame    # → sidebar-layout.css
node --experimental-strip-types scripts/collect-css.ts archive  # → ArchiveView.css
node --experimental-strip-types scripts/collect-css.ts post     # → PostHeader.css
node --experimental-strip-types scripts/collect-css.ts share    # → SharedCounts.css
node --experimental-strip-types scripts/collect-css.ts slider   # → HeroSlider.css
```

Mindegyik preset megmondja, mely oldalakat járja be, mit tart meg, és hová ír
(`scripts/collect-css.ts` teteje). A `gallery` preset ki van kommentezve,
lásd 8.2. Mindhárom **ellenőrzi magát**, és nem nulla kilépési kóddal áll meg,
ha a mentés ellentmond a feltevéseinek — ha ez bejön, **a terv rossz**, ne
írd felül, hanem szólj.

Egy oldal önmagában:
```bash
node --experimental-strip-types scripts/walk.ts <mirror-könyvtár> [--report]
```
A `--report` kiírja az oldal fajtáját, a komponenseket, a **tudatosan
eldobott** részeket, és `UNHANDLED`-ként az ismeretlen modulokat — sosem hagy
ki semmit némán. Jelenleg egyetlen oldalon sincs `UNHANDLED`.

---

## 3. Ellenőrző eszközök — ezeket használd, ne szemrevételezz

Mindhez két szerver kell:

```bash
npm run dev                                    # :5173
cd <MIRROR_ROOT> && python -m http.server 8899 # :8899
```

**Ha a Chrome nem indul** (`spawn UNKNOWN`), az nem a szkript hibája: a
teljes `chromium-1243/chrome-win64/chrome.exe`-t egyes (sandboxolt)
környezetek nem engedik indítani, a mellette lévő **headless shell** viszont
fut. Ilyenkor:

```bash
export CHROME_PATH="$LOCALAPPDATA/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe"
```

Mind a hét böngészőt hajtó szkript ezt a környezeti változót olvassa. Egyszeri
DOM-dumphoz szkript nélkül is jó:
`"$CHROME_PATH" --headless --no-sandbox --virtual-time-budget=8000 --dump-dom <url>`.

**Ne futtass két ellenőrzést egyszerre** — közös böngészőt hajtanak, és az
eredmények **hibátlan futással, de hamis számokkal** keverednek össze (pl. a
`home` 7908 karakter, ha 1443-at kapsz, egy másik oldal töltődött be helyette;
állítsd le mindkettőt, indíts egyet). Portok: measure 9333, check-text 9388,
shot 9366, collect-css 9355, matched-css 9377, layout-report 9344.

### 3.1 Szöveghűség

```bash
node --experimental-strip-types scripts/check-text.ts [oldal ...]
node --experimental-strip-types scripts/check-text.ts --only=<builder|classic|docs|post|archive|taxonomy>
```

Blokkonként hasonlítja a renderelt szöveget a mentéshez — **a legerősebb
védőháló**. Teljes futás ~7 perc. Az archívumok URL-je egybeesik a mentés
könyvtáraival, leképezés nélkül ellenőrizhetők.

Szándékosan kizárt (mindkét oldalon, `check-text.ts` `IGNORED` listája):
ikonfont-glyphek, `.et_overlay`, "bővebben" link vs. placeholder-jelzés,
lapozó, kereső spinner, olvasásiidő-ikon, a 2 jelszóvédett dokumentum.

### 3.1b A dokumentum fejléce

```bash
node --experimental-strip-types scripts/check-head.ts
```

Cím, leírás, robots meta, canonical **meglétét** veti össze. Böngészőt hajt
(effect állítja be, nincs benne a kiszolgált HTML-ben) — **ne fusson más
ellenőrzéssel egyszerre.**

### 3.2 Geometria

```bash
node --experimental-strip-types scripts/measure.ts "<css-szelektor>" <urlA> <urlB> [szélesség]
```

Elemenként összeveti a pozíciót és a méretet. Ha a két oldalon nem ugyanannyi
elem van, **nem diffel, hanem szól**.

### 3.3 "Honnan jön ez a szabály?" — ezt használd CSS-hez

```bash
node --experimental-strip-types scripts/matched-css.ts <url> "<szelektor>" [szélesség]
```

Megkérdezi a böngészőt (`CSS.getMatchedStylesForNode`), mely szabályok
illeszkednek **ténylegesen** egy elemre, kaszkád-sorrendben. Csak
`matchedCSSRules`-t ír ki — a `::before`/`::after` a `pseudoElements` ágban
van, ezt a szkript (2026-09-24-ig) nem nézi, kézzel kell hozzáférni a CDP
válaszból, ha pszeudoelem-szabály kell.

**Két korlátja** (ugyanez `collect-css.ts`-re is áll):
1. Csak az elem *aktuális* állapotára illeszkedő szabályokat adja vissza —
   `:hover`, `:focus` **sosem** kerül bele (lásd 4.18d).
2. Amit a Divi/plugin JS-e `.animate()`-tel vagy inline stílussal csinált,
   ahhoz **nincs szabály**, amit be lehetne gyűjteni — a mentés HTML-je is
   csak a nyugalmi állapotot rögzíti. A forrás ilyenkor maga a script
   (`wp-content/themes/Divi/js/scripts.min.js@ver=4.27.8`), olvasható
   formában:
   ```bash
   python -c "import re,sys; s=open(sys.argv[1],encoding='utf8',errors='ignore').read(); i=s.find(sys.argv[2]); print(re.sub(r'(,|;|\{|\})', lambda m: m.group(0)+chr(10), s[i:i+1500]))" <script> <keresett-token>
   ```
   Grep-pel ez nem eldönthető: a plugin minified lapjai 180 KB-osak, nyolc
   hihető, de sosem illeszkedő alternatív elrendezéssel.

```bash
node --experimental-strip-types scripts/css-rules.ts <css-fájl> <token> [token ...]
```
Egy konkrét stíluslapból szedi ki a tokenre illeszkedő szabályokat, `@media`
kontextussal — akkor jó, ha már tudod, melyik lapot nézed.

---

## 4. Amit korábbi körökben találtunk — tanulságok, tömörítve

Ezek nem kozmetikai javítások voltak: mindegyik csendes tartalom- vagy
stílusvesztést okozott. A teljes nyomozás a git történetben van; itt csak az
ok és a tanulság.

**4.1** — `blockJsx` csak az **elem**-gyerekeket térképezte, a köztük lévő
szövegcsomókat nem: egy `<div><strong>X</strong> szöveg…</div>`-ből csak a
`<strong>` maradt meg. Javítva: a div csak akkor lapul ki, ha tényleg csak
blokk-gyerekei vannak.

**4.2** — A bejáró `<div>`-ekből `<p>`-t csinált; a Divi `<p>`-nek alsó margója
van, ez 112px-szel tolta el az oldalt 8 wrappernél. Most `<div>` marad, az
inline `text-align` megőrizve.

**4.3** — A `page-css.ts` a `.page-<slug>` scope-ot a külső ősök **elé** tette
(`.page-home body …` sosem illeszkedik), ez némán ölt meg 83 Divi-szabályt
(kezdőlapi gombok, docs kép-szélesség). Javítva: `OUTER` lista (`html`,
`body`, `.et-db`, `.et_divi_theme`, `#page-container`, `#et-main-area`) — a
scope ezek **után** kerül be.

**4.4** — `rewriteUrl(url, depth)` fix mélységet feltételez, ezért törött egy
docs-alkönyvtár testvér-linkjén. Új `resolveUrl(url, fromDir)` valódi
útvonal-feloldással; a régi a meglévő (helyes) hívóknak megmaradt.

**4.5** — A JSX eldob egy whitespace-futamot, ha az sortörést tartalmaz — a
mentés `<a>A</a><br />\n<a>B</a>`-jában ez valódi szóköz. `extract.ts` most
`{' '}`-ot bocsát ki, ahol a mentésben elemek között whitespace van (ugyanezt
teszi kézzel a `Header.tsx`, lásd 7.5).

**4.6** — `copy-assets.ts` asset-regexe csak `src`/`href`-et illesztett, egy
Gutenberg fájl-blokk `<object data="…pdf">`-ját nem másolta. `data` hozzáadva.

**4.7** — A body-osztályok (`single-post`, `archive`, `et_right_sidebar`,
`et_pb_pagebuilder_layout`, …) **valódi elrendezési szabályokat** kötnek meg,
nem díszek — pl. e nélkül egy poszt Divi-sora 159px-szel keskenyebb. A
`useBodyClass.ts` teszi fel/le őket route-váltáskor, a mentés tényleges
osztályaiból (`walk.ts` `bodyClasses()`, site-szintűek nélkül).
**Ha egy elrendezési szabály nem érvényesül, ezt nézd meg először.**

**4.8** — A kétoszlopos keret (`#left-area`/`#sidebar`) **4 oldalcsalád**
között közös (klasszikus oldal, poszt, kereső, mind a 64 archívum). Globális
`src/styles/sidebar-layout.css`-ben van (`collect-css.ts frame` generálja) —
egyszeri per-oldal scope-olása a másik három családot törte el.
**Ami a témából jön és több oldalcsalád használja, ne kerüljön egyetlen
komponens stíluslapjába sem.**

**4.9** — A Divi `et_pb_with_border` osztálya csak szélességet ad; a
**téma** (nem Divi) adja hozzá a `border-style`-t alapszabályként. E nélkül a
szélesség nem fest és nem foglal helyet — két külön hibának tűnt (tanári
portrék, blog-kártyák), egy okra vezetett vissza. `divi-layout.css`/
`PostCard.css`; a `walk.ts` `borderProp()` helpere a `Text`, `TeamMember`,
`Row`, `Column` modulokra is átviszi az osztályt.

**4.10** — Három kitalált (nem mért) kép-szabály mind rossz volt: a helyes
megoldás az alapvonal-résre `.et_pb_image { line-height: 0 }`, **nem**
`img { display: block }` (töri a `vertical-align`-t) és nem
`img { width: auto }` (elveszi a lusta képek helyfoglaló `width`/`height`
attribútumát). Egy `display: block` szándékosan megmaradt egy konkrét törött
képnél — kommentezve a CSS-ben.

**4.11** — Egy Divi szekció/dia háttérképe a generált CSS-ben
(`background-image: url(...)`) vagy inline `style`-ban él, **sosem**
`<img src>`-ben — ezért sosem másolódott. A `copy-assets.ts` most a generált
CSS-eket és az inline `style`-okat is átvizsgálja `/media/...` hivatkozásért.
**Ha egy kép hiányzik, nézd meg, mi hivatkozza, mielőtt a mentést hibáztatod.**

**4.12** — Három külön hiba adta össze a rossz hero-szövegszínt: a stílusos
`<span style="color:...">`-eket kibontottuk (most `styleProp()` megőrzi,
stílus nélkülit továbbra is kibont); a `Text` komponens bedrótozva világos
háttérmódot adott a `bgLayout` prop helyett; hiányzott a téma
`.et_pb_bg_layout_dark { color: #fff !important }` alapszabálya.

**4.13** — A CSS az **utolsó** deklarációt érvényesíti: a téma
`background-size: 100%; background-size: cover`-t ír, csak az első fele
került át, ezért minden háttérkép nyúlt kitöltés helyett. Az
`et_pb_with_background` osztály is kellett ugyanezért.

**4.14** — Egy oldal saját számozott Divi-osztálya (`.et_pb_section_0`,
`.et_pb_text_3`) oldalanként mást jelent — egy **közös** komponens-stíluslapba
(pl. `HeroSlider.css`) írt, scope nélküli szabály minden más oldal első
szekciójára ráragad. A `collect-css.ts` ezeket automatikusan kizárja
(`PER_PAGE_RE`); oldalspecifikus szabály csak a `page-css.ts` scope-olásában
élhet, sosem közös fájlban.

**4.15** — 19 site-szintű body-osztály (`et_header_style_left`,
`et_fixed_nav`, `et_pb_gutters3`, `et_transparent_nav`, …) hiányzott az
`index.html`-ből — nem díszek, a téma egész szabályrétegeit kapcsolják. A
halmaz = az összes mentett oldal body-osztályainak metszete, a
crawler-gépről beragadt tokenek (`linux`/`windows`/`chrome`) nélkül.

**4.16** — A fejléc görgetéskori zsugorodása (`et-fixed-header` osztály +
átméretezés) Divi saját JS-e volt; portolva `useFixedHeader()` hookként. A
küszöb **60px, a mentésen mérve, nem becsülve** (59-nél még nem vált).

**4.17** — Visszatérő minta (lásd 4.18c, 6.12 is): ha a téma `a`-szelektorra
köt paddinget/pszeudo-tartalmat, egy nem-link szülőt is `<a>`-ként kell
renderelni (`href` nélkül — inert, nem link), különben egy `<span>` némán
elveszti a stílust. Másik tanulság ugyaninnen: egy általános `.nav li
{ line-height }` szabályt ne olvassz bele egy ID-scope-olt szelektorba — az
specificitásban felülütheti a téma saját, specifikusabb `.nav li li`
szabályát.

**4.18** — A kezdőlapi csúszka **öt** külön hibát rejtett egy bug-report
mögött — jó ellenőrzőlista bármely Divi JS-vezérelt modulhoz:
  - **(a)** a dia `padding-top`-ja és a `#page-container` saját eltolása egy
    mechanizmus két fele (lásd 6.1) — az egyiket elrontva a kép "túl
    nagynak" tűnik ahelyett, hogy rossz helyen lenne.
  - **(b)** Divi-dia láthatóságát sose a `hidden` attribútummal vezéreld — a
    téma `display:none` + `:first-child{display:list-item}` párosa erősebb
    nála. Inline `display`-t állíts, ahogy Divi scriptje is tette.
  - **(c)** ha a téma egy vezérlőt `<a>`-ként stílusoz, a port pedig
    akadálymentességi okból `<button>`-t renderel, a gombra át kell ültetni a
    téma deklarációit — ugyanaz a minta, mint 4.17.
  - **(d)** a `matched-css.ts`/`collect-css.ts` csak az elem *aktuális*
    állapotára illeszkedő szabályt adja vissza — `:hover`/`:focus` sosem
    jelenik meg így.
  - **(e)** amit jQuery `.animate()` csinált, ahhoz **nincs** gyűjthető
    CSS-szabály — a minified téma-JS-ből kell kézzel kiolvasni (3.3-as
    recept). Be nem becsülendő, kész konstansok: **700ms** áttűnés (nem a
    plugin 500ms-es alapértéke), `cubic-bezier(0.37, 0, 0.63, 1)` a jQuery
    `swing` easing-jére, és `setTimeout`-per-lépés (nem `setInterval`) az
    automata léptetésre.

**4.19** — Ne feltételezd, hogy a legkisebb ikonfont-részhalmaz minden oldalt
lefed — 35 oldal (342-ből) az `all` részhalmazt kéri, nem a `base`-t. Az
`all` került be, egyszer, globálisan. Mellékesen: a mentés saját
`@font-face`-e abszolút URL-re mutat, offline sosem tölt be — a **mentés**
mutat nyers fallback-glyphet ott, ahol a **port** a valódi ikont. Ez várt
(6.3), ne ehhez igazítsd a portot.

**4.20** — A WordPress kérésenként egész dokumentumot szolgált ki (saját
`<title>`, saját favicon); egy SPA-nak egy `index.html`-je van. Megoldás:
per-route tábla (`scripts/head.ts` → `src/data/head.ts` →
`useDocumentHead()`, ugyanaz a minta, mint `useBodyClass`), és mind a 4
favicon-méret átmásolása (az egyik `content=`-ben volt, nem `href=`-ben,
ezért névvel kellett bekerülnie a `copy-assets.ts`-be). **A címeket átírjuk,
nem előállítjuk** — több oldal valódi címe nem vezethető le a saját
tartalmából (minden dátum-archívum egyszerűen "Archívum"). A mentés
ugyanabban a dokumentumban kevert idézőjelet használ (`name='robots'`
egyszeres, `rel="canonical"` dupla) — bármilyen attribútum-olvasó regex
mindkettőt kezelje.

**4.21** — A kezdőlapi galéria, két hiba, egyik sem CSS-gyűjtési kérdés: **(a)**
Divi rács-elemei alapból `display: none`, csak a téma saját (lapozó) scriptje
teszi `display: block`-ká az aktuális oldal elemeit — a portnak nincs
lapozója, tehát mindig mutassa őket; **(b)** a `collect-css.ts` per-oldal
szűrője túl tágan illeszkedett, és kidobott egy valódi strukturális
szélesség-szabályt, mert számozott per-oldal osztálynak nézte. Megoldás:
`STRUCTURAL_RE` allowlist a Divi valódi strukturális osztályaira
(`.et_pb_column_1_6`, `.et_pb_row_6col`, …).

**4.22** — Öt további kezdőlapi pixelhiba, szekciónkénti méréssel találva
(mindegyik csak az előző javítása **után** vált láthatóvá — szekciónként
mérj, ne az oldal-összesítőt): hiányzó `:last-child` margó a blog-kártyákon;
`loading="lazy"`-t szó szerint a mentésből kell átvenni, nem mindig
hozzáadni; egy gomb-nyíl szabály a rossz pszeudoelemre duplázva; 293 stílusos
`<p>`/`<h*>`/`<blockquote>`/`<div>`, amikre a `styleProp()` csak `<span>`-en
futott; két kitalált `NumberCounter.css` szabály (a valódi megoldás fix
`height`/`line-height` a témából, nem `1em`); hiányzó `.header-content`
szélesség-szabály a záró teljes szélességű fejlécen; és a `Sidebar.css`
újra feltalált egy betűméretet, ami valójában egy sima témázott `<h4>`.

**4.23** — Egy korábbi verzió szerint hiányoztak az OG/Twitter tagek — téves:
a mentés **egyiket sem** hordozza, egyetlen oldalán sem, tehát nincs mit
pótolni. Amit tényleg hordoz (cím mindenhol, leírás csak a kezdőlapon, robots
a legtöbb oldalon, canonical 269-en), azt a `scripts/head.ts`/`check-head.ts`
másolja át. A canonical href-ek relatív útra vannak írva a mentésben, tehát
csak a **ténye** marad meg — az érték `location.origin + pathname`-ből épül
fel futásidőben.

**4.24** — Mobil fejléc-geometria: `#et-top-navigation` `padding-top`-ja
980px alatt `24px`, nem `33px`, és `#et_search_icon::before` `top`-ja ott
`7px`, nem `-3px` — mindkettő valódi mentés-szabály, `matched-css.ts`-sel
találva a mentés `#main-header`/`#et_search_icon` elemén 375px-en (a
`MIRROR_ROOT` ezen a gépen elérhető, lásd 1.). A `#main-header`
`position: absolute` mobil felülírását, amit ugyanez a vizsgálat talált,
egy későbbi felhasználói kérés **lecserélte** sticky fejlécre — lásd 6.14.

---

## 5. Hogyan épül fel a bejáró (`walk.ts`)

**A diszpécser a `PageEntry.kind`-ból dolgozik, nem DOM-szimatból** — 26 docs
oldal is tartalmaz `.et_builder_inner_content`-et, a szimat ezeket a sima
builder-ágra vitte volna, elveszítve a plugin körítését.

| `kind` | Mi ez | Kimenet |
|---|---|---|
| `builder` | Divi-fa | `#main-content > article > .entry-content > …` |
| `classic` | WP-szerkesztős próza | `#left-area` + `<Sidebar />` |
| `docs` | BetterDocs dokumentum | `<DocsLayout slug=…>` + belső Divi-fa |
| `post` | egyetlen blogposzt | `#left-area > article` + `<PostHeader />` + `<Sidebar />` |

A `--kind=` nélküli kézi futtatásnál a `sniff()` tartalékol, és a
`.betterdocs-single-wrapper` próbája megelőzi a Divi-ét.

Kapcsolók: `--report`, `--scope=<class>`, `--kind=<kind>`, `--up=<n>` (hány
szinttel lejjebb van a komponens a `src/pages`-hez képest).

A `DROPPED` halmaz (`walk.ts`) tartja, mit hagyunk ki szándékosan — jelenleg
egyetlen tétel: `et_duplicate_social_icons` (a fejléc social ikonjainak
rejtett, JS nélkül semmit sem csináló másolata). A `--report` `dropped:`
sorként írja ki, tehát ez **döntés**, nem átcsúszás.

---

## 6. Amit szándékosan nem egyezőre csináltunk

**Ezeket ne "javítsd" anélkül, hogy a felhasználóval egyeztetnél.**

1. **`section_0` doboza.** A fejléc alatti helykihagyás a `#page-container`
   paddingjén van (`115px` desktopon, mobil verzió 6.14 óta más — lásd ott),
   nem az első szekció paddingjében. A tartalom pozíciója 0,0px-re egyezik,
   csak a szekció saját doboza tér el.
   **Kivétel:** a docs oldalakon a mentésnek nincs ilyen eltolása (a
   BetterDocs lecserélte a tartalmi területet) — `#page-container:has(.betterdocs-wrapper)`
   veszi vissza.

2. **Elérhetetlen posztok.** A kártya "bővebben" linkje helyett jelzés áll.

3. **Ikonfont.** A mentés `@font-face`-e abszolút URL-re mutat, offline
   hibára fut, és nyers karaktereket rajzol az ikonok helyére. Nálunk a font
   betöltve → **a mi renderünk a helyes**, ne a mentéshez igazíts. A
   `copy-assets.ts` az `all` részhalmazt viszi (lásd 4.19).

4. **A BetterDocs kategória-ikon.** A mentésben törött kép (rossz MIME a
   crawler statikus szerverén), az alt-szöveg 193,7px-et foglal a 32px-es
   ikon helyett. Mi `/media/betterdocs-cat-icon.svg`-ként helyesen adjuk ki
   — a `/dokumentumtar/` kártyacímei emiatt máshol törnek, mint a mentésben;
   **ez várt, a mi oldalunk a jó.**

5. **`/dokumentumtar/` rács.** Az eredetin Masonry JS pakolt a legrövidebb
   oszlopba; nálunk flex-sorok, sorrendhűen, nem pakolás-hűen (felhasználói
   döntés). Oszlopszélesség és első sor pozíciója pixelre egyezik.

6. **Akkordeon `<button>`.** A mentésben csupasz `<svg>` nyíl (csak a plugin
   JS-e érte el); nálunk `<button aria-expanded>` — akadálymentességi
   javítás. A nyitott állapot hűen reprodukált: csak az aktuális dokumentum
   kategóriája nyílik ki, állapotként utánozva.

7. **A Gutenberg PDF-beágyazás rejtve marad.** A `wp-block-file` `<object>`-je
   `hidden`-nel jön; a Gutenberg Interactivity API-t (ami kinyitná) nem
   portoljuk — a mentésben is 0×0-n renderelődik. A fájl a két link alatt
   elérhető.

8. **A Divi `et_duplicate_social_icons` blokkja** nincs átvéve.

9. **A WP-widgetek inertként renderelődnek, nem hiányoznak.** A BetterDocs
   reakció-lábléc (~213px minden docs oldalon) és a poszt megosztás-sávja
   (~41px) markupja és mérete átkerül, `href` nélküli `<a>`-kból állva — nem
   csinálnak semmit, de a helyfoglalásuk valódi. Komponensek:
   `DocsReactions.tsx`, `SharedCounts.tsx`.

10. **Az archív kártya nem kap "nem érhető el" sort** — az archív kártyán
    nincs "bővebben" link, amit helyettesíteni kellene, tehát az állapot csak
    az `<article>` osztályán/`title`-jén szerepel, layoutba nem kerül.

11. **Az elérhetetlen posztok képe `<a>`-ban marad, `href` nélkül** — a téma
    `.et_pb_post a img { vertical-align: bottom }` szabálya erre illeszkedik;
    `<span>`-nel a kép visszaesne az alapvonalra (~7px minden ilyen kártya
    alatt).

12. **A csúszka vezérlői `<button>`-ok**, a mentésben `<a href="#">` — ugyanaz
    az akadálymentességi eltérés és ára, mint a 6. pontnál (téma
    deklarációinak átültetése, `HeroSliderRuntime.css`). Itt egy **hozzáadott**
    szabály is van: `:focus-within` ugyanúgy előhozza a nyilakat, mint
    `:hover` — egy fókuszálható, de láthatatlan vezérlő csapda lenne, amit a
    port hozna be, nem az eredeti.

13. **A body per-oldal osztályait a `useBodyClass` rakja ki** route-váltáskor
    (lásd 4.7/4.15) — egy SPA-nak egy `<body>`-ja van.

14. **A fejléc mobilon (≤980px) is sticky — a mentés nem ezt csinálja.**
    Felhasználói döntés, a 4.24-ben feltárt mentés-viselkedés
    (`.et_fixed_nav #main-header { position: absolute }` ≤980px-en, együtt
    görgetve a `#top-header`-rel) helyett.

    Megvalósítás: `#top-header` ≤980px-en `position: static` (`TopBar.css`),
    `#main-header` `position: sticky; top: 0` (`Header.css`) — normál
    dokumentumfolyásban, egymás után. A natív `sticky` ingyen adja a
    "követi, majd rááll" mozgást: amíg a top bar látszik, a fejléc vele
    görgeti; amint elgörgetett, a fejléc `top: 0`-n megáll. Nincs hozzá JS.

    Ez begyűrűzött két helyre, mert korábban **mindkét sáv** ki volt véve a
    folyásból minden szélességen:
    - `Layout.css` `#page-container` mobil `padding-top`-ja **0**-ra ment
      (a sávok most maguk foglalnak flow-helyet, a régi padding duplázta
      volna az eltolást).
    - A kezdőlap csúszkája (`HeroSlider`) azt feltételezi, hogy a fejléc
      flow-n kívüli, transzparens elem, ami *fölötte* lebeg (innen a dia
      inline `padding-top: 116px`-e, `headerOffset` prop). Sticky, flow-beli
      fejléccel ez mobilon már dupla üres sávot adna. A
      `HeroSliderRuntime.css` egy `@media (max-width: 980px)` blokkja
      `!important`-tal nullázza az inline értéket (és a nyilak
      `margin-top`-ját vissza `-24px`-re) — `!important` kell, mert az érték
      inline style, ami különben mindig verné a média-lekérdezést.

    **Tudatosan elfogadott mellékhatás:** a kezdőlap csúszkájának "a fotó a
    fejléc mögé fut" hatása mobilon megszűnt (a fejléc most valódi helyet
    foglal fölötte). Desktopon (>980px) változatlan.

15. **`/hirkezelo/` valódi, működő újraimplementáció — nem a mentés portja.**
    A felhasználó a `https://github.com/merenyimiklos/petrik-news-workflow`
    repót kérte "beimportálni" ide. Az kiderült, hogy egy teljes WordPress
    plugin (PHP osztályok, WP szerepkörök/jogosultságok, MySQL audit-napló
    tábla, `wp_mail`) — csak élő WordPress + adatbázis alatt fut, nincs
    statikus kimenete, amit át lehetne másolni. Mivel ez a repó statikus
    Vite/React SPA, eddig backend nélkül, a `/hirkezelo/` korábban tudatos
    scope-kizárás volt pontosan emiatt (lásd feljebb, régen). Amikor
    elmondtam, hogy a plugin szó szerint nem importálható, a felhasználó egy
    **valódi, saját Express backenddel rendelkező újraimplementációt** kért
    ("csináld meg úgy, hogy ugyanazt csinálja és ugyanúgy nézzen ki").

    A plugin minden releváns PHP fájlját (`class-pnw-roles.php`,
    `class-pnw-statuses.php`, `class-pnw-access.php`, `class-pnw-actions.php`,
    `class-pnw-statistics.php`, `class-pnw-frontend-login.php`, mind a négy
    `trait-pnw-frontend-*.php`) és CSS-ét (`assets/css/pnw*.css`) elolvasva a
    port a szerepköröket, az állapotgépet, a jogosultsági szabályokat, a
    validációt, az értesítés-szövegeket és a designt (a plugin saját CSS-e,
    szinte szó szerint átvéve) hűen újraépíti — de máshogy működik alatta:

    - **Az autentikáció ide tartozik, nem WordPresshez.** Egy kis Express +
      `express-session` + bcrypt-hashelt seed-felhasználós auth váltja a
      `wp_signon`/WP cookie-kat. 3 demó fiók (6.16 óta nem szerepkörrel,
      hanem jogosultság-készlettel),
      jelszavuk sosem kerül a kliens-bundle-be — a szerver oldalon dől el
      minden, tehát ez, egy kliens-oldali mockkal ellentétben, nem
      trükközhető meg egyszerűen a böngészőből.
    - **A tárolás egy JSON fájl a lemezen** (`server/data/db/posts.json`,
      `audit.json`), nem `wp_posts`/egyedi MySQL tábla. A pilot méretéhez
      elég (néhány munkatárs, pár tucat hír); valódi korlát, nincs
      konkurens-írás elleni zárolás egy egyszerű, folyamaton belüli sornál
      többen.
    - **A "jóváhagyás" sosem ér el a valódi petrik.hu hírfolyamhoz.**
      `PNW_TEST_MODE` itt is hard-coded `true` — ugyanaz, mint a plugin
      valódi, jelenlegi pilot állapota (lásd a plugin saját READMEjét). A
      jóváhagyás csak a `pnw_test_ok` belső állapotot éri el, és sosem írja a
      `src/data/posts.ts`-t/a valódi archívum-adatot.
    - **Nincs valódi e-mail.** A `PNW_Notifications` három levele no-op
      (szerveroldali console-logolás a láthatóságért). A felület semmilyen
      viselkedése nem függ attól, hogy a levél ténylegesen megérkezik-e.
    - **A gazdag szöveg egy kis strukturált modell, nem TinyMCE.** A repó
      szabálya szerint sehol sincs `dangerouslySetInnerHTML`, tehát a plugin
      nyers HTML-jét nem lehet egy az egyben visszaadni. A `RichTextEditor`
      blokkok tömbje (`{type, align, runs: [{text, bold, italic}]}`), sosem
      nyers HTML, mindenhol valódi JSX-en át renderelődik (szerkesztő,
      előnézet, ellenőrzés, publikált nézet). Az eszköztár gombjai (cím,
      félkövér, dőlt, felsorolás, számozott lista, idézet, igazítás,
      vissza/előre, formázás törlése) a plugin `wp_editor()`-jának
      megfelelő gombkészletét adják.
    - **Az időzített automata publikálás** egy `setInterval` az Express
      processben (60mp-enként néz `future` állapotú, lejárt idejű hírt),
      nem WP-Cron.

    **Ellenőrzés módja:** Playwright-tal végigvitt teljes workflow mindhárom
    demó fiókkal (MK-vezető létrehoz+beküld → helyettes jóváhagy/visszaküld →
    MK-vezető javít és újraküld), plusz `curl`-lel ellenőrzött admin-post
    végpontok (jóváhagyás, visszaküldés, újraküldés, jogosultsági határok).
    Eközben előkerült és javítva lett két valódi hiba: a statisztika havi
    grafikonja helyi időzóna miatt egy hónappal visszacsúszott (helyi
    `Date` + `toISOString()` keverése — mindenhol UTC-ben kell számolni,
    ahogy a `date` mezők is UTC ISO stringek), és a bejelentkezés válasza
    nem tartalmazta a `allowedCategoryIds`-t, ezért a szerkesztő
    bejelentkezés után frissítésig minden kategóriát mutatott a korlátozott
    MK-vezetőnek is (a szerver oldali validáció helyesen elutasította a nem
    engedélyezett kategóriát, csak a felület mutatott rosszat). **Ez a mező
    6.16 óta nem létezik** — minden fiók minden kategóriát használhat —,
    a tanulság viszont áll: ami a felületen látszik, azt a session-válasznak
    is hordoznia kell, különben a UI és a szerver mást gondol.

    **Fájlok:** `server/` (Express backend, `node --experimental-strip-types
    server/index.ts`-sel indítható, lásd 2. szakasz), `shared/pnw/` (mindkét
    oldal által importált típusok/jogosultságok/állapotok/kategória-seed;
    a szerepkörök 6.16 óta nincsenek),
    `src/pages/Hirkezelo.tsx` + `src/components/hirkezelo/`. Új npm
    függőségek (felhasználói jóváhagyással): `express`, `express-session`,
    `multer`, `bcryptjs`.

    **Utólagos kiegészítés (ugyanaznap):** a felhasználó kérésére az
    "Előnézet" gomb (`PreviewModal`) a saját, kitalált kártya-dizájn helyett
    mostantól a **valódi single-post sablont** mutatja —
    `PostTemplatePreview.tsx` szó szerint a `kutatok-ejszakaja-a-petrikben`
    mintaposzt (`src/pages/KutatokEjszakaja.tsx`) markupját/osztályait adja
    vissza (`#main-content`/`.container`/`#left-area`/`.et_post_meta_wrapper`/
    `.entry-content`/`.et_pb_text` + a valódi `<Sidebar />`), a
    `sidebar-layout.css`/`divi-layout.css`/`index.css` már betöltött,
    mentésből származó szabályaival — **nincs hozzá kitalált CSS**. A
    kétoszlopos flexbox/float elrendezés és a cím/post-meta méretezés a
    `single`/`et_right_sidebar` body-osztályok mögött van (lásd 4.15), ezért
    a `PostTemplatePreview` a `useBodyClass`-t hívja — **csak amíg a modal
    ténylegesen nyitva van** (a `PreviewModal` feltételesen rendereli), mert
    a komponens maga mindig a DOM-ban van (a nyitást/zárást CSS-osztály
    végzi), és a body-osztályok különben véglegesen rajta maradnának a
    `/hirkezelo/` oldalon. A kivonat (excerpt) emiatt **eltűnt az
    előnézetből** — a valódi single-post sablon sosem mutatja, csak a
    lista-/archívum-kártyák.

    Ugyanezért a `ReadOnlyDetails.tsx` ("Részletek" nézet — a szerző saját
    beküldött hírén, illetve a `review`-nézet nem-`pending` állapotú ága) is
    ugyanezt a `PostTemplatePreview`-t hívja a saját kártya-CSS-e (korábbi
    `.pnw-content-preview`/`.pnw-featured-preview`) helyett — ott a
    `useBodyClass` biztonságos, mert a komponens csak akkor van a DOM-ban,
    amikor a nézet ténylegesen látszik (React feltételes render, nem
    CSS-rejtés), tehát nem kell a `PreviewModal`-nál használt `open &&`
    védelem. A `.pnw-content-preview`/`.pnw-featured-preview` szabályok a
    plugin saját, változatlanul átvett CSS-ében megmaradtak, csak innentől
    nem használja őket semmi — nem szedtem ki, mert azok a plugin eredeti
    forrásának hű másolatai, nem a port kitalálmányai.

    **Utólagos kiegészítés (más nap): a jóváhagyás mostantól valóban publikál.**
    Felhasználói kérésre a korábbi "TEST_MODE mindig `true`" döntés
    megfordult: `server/config.ts`-ben **`TEST_MODE = false`** — a jóváhagyás
    a `publish` állapotot éri el (nem `pnw_test_ok`-ot), a hír valódi oldalt
    kap, és megjelenik a Hírkezelőn kívül is. A backend logikát (`review_news`,
    `update_published_news`, archiválás) **nem kellett átírni** — az mindvégig
    a `TEST_MODE` konstanson elágazott, csak korábban az mindig `true` volt.
    Visszaállításhoz elég a konstanst visszaírni.

    - **Tárolás: JSON fájl → SQLite.** Felhasználói kérésre (`better-sqlite3`,
      új függőség). `server/data/db.ts` nyitja/hozza létre a sémát
      (`posts`, `audit_log` táblák, `server/data/db/hirkezelo.db`, ugyanaz a
      gitignore-olt könyvtár, mint korábban). `server/data/store.ts` és
      `collections.ts` törölve, helyettük `posts-repo.ts`/`audit-repo.ts` —
      szinkron függvények (a `better-sqlite3` szinkron), a hívó oldalak
      (`routes/posts.ts`, `lib/audit.ts`, `routes/statistics.ts`,
      `index.ts` időzített seprés) `await`-jei ennek megfelelően leestek.
      A `Post` (`shared/pnw/types.ts`) kapott egy `slug` mezőt — létrehozáskor
      generálva a címből (`shared/pnw/slug.ts` `uniqueSlug()`, ékezet-lebontás
      + kisbetűsítés + `-2`/`-3` ütközéskezelés), utána **változatlan** marad,
      még ha a cím szerkesztve is lesz.
    - **Valódi publikus végpont és oldal.** `server/routes/public.ts`, `/api/public`
      alatt, **`requireLogin` nélkül** — `GET /posts` (lista, `status=publish`,
      legújabb elöl) és `GET /posts/:slug`. Új `src/pages/PublishedPost.tsx`
      (kézzel írt, **nem** a 129 generált oldal egyike) a `/hirek/:slug/`
      route-on (`App.tsx`) — lekéri a posztot és a már meglévő
      `PostTemplatePreview`-n át rendereli, ugyanazzal a Header/Footer/
      Sidebar kerettel, mint bármelyik más hír. **Miért `/hirek/` és nem
      csupasz felső szintű `/:slug/`:** a React Router valójában a
      specifikusabb (statikus) route-ot részesítené előnyben egy `/:slug/`
      catch-all-lal szemben deklarálási sorrendtől függetlenül, tehát ez nem
      törne el semmit a 129 mentett route közül — de nulla biztonsági
      tartalékot ad egy elgépelt slugra, és a `/hirek/` prefix egyértelművé
      teszi "ez mentett vagy élő oldal" kérdését az URL-ből magából.
      `useDocumentHead.ts` egy no-op ágat kapott `/hirek/`-re (a
      `PublishedPost` maga állítja be a `document.title`-t, hiszen dinamikus
      adat, amit a statikus `heads` térkép nem ismerhet előre).
    - **Élő hírek a "Legutóbbi bejegyzések" widgetben és a Kezdőlapon.** Új
      `src/lib/posts/postsContext.ts` + `PostsProvider.tsx` (két külön fájlban
      — a `react-refresh/only-export-components` szabály miatt, ami nem
      engedi, hogy egy komponens-fájl más exportot is hordozzon). A
      `PostsProvider` a `Layout.tsx`-ben ül (minden route alatt, de route-váltáskor
      **nem** remountol, tehát egyszeri lekérés oldalbetöltésenként), és a
      statikus, generált `posts` térképet (`src/data/posts.ts`, **változatlan**)
      összefésüli az `/api/public/posts` válaszával. `RecentPosts.tsx`,
      `PostCard.tsx`, `PostFeed.tsx` a statikus importot lecserélték egy
      `usePosts()` hívásra. Egy élő hír linkje `/hirek/<slug>/`, nem a mentett
      minta `/${slug}/`-je — ezt a `MergedPostSummary` típus `href` mezője
      hordozza, amit `PostCard`/`RecentPosts` `post.href ?? \`/${slug}/\``
      alakban olvas.
    - **A Kezdőlap két hírfolyama** ("Kiemelt híreink", "Legfrissebb híreink")
      **generált JSX-ben** vannak (`HomePage.tsx`, `scripts/generate.ts`
      írja felül) — ott hiába a `PostsProvider`, kézzel nem lehet hozzáadni
      az élő hírek megjelenítését, mert a következő generálás némán
      visszaírná. A helyes hely a **generátor**: `PostFeed.tsx` kapott egy
      `includeLive?: boolean` propot (alapból kikapcsolva — a legtöbb
      `PostFeed` egy konkrét, lezárt témáról szól, nem "bármi, ami új"), és
      `scripts/walk.ts` blog-modul ága (~330. sor) a `dir === ''` (a home
      oldal CLI-argumentuma) esetén teszi ki. Lásd 4.18a mintáját ugyanerre a
      fájlra (fejléc-eltolás kezdőlap-specifikus ága) — ez nem az első
      oldal-specifikus különeset ebben a fájlban. Csak a Kezdőlap lett
      újragenerálva (`node scripts/generate.ts HomePage`), nem mind az 53.
      **Ellenőrzés:** `check-text.ts home` zöld **üres** (backend nélküli)
      adatbázis mellett — ekkor a `liveSlugs` üres, tehát az `includeLive`
      semmit sem told be, és a kezdőlap szövege karakterre egyezik a
      mentéssel, bizonyítva, hogy a változás tétlen, amíg nincs élő hír.
    - **A "TESZT MÓD"/"TESZTÜZEM" szövegek eltűntek** a felületről
      (`Shell.tsx`, `LoginCard.tsx`), a jóváhagyás gombja/leírása
      (`Review.tsx`) és a jóváhagyás-értesítés (`Notice.tsx`) a plugin
      production-módbeli szövegére váltott. A `published`-szerkesztő
      (`Editor.tsx`) korábban mindig csak olvasható nézetet + bannert
      mutatott (mert `TEST_MODE` mindig blokkolta) — most valódi,
      szerkeszthető űrlap `PostFields`-szel (minden kategória, mint a
      vezetői szerkesztésnél), "Módosítások mentése" és "Archiválás" gombbal.
    - **Nem változott:** az elutasítás (`pnw_revision` állapot, a szerző
      újraszerkesztheti és újraküldheti, a vezetői megjegyzés megjelenik) —
      ez a mechanizmus a `TEST_MODE`-tól függetlenül mindig ez volt.

    **Utólagos kiegészítés (ugyanaz nap): `docker compose up --build`.**
    Felhasználói kérésre — "egy paranccsal induljon minden". Egyetlen
    szolgáltatás (`docker-compose.yml` `app`), mert a `server/index.ts` már
    eddig is egy folyamatban szolgálta ki a statikus site-ot **és** az API-t
    (lásd feljebb) — nem kellett külön frontend/backend konténer.
    **2026-09-26 óta ez nem így van:** felhasználói kérésre két konténer —
    `client` (nginx a lebuildelt oldallal, `/api/` és `/uploads/` továbbítva)
    és `server` (`apps/client/Dockerfile`, `apps/server/Dockerfile`, lásd 2.).
    Az alábbi pontok (build-eszközök, kötetek, `.env`) a `server`
    konténerre továbbra is érvényesek; a kötetek útja `./apps/server/…`.

    - **`Dockerfile`**: `node:24-alpine`, `npm ci` + `npm run build` image
      build közben (nem induláskor), `CMD` a már meglévő
      `node --experimental-strip-types server/index.ts`. **Kellett hozzá
      `apk add python3 make g++`**: a `better-sqlite3` Alpine/arm64 alatt nem
      a csomagba ágyazott előre fordított binárist használta, hanem
      node-gyp-pal forrásból próbált (és build-eszközök nélkül el is bukott)
      — ez csak Dockerben derült ki, helyi macOS-en a előre fordított
      bináris simán lefutott.
    - **`.dockerignore`**: kizárja a `node_modules`/`dist`/`server/data/db`/
      `server/uploads`-t, de **nem** a 271 MB-os `public/media`-t — az kell a
      `vite build`-hez, hogy a legyártott `dist/` valódi képeket tartalmazzon.
    - **Kötetek** (`docker-compose.yml`): `./server/data/db` és
      `./server/uploads` a konténerbe mountolva, ugyanoda, ahova helyi (nem
      Docker-es) futtatásnál is kerülnének — újraindítás/újraépítés nem
      veszíti el a publikált híreket. Ellenőrizve: `docker compose down` +
      `up` után a korábban publikált teszt-hír megvolt.
    - **`PNW_SESSION_SECRET`**: `.env` fájlból jön (`.env.example` mutatja a
      formátumot), `.gitignore`-ban. Van egy fejlesztői alapérték a
      compose-fájlban, ha nincs `.env` — ahogy `server/config.ts` is mindig
      csinálta helyi futtatásnál.
    - **Ellenőrizve Playwright-tal a konténer ellen** (nem csak `curl`-lel):
      a Kezdőlap képei/CSS-e hibátlanul betöltött, majd a teljes beküldés →
      jóváhagyás → `/api/public/posts` lánc lefutott `http://localhost:4000`
      ellen, konzolhiba nélkül.

    **Utólagos kiegészítés (más nap): fiókkezelés a Hírkezelőn belül.**
    Felhasználói kérésre — eddig a `helyettes`/`igazgato`/`mk.vezeto` fiókok
    csak `server/data/seed-users.ts`-ben, hardkódolva léteztek; a valódi
    pluginban ezt wp-admin saját felhasználó-kezelője intézné, de ennek a
    repónak nincs wp-admin megfelelője. A `pnw_manage_users` capability
    (`shared/pnw/types.ts`/`roles.ts`) **új, a valódi pluginban nem létezik**
    — kifejezetten a felhasználó kérésére került be, hogy a fiókkezelés a
    Hírkezelőn belülről is elérhető legyen.

    - **Kinek jár:** akkoriban explicit felhasználói döntés alapján **mind az
      igazgatóhelyettes, mind az igazgató** kapta a `pnw_manage_users`-t.
      **6.16 óta ez fiókonként állítható** a Fiókok képernyőn — a migráció a
      két régi vezetői szerepkörnek pontosan ezt a jogot adta tovább.
    - **Tárolás:** `seed-users.ts` megszűnt, helyette valódi `users` tábla az
      SQLite-ban (`server/data/db.ts`) és `server/data/users-repo.ts` (CRUD +
      `seedInitialUsers()`, ami csak akkor tölt be 3 alap fiókot, ha a tábla
      üres — induláskor mindig meghívva, `server/index.ts`, így nem
      duplikál újraindításkor).
    - **Kezdeti jelszó:** felhasználói döntés alapján **a fiókot létrehozó
      vezető adja meg** a kezdeti jelszót (nem rendszer-generált véletlen) —
      `Users.tsx` űrlapján kötelező mező létrehozáskor, min. 8 karakter
      (`MIN_PASSWORD_LENGTH`, `server/routes/users.ts`), szerkesztésnél
      üresen hagyva a meglévő jelszó marad.
    - **Végpontok** (`server/routes/users.ts`, mind `requireCapability
      ('pnw_manage_users')` mögött, a meglévő `GET /` kivételével, ami
      bármelyik bejelentkezett fióknak lekérhető — ez adja a
      szerző-név feloldást a poszt-listákhoz és naplóhoz):
      `POST /`, `PUT /:id`, `DELETE /:id`. Két védőkorlát: **saját fiók nem
      törölhető** (`cannot_delete_self`) és **az utolsó fiókkezelésre jogosult
      fiók nem törölhető** (`last_manager` — mindig marad legalább egy, aki
      fiókokat tud kezelni).
    - **Felület:** új `src/components/hirkezelo/Users.tsx` — táblázat +
      létrehozás/szerkesztés űrlap. A szerepkör-választó és a hozzá kötött
      kategória-checkboxok 6.16 óta **jogosultság-checkboxok**; a `Shell.tsx`
      navigációjában "Fiókok" link jelenik meg, ha `canManageUsers(user)`.
    - **Ellenőrizve `curl`-lel** friss (üres) adatbázis ellen: fiók
      létrehozása → azzal bejelentkezés → jogosultság módosítása →
      törlés, illetve a negatív esetek — gyenge jelszó, foglalt
      felhasználónév, nem-vezető próbálkozása (`forbidden`), saját fiók
      törlése (`cannot_delete_self`), utolsó fiókkezelő törlése
      (`last_manager`) — mind a várt hibakóddal tért vissza. Böngészős
      Playwright-ellenőrzés ehhez a körhöz nem történt (nem állt rendelkezésre
      böngésző-automatizálási eszköz ebben a menetben).

16. **Nincsenek szerepkörök — fiókonkénti jogosultságok; a kategóriákat és
    címkéket mindenki használhatja.** Felhasználói kérés
    (2026-09-24): *"a hírkezelő usereknél ne legyenek szerepkörök, csak
    jogosultságok (pl. hír létrehozása, felhasználók kezelése stb.), és
    mindenki használhasson bármilyen kategóriát vagy címkét, sőt újakat is
    létrehozhasson, ha van rá joga."* Ez a valódi plugin `PNW_Roles`
    osztályától **szándékos eltérés** — ott három WordPress-szerepkör
    csomagolja ugyanezeket a `pnw_*` capabilityket.

    - **`shared/pnw/roles.ts` törölve**, helyette `shared/pnw/permissions.ts`.
      Nincs `Role`/`ROLE`/`ALL_ROLES`/`roleLabel`/`ROLE_CAPABILITIES`. A
      `Capability` unió a `types.ts`-ben `CAPABILITY` const lett, és minden
      segédfüggvény **a fiókot** kapja, nem egy szerepkör-stringet:
      `canSubmit(user)`, `canReview(user)`, `canManagePublished(user)`,
      `canViewAuditLog(user)`, `canManageUsers(user)`, `canManageTerms(user)`.
      A `SessionUser`/`Account` `role` mezője helyén `permissions: Capability[]`
      áll. A `pnw_manage_workflow` capability **kikerült**: a valódi plugin
      szerepkör-táblájából származott, de sosem őrzött semmit ebben a portban
      — szerepkörök nélkül egy soha nem ellenőrzött jog csak félrevezetne.
    - **Új capability: `pnw_manage_terms`** ("Kategóriák és címkék
      létrehozása"). Ez az **egyetlen** taxonómia-jog: *használni* bármelyik
      kategóriát/címkét bármelyik fiók tudja, jog nélkül is.
    - **A fejléc szerepkör-címkéje** (`roleLabel`) helyén a `permissionSummary`
      sorolja fel a fiók jogait (`Shell.tsx`).
    - **Belépési feltétel:** korábban "MK-vezető vagy vezető" kellett a
      felülethez; most **bármelyik egy jogosultság** elég (`Hirkezelo.tsx`),
      és üres jogosultság-listával a fiók be tud jelentkezni, de az
      `Unauthorized` képernyőt kapja. Az egyes nézetek külön-külön a saját
      capabilityjüket kérik, ahogy eddig is.
    - **Az áttekintő két ága** (`render_dashboard()` szerzői/vezetői ága) már
      nem a `petrik_mk_leader` szerepkört nézi, hanem a `pnw_review_news`
      jogot; a válaszmező neve ezért `role` helyett `view`
      (`server/routes/posts.ts`, `api.ts`, `Dashboard.tsx`).

    **Kategóriák és címkék (`terms` tábla).**

    - **`shared/pnw/categories.ts` törölve**, helyette `shared/pnw/seed-terms.ts`
      (`SEED_CATEGORIES`, ugyanaz a 37 kategória a `src/data/archives.ts`-ből)
      + `server/data/terms-repo.ts` + `terms` tábla. A seedelt kategória **id-je
      változatlanul az archívum-útvonala** (`/kategoria/hirek/`), tehát a
      meglévő posztok `category_ids`-e érvényes marad.
    - **A `Term` `route` mezője** csak a seedelt kategóriákon van kitöltve: a
      Hírkezelőben létrehozott kategóriának **nincs mentett archívum-oldala**,
      ezért a poszt-sablonban linkelés helyett sima szövegként jelenik meg
      (`PostTemplatePreview.tsx`, `divi/PostCard.tsx`) — nem küldünk senkit
      404-re.
    - **`Post.tagIds`** új mező (`tag_ids` oszlop). A mentésben **sehol nincs
      címke-markup** (a `post-meta` `rel="category tag"` linkjei kategóriák),
      ezért a címkék a publikus sablonba **nem** kerültek bele — kitalált
      markupot nem teszünk a portolt sablonba. A Hírkezelőn belül viszont
      látszanak: lista-sorok (`termLine`), előnézet-modal és a "Részletek"
      nézet fejléce. Ha a felhasználó publikus "Címkék:" sort kér, az egy
      tudatos új döntés lesz, nem elfelejtett feladat.
    - **Végpontok** (`server/routes/terms.ts`): `GET /api/terms` **bejelentkezés
      nélkül** (a statikus oldal is ebből oldja fel egy élő hír kategóriáit,
      ahogy a `/api/public/posts`-ot is hívja), `POST /api/terms` a
      `pnw_manage_terms` mögött (`invalid_term_name`, `term_exists` hibakódok).
    - **Kliens oldali forrás:** `src/lib/terms.ts` — modul-szintű pillanatkép +
      `useSyncExternalStore`, hogy a szerkesztőben létrehozott új kategória
      azonnal megjelenjen minden nyitott listában. **Backend nélkül is
      működik:** a kezdő pillanatkép a `SEED_CATEGORIES`, tehát a statikus
      oldal a szerver futása nélkül is valódi kategórianeveket ír ki.
    - **`PostFields.tsx`** két `TermPicker`-t renderel (kategória kötelező,
      címke opcionális), mindkettőben **minden** term látszik — a
      `PNW_Access::allowed_category_ids()` portja (`access.ts`) és az
      `allowedCategoryIds` mező **törölve** —, és `pnw_manage_terms` esetén
      egy "+ Létrehozás" sor is, ami a létrehozott termet rögtön be is
      pipálja.

    **Adatbázis-migráció** (`server/data/db.ts`, minden induláskor lefut,
    idempotens): `posts.tag_ids` hozzáadása (`DEFAULT '[]'`), `users.permissions`
    hozzáadása, a régi `users.role` értékek szétbontása capability-listára
    (`petrik_mk_leader` → `pnw_submit_news`; a két vezetői szerepkör →
    jóváhagyás + kint lévő hírek + napló + termek + fiókok), végül a `role` és
    az `allowed_category_ids` oszlop eldobása. Meglévő adatbázis tehát
    jogosultság-vesztés nélkül áll át.

    **Ellenőrzés ebben a körben:** `npx tsc -b --force`, `npx eslint .` és
    `npm run build` zöld; a `server/` TS-je külön, `--ignoreConfig`-os
    `tsc`-vel átnézve (csak a nem telepített express/better-sqlite3 típusok
    hiányából eredő zaj maradt). A migrációt **`node:sqlite`-tal futtatott
    próbával** ellenőriztem egy régi sémájú adatbázison (kétszer lefuttatva:
    a szerepkörök helyesen bomlottak capabilityvé, a régi oszlopok eltűntek,
    a `tag_ids` feltöltődött). **Amit itt nem lehetett ellenőrizni:** a
    `better-sqlite3` ezen a gépen nem fordul le (nincs Visual Studio,
    forrásból buildelne), ezért `npm run server`-t **nem** tudtam indítani.
    (Utólag, 2026-09-26: a csomag előre fordított binárist hoz, csak az
    install-szkriptje bukik el — `npm install --ignore-scripts` után fut, lásd 2.)
    A **Fiókok képernyő és a beküldés→jóváhagyás lánc átnézése továbbra is
    hátravan** — a következő körben a `:4000`-en már futott egy backend
    (nyilván konténerből), és az ellene végzett ellenőrzések rendben voltak,
    de ezt a két folyamatot senki nem kattintotta végig.

17. **A Hírkezelő 75% széles, középre igazítva — a bejelentkezés is.**
    Felhasználói kérés: *"minden bejelentkezett + a bejelentkező oldal legyen
    75% széles, középre igazítva."* A `.pnw-app` (`src/pages/Hirkezelo.css`)
    korábbi, teljes szélességű `margin:24px 0`-ja helyett `width:75%;
    margin:24px auto`. Ez a plugin saját CSS-ének **szándékos módosítása** —
    minden más `.pnw-*` szabály változatlanul a plugin sajátja.

    - **Miért a `.pnw-app`-on:** a `/hirkezelo/` minden képernyője (a
      `LoginCard`, az `Unauthorized` és az összes bejelentkezett nézet) ebben
      az egy elemben ül (`src/pages/Hirkezelo.tsx`), tehát egy szabály
      mindegyikre érvényes.
    - **A login-kártya** saját `max-width:540px`-e megmaradt: a *lap* 75%
      széles és középen van, a benne lévő űrlap a plugin eredeti méretén. Ha
      a kártyát magát is 75%-ra kell húzni, az a `.pnw-login-card`
      `max-width`-je.
    - **620px alatt 92%** (`@media` a fájl végén): telefonon a 75% ~290px-es
      tartalmat adna. Ez az egyetlen hely, ahol nem szó szerint 75% —
      tudatos döntés, nem kihagyás.
    - A bejelentkező kártya szövege már nem szerepkörökről beszél
      (`LoginCard.tsx`), ahogy 6.16 óta sehol máshol sem.

18. **Az élő hírek megjelennek a kategória-archívumokon (a "Hírek" oldalon).**
    Felhasználói hibajelzés: az újonnan publikált hír látszott az oldalsáv
    "Legutóbbi bejegyzések" listájában és a Kezdőlap két hírfolyamában, de a
    **Hírek oldalon** (`/kategoria/hirek/`, a főmenü "Hírek" pontja) nem. Oka:
    az `ArchiveView` a statikus `src/data/archives.ts` `slugs` listájából és a
    generált `posts` térképből renderelt — élő hír sosem került bele.

    - **A javítás:** az `ArchiveView` `usePosts()`-ot használ, és a
      **kategória**-archívum lista elé fűzi azokat az élő híreket, amelyeknek
      van ilyen `to`-jú kategóriájuk (`categories[].to === archive.route`),
      legfrissebb elöl.
    - **Csak az első oldalon** (a `/page/2/`-re végződő útvonalakon nem): a
      mentés lapozása és sorrendje transzkripció, nem újraszámolás (lásd
      `archives.ts` fejlécét) — ezért az élő hír a lista **elé** kerül, nem
      lapozódik bele.
    - **Dátum- és szerző-archívum kimarad:** egy élő hírnek nincs mentett
      szerzője, a dátum-archívuma pedig lehet, hogy nem is létezik a
      mentésben. Ha kell, az külön döntés.
    - **`ArchiveCard`** mostantól `MergedPostSummary`-t kap, és `post.href ??
      /${slug}/`-t linkel — ugyanaz a szabály, amit a `PostCard`/`RecentPosts`
      már követett (6.15): egy élő hír `/hirek/<slug>/` alatt él.
    - **Egységes dátumformátum:** a mentés kártyái "2025. márc 27." alakot
      írnak (az Intl pontot tesz a hónaprövidítés után, a téma nem). Ez a
      `PostTemplatePreview`-ben már meg volt oldva; mostantól
      `src/lib/postDate.ts`-ben lakik, és a `toSummary()` is ezt használja —
      különben az élő kártya "2026. szept. 24."-et írt volna a mellette lévő
      mentett kártyák "2026. szept 24."-e mellé.
    - **Ellenőrizve** egy ténylegesen futó backend ellen (a `:4000`-en ebben a
      körben már volt szerver), fejetlen Chrome-mal DOM-ot dumpolva: az élő
      hír a `/kategoria/hirek/` és a `/kategoria/vizsga/` (a másik
      kategóriája) **első** kártyája, 13 kártyával (1 élő + a mentés 12-je),
      míg a `/kategoria/hirek/page/2/` és a `/kategoria/oktatas/`
      változatlanul 12 kártya, élő hír nélkül.

19. **`/bejelentkezes/` + `/szerkeszto/`: WordPress-szerű oldalszerkesztő a
    port fölött.** Felhasználói kérés (a megvalósított v2: 6.20): egy
    közös bejelentkezés, ami után a fiók a **Hírkezelőt** vagy a
    **Szerkesztőt** választhatja; a Szerkesztőben a meglévő aloldalak
    (Nyolcadikosoknak & tsai) tartalma szerkeszthető, új, a webhelyhez
    illő oldal hozható létre/törölhető, és a főmenü szerkeszthető. Ez sem a
    mentés portja — a 6.15-ös backendre épül.

    **Két mechanizmus, egy szerkesztő.**
    - **Mentett (generált) oldal → felülírási réteg**, nem dokumentummá
      alakítás. A `src/pages/*.tsx` érintetlen marad (továbbra sem szabad
      kézzel szerkeszteni); a Divi-primitívek (`Text`, `Image`, `Button`,
      `Blurb`, `Section`) a **már meglévő `index` propjukkal** kikeresik a
      felülírást (`src/lib/site/usePageOverride.ts`), és ha van, azt
      renderelik. **Miért nem alakítottuk az oldalakat dokumentummá:** a 129
      oldal pixelhűsége (8.2) a generált markupon és a `.page-<slug>`-ra
      scope-olt, *számozott* modulokat célzó CSS-en múlik; egy konverzió ezt
      mind kockára tenné, a felülírási réteg viszont üresen bájtra azonos
      kimenetet ad. Szakasz elrejthető (`Section` → `null`), átrendezhető
      (inline `order` + `data-reordered` attribútum, és **egyetlen** szabály a
      `divi-layout.css`-ben: `.et_builder_inner_content:has(> …[data-reordered])`
      flex-oszlop — csak átrendezett oldalon illeszkedik), és új szakasz
      fűzhető az oldal alá (`PageExtras.tsx`, a `<Outlet />` után, a
      `.page-<slug>` elemen **kívül**, hogy az oldal számozott szabályai ne
      ragadjanak rá). A `<head>` címe/leírása is felülírható. Mentett oldal
      **nem törölhető** (a kódja maga a port): „Rejtés” → a `hidden` jelzővel
      404-ként szolgálódik ki (`Layout.tsx`) és kikerül a menüből
      (`useSiteMenu()`); „Eredeti visszaállítása” törli a route teljes
      felülírását.
    - **Új oldal → `PageDocument`** (`shared/pnw/page-types.ts`: szakasz →
      sor → hasáb → modul), ugyanazokon a Divi-komponenseken át renderelve
      (`src/components/pagebuilder/PageRenderer.tsx`), típusonkénti
      dokumentum-sorrendű számozással — a markup alakja tehát ugyanaz, mint
      egy generált oldalé. `/:slug/` route (`DynamicPage.tsx`) közvetlenül a
      404 előtt; a pontos route-ok ettől függetlenül nyernek. A slug a címből
      jön létre, utána nem változik; a `RESERVED_SLUGS` (minden meglévő első
      szintű route + a route-családok előtagjai) és a csupa-szám slug
      (`/2026/`… dátum-archívumok) tiltott. Törléskor a sor törlődik, a route
      404, a menübejegyzés kikerül (szerveroldalon).
    - **Új oldal kinézete — nincs kitalált CSS.** `builder-page.css`
      (`.page-builder` scope) minden deklarációja a `Nyolcadikos.css`/
      `Kozoktatas.css`-ből **másolt**, csak a szelektor szerepre cserélve
      (`.et_pb_text_0 h1` → a fejléc-szakasz `h1`-e); a forrásszabály minden
      blokk fölött meg van nevezve. A fejléc háttér-gradiense is ezeknek az
      oldalaknak a `section_0` szabálya (inline, mert a kép a szerzőé).
      A `templates.ts` kezdő dokumentumai a két oldal szakasz/sor/hasáb
      felépítését másolják, így az „Új oldal” eleve a webhelyhez illik.
      A modellbe a tervhez képest egy mező került: `PageColumn.bordered`
      (Divi `et_pb_with_border`) — a keretes kártyasorhoz kell.

    **Az index-kulcsos szerződés — ezt ne törd el.** A felülírás kulcsa
    `'<típus>:<Divi index>'` (`text:12`). Ha egy oldalt **más modulsorrenddel**
    generálsz újra, minden mentett felülírás csendben egy *másik* modulra
    kerül. Védelem: a `scripts/page-inventory.ts` (a `generate.ts` utolsó
    lépése) az indexeket **a mentés osztálynevéből** veszi (ahogy a `walk.ts`),
    és **hibával leáll**, ha a generált komponensek `index`-ei eltérnek a
    mentésétől; a szerkesztő minden modul mellett mutatja a *most* az oldalon
    lévő szöveget, így egy elcsúszás szemmel is látszik. A
    `PageRenderer` egy `OverrideScopeContext`-tel **kikapcsolja** a
    felülírás-keresést a saját (0-tól számozott) moduljaira — enélkül egy
    hozzáfűzött szakasz `text:0`-ja felvenné a generált oldal `text:0`
    felülírását.

    **A leltár (`src/data/page-inventory.ts`) generált** —
    `node --experimental-strip-types scripts/page-inventory.ts`, ne szerkeszd
    kézzel. 50 oldal (a builder/docs/poszt oldalak; a klasszikus oldalnak
    nincs Divi-fája, a két jelszóvédett docs oldal pedig csak jelzést
    renderel), 670 modul. A modul kezdő tartalmát a
    `scripts/html-to-richtext.ts` állítja elő a mentés HTML-jéből (ugyanazzal
    az URL-átírással és div-lapítással, mint az `extract.ts`). **Ami a modellel
    nem fejezhető ki hűen** (bekezdésen `font-size`, beágyazott lista, blokk
    `<blockquote>`-ban, inline szöveges `<div>`, kép/táblázat a szövegben),
    az a modul egészét **csak olvashatóvá** teszi (`lossy` ok) — jelenleg 18
    ilyen van —, nem rontjuk el csendben az első mentéskor. Csak a szerkesztő
    tölti be, lustán: a `vite.config.ts` `manualChunks`-a kiveszi a `data`
    chunkból (~215 KB saját chunk).

    **A gazdag szöveg bővült** (`shared/pnw/types.ts`, minden új mező
    opcionális, a Hírkezelő viselkedése változatlan): `TextRun.color`/
    `href`/`underline`, `RichTextBlock.level` (1–4) és `align: 'justify'`;
    `\n` egy runon belül `<br />`. A `RichText.tsx` ezeket valódi JSX-ként
    rendereli (`/media/`, `/uploads/`, `mailto:`, `tel:` link sima `<a>`,
    más belső útvonal `<Link>`). A Szerkesztő szövegmezője
    (`szerkeszto/RichTextField.tsx`) **nem** a Hírkezelő `RichTextEditor`-át
    csomagolja, ahogy a terv írta, hanem testvére ugyanazokkal a
    `pnw-rte-*` osztályokkal: az a blokkonként egy runt tart, és minden
    leütéskor az első runra írja vissza a blokkot — ez a mentésből importált
    bekezdések félkövér szavát/színes spanjét/linkjét letörölné. Itt minden
    run külön mező („+ rész” választ le új runt linkhez/színhez).

    **Jogosultság: `pnw_manage_pages`** („Oldalak szerkesztése”, 6.16
    mintájára a Fiókok képernyőn fiókonként). A seedelt `helyettes`/`igazgato`
    megkapja; meglévő adatbázisban a `pages` tábla **első** létrejöttekor egy
    egyszeri migráció mindenkinek megadja, akinek `pnw_manage_users` joga van
    (hogy legyen, aki tovább tudja adni) — utána a visszavonás tartós. Új
    segéd: `hasNewsPermission(user)` — *bármely* jog, a `pnw_manage_pages`
    kivételével. **Szándékos eltérés a tervtől:** a Hírkezelő-kártya
    (`/bejelentkezes/`) és a `/hirkezelo/` belépési feltétele ez lett, nem a
    terv `canSubmit || canReview`-ja (egy csak „Fiókok kezelése” jogú fiók is
    a Hírkezelőt használja), és egy csak-Szerkesztő fiók így nem kerül be az
    üres Hírkezelőbe.

    **Backend.** Három tábla (`server/data/db.ts`): `pages`, `page_overrides`
    (route → JSON), `site_menu` (egyetlen sor, `CHECK (id = 1)`); repók a
    `posts-repo.ts` mintájára (`pages-repo.ts`, `overrides-repo.ts`,
    `menu-repo.ts`). `server/routes/pages.ts` minden végpontja
    `requireCapability('pnw_manage_pages')` mögött: `GET/POST /api/pages`,
    `GET/PUT/DELETE /api/pages/:id`, `GET/PUT/DELETE /api/pages/overrides?route=`,
    `GET/PUT/DELETE /api/pages/menu`, `GET/POST /api/pages/media`. A feltöltés
    multer-konfigja a posztokéval közös (`server/lib/uploads.ts`, 8 MB,
    `server/uploads`, `/uploads`); egy nem-kép feltöltés ideiglenes fájlja
    most törlődik. **Validáció** (`server/lib/validation.ts`
    `sanitizePageDocument`/`sanitizePageOverrides`/`sanitizeSiteMenu`): az
    értéket **újraépíti**, nem átengedi — ismeretlen modultípus, nem-string
    tartalom, `javascript:` link, gyanús szín → az egész mentés 422. A
    `express.json` limitje 2 MB lett (egy oldal-dokumentum kinövi a 100 KB-ot).

    **Publikus oldal — egy lekérés, offline tartalék.** `GET /api/public/site`
    (bejelentkezés nélkül: publikált oldalak, minden felülírás, a menü) —
    a `SiteContentProvider` oldalbetöltésenként egyszer kéri le, a
    `PostsProvider` mintájára, a `Layout`-ban. **Hibánál üres** — ekkor
    nincs felülírás, a statikus `src/data/site.ts` menü él, az új oldalak
    404-et adnak, és minden mentett oldal pontosan a mostani. `GET
    /api/public/pages/:slug` külön is megvan. A `Header`/`TopBar` a
    `useSiteMenu()`-t olvassa (markup nem változott; a React-kulcs lett
    `címke-index`, mert egy szerkesztett menüben lehet két azonos nevű pont).
    A `useDocumentHead` kezeli a két új noindex route-ot, az új oldalak és a
    felülírt oldalak címét/leírását, és a betöltés alatt nem villantja fel a
    404-címet egy egyszintű útvonalon. (A terv szerint a `DynamicPage` maga
    állította volna a címet; egy helyen, a `useDocumentHead`-ben tisztább.)

    **Felület.** `/bejelentkezes/` (`Bejelentkezes.tsx`) és `/szerkeszto/`
    (`Szerkeszto.tsx`, `?view=list|page|new|menu|media`, `?route=`/`?id=`)
    — mindkettő `.pnw-app`, tehát 75%/620px alatt 92% (6.17), saját keret-CSS
    nélkül. A `LoginCard` címe/bevezetője/demó-jegyzete propból jön. A
    komponensek: `src/components/szerkeszto/` (`PageList`, `OverrideEditor`,
    `BuilderEditor` + `SectionsEditor` (a fa, a hozzáfűzött szakaszokhoz is),
    `ModuleEditor`, `RichTextField`, `MediaPicker`, `MenuEditor`,
    `PagePreview`, `NewPage`, `templates.ts`, `Szerkeszto.css`). Az élő
    előnézet portállal a `.pnw-app` keret **alá** renderelődik, így valódi
    szélességben és a valódi CSS-sel látszik, a keret `.pnw-app *`
    szabályai nélkül. A Hírkezelő navigációjában „Szerkesztő →” link van,
    a Szerkesztőében „Hírkezelő →”.

    **Kockázatok, amiket tudunk:** (1) az index-elcsúszás, lásd fent;
    (2) átrendezéskor az `.et_builder_inner_content` flex lesz — a margók
    flexben nem omlanak össze; a `/nyolcadikos/`-on mérve (természetes
    sorrend flexben vs. blokkban, 1440/980/500px) egyetlen szakasz sem mozdult,
    de más oldalt nem mértünk — ha valahol mégis eltol, a visszaút a „csak
    elrejtés” (a `sectionOrder` kihagyása); (3) a leltár konverziója a fenti
    esetekben szándékosan csak-olvasható.

    **Ellenőrzés (2026-09-25, Windows-gép).** `tsc -b`, `eslint .`,
    `vite build`, `check-routes.ts` zöld. **`check-text.ts`: 129/129 oldal
    azonos szöveg**, futó backenddel, üres adatbázissal — ez a Divi-primitívek
    módosításának regressziós tesztje. **`check-head.ts`: 129/129.** (Mindkettő
    darabokban futott, lásd 7.15.) A `better-sqlite3` ezen a gépen sem
    fordul, ezért a helyi backend egy **teszt-shimmel** futott (`node:sqlite`
    a `better-sqlite3` helyén, a scratch könyvtárban, nem a repóban) — a valódi
    `better-sqlite3`-at a **Docker-image** tesztelte: `docker build` zöld, a
    konténer friss kötetben létrehozza a három új táblát, a létrehozás/
    frissítés/felülírás/menü/törlés végpontok válaszolnak, és a felhasználó
    valódi adatbázisának **másolatán** az egyszeri migráció a `helyettes`/
    `igazgato` fiókot kiegészítette, az `mk.vezeto`-t nem. Fejetlen Chrome-mal
    (CDP) végigvitt folyamat, 30/30 zöld: a két kártya jogosultság szerint;
    `mk.vezeto` a `/szerkeszto/`-n `Unauthorized`; 75% középen 1440px-en és
    92% 500px-en; szövegszerkesztés a felületen át → a publikus oldalon
    megjelenik, a szakaszgeometria változatlan; elrejtés + átrendezés +
    hozzáfűzés a publikus oldalon; „Eredeti visszaállítása” után a geometria
    és a szöveg bájtra a korábbi; új oldal sablonból → élő előnézet →
    közzététel → Oktatás-menübe téve → desktop és mobil menüben is ott,
    `/nyilt-nap-2026/`, helyes `<title>`, a fejléc `h1`-e Poppins 60px;
    törlés után 404 és a menüből is kikerül; kép-feltöltés `/uploads/`-ból
    `image/png`-ként szolgálva; „Rejtés” egy mentett oldalon → 404 + nincs a
    menüben. Leállított backenddel minden oldal renderel, a statikus menü
    látszik, az új oldal 404, konzolhiba csak a várt, elbukó API-kérés.
    **Nem ellenőrizve:** `docker compose up` a valódi, mountolt
    adatbázissal (szándékosan — az első indulás migrálja), és kézi,
    egérrel végigkattintott használat a menüszerkesztőben (az API-ját a
    teszt hívta, a felületét nem).

### 6.20 Szerkesztő v2 — minden oldal dokumentum, teljesen átírható

**Döntés (felhasználó, 2026-09-26): az egész oldal átírható és létrehozható.**
Ez a 6.19 „sorok szerkesztése” megoldását váltja le, és az 1. pont „pixelpontos”
célját *csak a szerkesztett oldalakra* fordítja meg: **pixelpontosság csak a
még nem szerkesztett oldalra garantált**; aki szerkeszt egy oldalt, annak a
kinézete az ő döntése. A 6.19 többi része (jogosultság, `/bejelentkezes/`,
menüszerkesztő, médiatár, kép-feltöltés) érvényben maradt.

**Mi változott.**
- Az 53 generált oldal (25 builder, 27 docs, 1 poszt, 1 classic) már nem
  `.tsx`: **`src/data/pages/<Komponens>.json`** (`PageDocument`) + `.css` (az
  oldal Divi-stíluslapja, scope-osztály alatt) + a `index.ts` registry
  (`pageDefaults`, route → alapértelmezett dokumentum). A `.tsx`-ek törölve.
  Nem dokumentum: a 64 archívum, `/dokumentumtar/`, a taxonómiák, `/kereses/`,
  `/hirek/:slug/` (adatnézetek).
- Egy renderer: `PageRenderer` rajzol minden `template`-et (`builder` /
  `docs` / `post` / `classic`) ugyanazokkal a Divi-komponensekkel, mint a
  generált oldalak. Útvonal: `App.tsx` a registry-ből, `pages/DocumentPage.tsx`:
  szerkesztett dokumentum, ha van; tombstone → 404; különben az alapértelmezett.
  `key={route}` kell rajta: a node-id-k (`m0`) oldalak közt ismétlődnek, és
  nélküle a Toggle/HeroSlider állapota átlógna a következő oldalra.
- **A generálás:** `walk.ts` továbbra is az egyetlen hely, ami a mirrort olvassa;
  a kimenetét (TSX-forrás) a `tsx-to-document.ts` (TypeScript-AST) alakítja
  dokumentummá memóriában, így nem tud eltérni. `generate.ts` → `src/data/pages/`
  + `shared/pnw/mirror-routes.ts`. Szigorú: ismeretlen elem/prop/stílus hiba.
  **`MIRROR_ROOT` most `PETRIK_MIRROR` env-ből jön.** (Ezen a gépen a mirror
  nincs meg: a konverzió a meglévő TSX-ből ment; a `generate.ts` mirrorral még
  nincs kipróbálva — fusson utána `render-pages.ts check`, vagy ha a mirror
  tényleg változott, nézd át a diffet és `render-pages.ts baseline`.)
- **Rich text v2** (`shared/pnw/rich-content.ts`): a tárolt forma **hű HTML-fa**
  (`RichNode` = szöveg vagy `{tag, style?, href?, children?}`), nem blokk+run.
  Ok: a mirror `<strong><a>` és `<a><strong>` sorrendet, két egyforma szomszédos
  `<a>`-t és üres elemet is tartalmaz — ezt a lapos run-modell nem tudja bájtra
  visszaadni. A szerkesztő egy lapított nézeten (`richToBlocks`/`blocksToRich`,
  blokkok+run-ok) dolgozik, és csak az szerkesztett mező fája íródik újra.
  Stílus-whitelist: `color, fontSize, fontFamily, fontWeight, letterSpacing,
  textTransform, textAlign, lineHeight` (`RICH_STYLE_PATTERNS`, a szerver és a
  szerkesztő közös). A `<a>` típusa a célból dől el (http → új lap; `/media/`,
  `//`, `mailto:`, `tel:` → sima `<a>`; más `/…` → router-`Link`).
- **Modulok:** a v1 hét + `post-feed, team-member, social-follow,
  number-counter, testimonial, pricing-tables, hero-slider, gallery,
  fullwidth-header, file-block`. `PageModule` mezői pontosan azok a propok,
  amiket a walker írt.
- **A Divi `index` szerződése:** csak azt dönti el, melyik számozott osztályt
  viseli a csomópont (`et_pb_text_12`) — ezt célozza az oldal stíluslapja. Egy
  átvett modul **a helyén tartja az eredeti indexét**, bárhová kerül; az új
  modul `max(a fajta indexei)+1`-et kap (`allocator`, `nextIndex`), így nem
  ütközhet egy másik modulnak szánt szabállyal. A v1-es dokumentumok index
  nélkül jöttek; `normalizeDocument` a hiányzót dokumentumsorrendben pótolja
  (pont azt a számozást adja, amivel a v1 renderelt), a `bordered`-et
  `et_pb_with_border` osztállyá, a blokk-tartalmat fává alakítja.
- **Design-beállítások** (`design` szakaszon/soron/hasábon/modulon): szín,
  háttér, betűméret/-vastagság, igazítás, térközök, keret — számok tartományban,
  `isSafeColor`-os színek, enumok, soha nyers CSS. A mirror stíluslapjai szinte
  mindent `!important`-tal írnak, ezért **egy generált `<style>`** (`lib/
  designCss.ts`) szabályai `.scope.scope .et_pb_text_12 { … !important }`
  alakúak (a scope-osztály kétszer: egyenlő specificitásnál is nyer). React
  szöveg-gyerekként épül, `dangerouslySetInnerHTML` nincs. Tervezetlen
  design → nincs `<style>` elem, az oldal markupja a régi. Böngészőben
  ellenőrizve: az `!important`-os oldalszabályt a beállítás veri.
- **Tárolás/API:** a `pages` tábla `route`-kulcsú (`origin` mirror|custom,
  `template`, `deleted`, `slug` csak a létrehozott oldalnál). Indításkor a v1
  tábla magától átépül. `GET /api/pages` (lista, dokumentum nélkül),
  `GET/PUT/DELETE /api/pages/by-route?route=` (szerkesztés / **tombstone**),
  `POST …/by-route/reset` (vissza az eredetire), `/:id` a létrehozott oldalaké.
  A route-nak szerepelnie kell a `shared/pnw/mirror-routes.ts`-ben, és a
  `template`/`docsSlug`/poszt-slug egyeznie kell (különben az invented slug
  összeomlasztaná a `DocsLayout`/`PostHeader` kereső-throw-ját).
  `/api/public/site`: publikált szerkesztések + tombstone-ok (az alapértelmezettet
  a kliens tudja). Backend nélkül minden oldal az alapértelmezett. A
  `PNW_DATA_DIR`/`PNW_UPLOADS_DIR` env scratch-adatbázishoz.
- **Szerkesztő:** minden oldal ugyanabban a fa-szerkesztőben (`PageEditor`)
  nyílik; *Eredeti / Szerkesztve / Törölve / Új* állapot; Szerkesztés, Törlés
  (mirrored: tombstone → 404 + kikerül a menüből), Visszaállítás az eredetire.
  Fa: húzással (⠿) és nyilakkal átrendezhető szakasz/sor/modul, modul bármely
  hasábba áthúzható, sor hasábjai (preset + hasábonkénti szélesség, `+ hasáb`),
  design-panel mindenen, minden új modulfajtához szerkesztő, hír-lista
  „feltöltés kategóriából”, `RichTextField` v2 (h1–h6, div, sima szöveg,
  beágyazott lista, méret/betű/betűköz/NAGYBETŰS, hatókör: szövegrész/
  bekezdés). Az élő előnézet minden oldalon a valódi `PageRenderer`.
  Az eltávolított réteg: `PageOverrides`/`usePageOverride`/`PageExtras`/
  `OverrideEditor`/`page-inventory`/`html-to-richtext`/`data-reordered`.
- **Migráció** (`migrate-overrides.ts <db> [--write]`): minden `page_overrides`
  sor → az oldal alapértelmezett dokumentuma + modulfelülírások (kind+index) +
  elrejtett szakaszok kihagyva + `sectionOrder` + hozzáfűzött szakaszok (új
  indexekkel) + cím/leírás; `hidden` → tombstone. A szerver validátorán megy át;
  sikeres `--write` után a `page_overrides` eldobva. A hozzáfűzött szakaszok
  innentől az oldal saját scope-ja alatt renderelnek (nem `page-builder`).

**A kapu (a „pixelpontos újra” bizonyítéka).** Az 53 oldal eredeti, TSX-ből
renderelt HTML-jének SHA-256-ja `scripts/render-baseline.json`-ban. `node
--experimental-strip-types scripts/render-pages.ts check` (Vite SSR +
`renderToStaticMarkup`, böngésző nélkül) az alapértelmezett dokumentumokat
renderelve **53/53 bájtra azonos** (a TSX törlése előtt a teljes HTML-t is
összevetettük, `snapshot`/`compare`). Divi-primitív vagy renderer módosítása
után ezt kell futtatni; csak szándékos változásnál `baseline`.

**Ellenőrzés (2026-10-01, macOS).** `tsc -b`, `vite build`, `eslint .`,
`check-routes.ts`, `render-pages.ts check` (53/53) zöld; az 53 alapértelmezett
dokumentum a szerver validátorán veszteség nélkül átmegy (egyetlen különbség: a
docs `file-block` kap egy `index`-et). Szerver `better-sqlite3`-mal, scratch
adatbázison: a v1 `pages` átépül, a migráció (szöveg-felülírás, elrejtett +
átrendezett + hozzáfűzött szakasz, elrejtett oldal) lefut, a publikus API a
várt dokumentumot adja. Fejetlen Chrome-mal (CDP): szerkesztett oldal a helyes
szakaszsorrenddel és `<title>`-lel; törölt oldal 404 és nincs a menüben; v1-es
létrehozott oldal renderel; a szerkesztő listája 54 sor, a banner látszik;
szövegszerkesztés → élő előnézet; 3→2 hasáb a modulok megtartásával; modul
áthúzása másik hasábba (a modul megtartja az indexét); design-szín az
`!important`-os szabály fölött; mentés → publikus oldal; visszaállítás → az
eredeti. **Nem ellenőrizve:** `check-text`/`check-head`/`measure` (nincs mirror
ezen a gépen); `generate.ts` mirrorral; `docker compose up`; a Szerkesztő
összes új modulszerkesztője egyenként egérrel (a fa, a rich-text és a design
volt végigvíve); `deploy.ps1`.

**Kockázatok:** a szerkesztett oldal eltér a mirrortól (szándékos, 8.2 mérései
rá nem érvényesek); egy áthelyezett modul indexalapú osztályai az új környezetben
nem feltétlenül illenek az oldal szabályaihoz (a design-panel a megoldás, nem új
CSS); a szerkesztett oldal első betöltéskor egy pillanatra az alapértelmezettet
mutatja (a `/api/public/site` fetch után cserélődik — ugyanúgy, mint a v1-es
felülírásoknál).

### 6.21 Hírkezelő: hírsablonok, kép helye, „Megtekintés publikáltként”

(Felhasználói kérés, 2026-10-01; az eredeti plugin: merenyimiklos/petrik-news-workflow.)
- **Hírsablonok:** az eredeti plugin `pnw-ux.js` 5 sablonja (Versenyeredmény,
  Esemény/rendezvény, Tájékoztató, Kirándulás/programbeszámoló, Pályázat/felhívás)
  `shared/pnw/news-templates.ts`-ben, blokkokként (h3 + bekezdés + lista). A
  `PostFields` tetején választható az új hír szerkesztőjében (a közzétett hír
  szerkesztőjében és a vezetői ellenőrzésen nincs); jelenlegi szöveg esetén
  megerősítést kér, és felajánlja a címkezdetet — mint az eredeti.
- **A kép helye:** `Post.imagePosition` (`top` | `bottom`, alap `top`), új
  `image_position` oszlop (indításkor ALTER), a szerző, a vezetői szerkesztés és
  a közzétett hír szerkesztője is állítja; `PostTemplatePreview` a szöveg felett
  vagy alatt rajzolja a képet — ugyanez a közzétett oldalon és minden előnézetben.
- **„Megtekintés publikáltként ↗”** a jóváhagyó oldalon: új lapon nyitja a
  `/hirkezelo/elonezet/:id/`-t (`PostPreviewPage`) — a legutóbb mentett hír a
  valódi egyhír-oldalon, fejléc/lábléc/oldalsáv, `noindex`, bejelentkezés kell
  (`GET /api/posts/:id` ellenőriz). A mentetlen vezetői módosításokat nem látja.
- Ellenőrizve fejetlen Chrome-mal, scratch adatbázison: kép alul → az `IMG` a
  szöveg után; a gomb `target=_blank`; sablon alkalmazása 9 blokkot ad; a
  jóváhagyó oldalon a rádió a mentett értéket mutatja. `PNW_API` env a Vite
  proxyhoz (ha a 4000-es porton más szerver — pl. Docker — fut).

### 6.22 Szerkesztő: WordPress-szerű elrendezés és működés

(Felhasználói kérés, 2026-10-01: az ügyfél WordPresshez szokott, ne legyen nehezebb. A felső navigáció marad.)
- **Oldalak listája** = „Összes oldal”: állapot-fülek számlálóval (*Mind · Közzétéve ·
  Piszkozat · Szerkesztve · Kuka*), keresés, tömeges művelet, rendezhető oszlopok,
  20/oldal lapozás, a sor műveletei a cím alatt, ráhúzásra/fókuszra (`.szk-row-actions-hover`).
- **Kuka** kétlépcsős törlés: a létrehozott oldal első `DELETE`-re `deleted=1`
  (a dokumentum megmarad, 404, kikerül a menüből), `POST /api/pages/:id/restore`
  piszkozatként visszahozza, a kukában lévő oldal második `DELETE`-je végleges. A
  mirrored oldalnál a kuka a tombstone, a visszaállítás a `reset`. A `/api/public/site`
  a kukás oldal dokumentumát nem küldi.
- **Szerkesztő:** bal oldalt nagy címmező + tartalom-fa, jobb oldalt *Közzététel*
  (állapot, mentés állapota, Vissza/Újra, élő előnézet, Megtekintés, Mentés/Frissítés),
  *Oldal* (cím a webhelyen, meta description) és a Kuka/Visszaállítás. Ctrl/Cmd+S ment;
  Ctrl/Cmd+Z / +Shift+Z (Ctrl+Y) az egész oldalt vonja vissza (beviteli mezőben a
  böngészőé marad; 700 ms-on belüli módosítások egy lépés). Nem mentett váltásnál
  figyelmeztet. Szakasz/sor/modul **megkettőzhető** (⧉: új id + új Divi-index).
- **Nem csináltuk:** automatikus piszkozatmentés, külön „elem” oldalsáv (a beállítások
  a fában maradnak), menü- és médiatár-átrendezés.
- Ellenőrizve fejetlen Chrome-mal, scratch adatbázison: fülek/számlálók, kukába és
  vissza, kereső, megkettőzés (egyedi index), vissza/ismétlés, Ctrl+S, kétoszlopos rács.

### 6.23 Táblázat a Hírkezelőben; szerkesztés párbeszédablakban a Szerkesztőben

(Felhasználói kérés, 2026-10-01.)
- **Táblázat a hírben:** új blokktípus `table` (`RichTextBlock.table = { header, rows: string[][] }`,
  a `runs` egyetlen üres run marad). Az eszköztár „▦” gombja 3×3-as, fejlécsoros táblát
  szúr be az aktív blokk után; a rács celláinak szerkesztése, + / − sor, + / − oszlop,
  „Fejlécsor” kapcsoló (a szerkezeti változás visszavonható, a cellagépelés a mező
  saját undo-ja). A cella sima szöveg — markup nem fér bele. A `RichText` `<table
  class="pnw-news-table">`-t rajzol (`thead` ha van fejléc); a `blockText` a cellákat
  adja, így a csak-táblázat hír is „van szövege”. A szerver `parseRichText` a tábla
  alakját ellenőrzi (≤100 sor, ≤30 oszlop, szöveg-cellák ≤2000 karakter).
- **Szerkesztés dialógusban:** minden modul, valamint a szakasz/sor/hasáb beállításai
  (és design-panelje) natív `<dialog>`-ban (`Modal.tsx`, `showModal()`) nyílik: legfelső
  réteg, fókuszcsapda, Esc/háttérkattintás/„Kész” zár, a háttér nem görgethető. A
  módosítások azonnal érvényesek (a fa állapota az igazság), nincs „mégse”. A fában a
  modul sora csak összefoglaló marad.
- Ellenőrizve fejetlen Chrome-mal, scratch adatbázison: tábla beszúrása, oszlop hozzáadása,
  cellák kitöltése → előnézet és a közzétett oldal sablonja `thead` + sorok; beküldés
  csak-táblázatos hírrel sikerült; a modul-dialógus megnyílik (RichText + design), Esc zárja,
  a szakasz beállításai is dialógusban.

### 6.24 A régi hírek importja a Hírkezelőbe

(Felhasználói kérés és döntés, 2026-10-04: „a még át nem alakított híreket rakd
be az oldalra, linkelve, mint az eredetin” — a Hírkezelő adatbázisába, nem
statikus oldalként.)
- **Import:** `apps/server/scripts/import-mirror-posts.ts`
  (`PETRIK_MIRROR=… npm run import-posts -w apps/server`; `PNW_DATA_DIR` /
  `PNW_UPLOADS_DIR` scratch-futtatáshoz). A mentés minden `body.single-post`
  oldala — a korábban statikus mintaposzt is (a `SAMPLE_POST_SLUG` konstans és
  a `KutatokEjszakaja` registry-oldal megszűnt; a `render-baseline.json` 52
  oldalas, a kártyák linkjei miatt újra lett véve, a különbség `compare`-rel
  ellenőrizve csak a linkek). **Idempotens** (meglévő slug kimarad).
  A Divi-hírek moduljai olvasási sorrendben lapítódnak (Text, Image, Gallery,
  Button → link-bekezdés, Blurb/Toggle → címsor + szöveg, TeamMember,
  Testimonial, Video/Code-iframe → embed, Countdown → bekezdés a dátummal),
  a Gutenberg-hírek blokkjai közvetlenül. Amit nem tud egy az egyben
  leképezni, a végén hírenként kiírja; jelenleg: 2 Venngage-script (jegyzet
  marad), 3 ThingLink-script (a kép megmarad), 1 helyi mp4 (link), 1 üres
  videómodul (a mentésben is üres), 5 db 40 MB-os galéria-original (a
  nagyítás linkje elmarad).
- **Mező-források:** cím a `.entry-title`, dátum a téma `.published` szövegéből
  (budapesti dél + a WP post-id másodpercben, hogy az egy napon belüli sorrend
  megmaradjon), kategória a `.post-meta` linkjeiből a `terms.route` alapján,
  kivonat a `src/data/posts.ts`-ből (ahol nincs: az első 55 szó). **Nincs
  `featuredImage`** — az eredeti egyposzt-oldal sem mutatott kiemelt képet, a
  kép a tartalomban van. A szerző az 5 eredeti név, mindegyik egy
  **jogosultság nélküli** fiók (`regi.*`, véletlen jelszó).
- **Képek:** `uploads/mirror/<wp-útvonal>` alá másolódnak (~300 MB). A tartalomkép
  a srcset legkisebb ≥1024px-es változata, a nagyítás-link is ilyen változatra
  mutat (a `-scaled` originalok miatt 950 MB lett volna); 10 MB fölötti
  nagyítás-cél nem másolódik. A crawler néhány nevet Windows-1252 mojibake-kel
  mentett (`â€“`) — a szkript ezt az alakot is keresi.
- **Modell:** új `BlockType`-ok: `image`, `gallery`, `embed` (a `table` mintájára,
  saját mezővel). Az embed csak https és `EMBED_HOSTS`-listás host
  (`shared/pnw/types.ts`); a szerver `parseRichText` újraépíti a mezőket. A
  `RichText` WordPress-markupot rajzol (`figure.wp-block-image`, galéria), a
  CSS a mentés block-library szabályaiból (`RichText.css`). A szerkesztő ezeket
  **megtartja, de nem szerkeszti** (előnézet + törlés), és a többrunos
  (linkes, félkövér részes) bekezdésnél a gépelést a meglévő runok közé
  illeszti (`editRuns`), nem lapítja egy runná.
- **`posts.origin`** (`'hirkezelo' | 'mirror'`, db-migráció): a `GET
  /api/public/posts` csak a Hírkezelőben írt híreket adja (különben a 20
  „legfrissebb élő hír” a mentés listáit duplikálná); az új `GET
  /api/public/posts/hidden-mirror` a nem publikus importált slugokat, ezeket a
  `PostsProvider` kiveszi a `posts` mapből → archiválva eltűnnek a listákból.
- **URL:** a `/:slug/` ág (`DocumentPage`) ismeretlen slugnál `PublishedPost`-ot
  renderel (ez kér a szervertől, és maga mutatja a 404-et); a `useDocumentHead`
  ilyenkor a címet a `PublishedPost`-ra hagyja. A `/hirek/<slug>/` is működik.
  A `scripts/posts.ts` `available: true`-t ad minden olyan összefoglalónak,
  amelyhez van oldal a mentésben (209; 7 importált hír egyik listában sem
  szerepel, ezek csak URL-ről érhetők el).
- **Szándékos eltérés:** ezek a hírek a Hírkezelő sablonjával renderelődnek
  (`PostTemplatePreview`), nem a Divi-fa pixelpontos portjaként — a
  többhasábos Divi-sorok egy hasábba lapulnak.
- Ellenőrizve: scratch adatbázison import (215/0 hiba), második futás 0;
  fejetlen Chrome: Divi-hír, Gutenberg galériás + YouTube-os hír, kategória-
  archívum linkelő kártyái; API-n archiválás → `hidden-mirror` + 404,
  visszaállítás; publikált hír mentése megtartja a galériát.

---

### 6.24 Szerkesztő: Dokumentumtár (`?view=library`)

A `/dokumentumtar/`, a docs-oldalsáv, a kategória-oldalak és a docs-keresés
listái a **`useDocCategories()`** (`lib/site/docLibrary.ts`) kategóriáiból
épülnek: a mentett könyvtár, ha van, különben a `src/data/docs.ts`. Tárolás: a
`site_library` tábla egyetlen sora (mint a menünél), `GET/PUT/DELETE
/api/pages/library`, a publikus `/api/public/site`
`library` mezője. Dokumentum-feltöltés: `POST /api/pages/library/file`
(pdf/Office/OpenDocument/txt/csv/zip, 9 MB — az nginx 10 MB-ja alatt), a fájl
olvasható névvel az `UPLOADS_DIR`-be kerül.
Egy bejegyzés `{slug, title, file?}`: **fájllal** a lista közvetlenül a fájlra
linkel (új lapon), **fájl nélkül** a mirror `/docs/<slug>/` oldalára. „Csere” =
új fájl a bejegyzésre (a régi oldal helyett). **Nem változik**: a mirror
`/docs/<slug>/` oldalai, azok breadcrumbja/előző-következő linkje és a címkék
(`docTags`) — ezek továbbra is a statikus `docs.ts`-ből jönnek; egy törölt
dokumentum oldala tehát elérhető marad a címén, csak a listákból kerül ki.
**Jog: `pnw_manage_library`** („Dokumentumtár kezelése”), külön a
`pnw_manage_pages`-től: a `routes/library.ts` az `/api/pages` *elé* van
felcsatolva (különben annak router-szintű `MANAGE_PAGES`-ellenőrzése
kizárná), a Szerkesztő bármelyik jogosultsággal megnyílik (`canUseEditor`), de
csak a megfelelő menüpontok látszanak. A `hasNewsPermission` mindkettőt
figyelmen kívül hagyja. Az első indításkor (`site_library` tábla még nincs)
mindenki megkapja, akinek már van `MANAGE_PAGES`; a seedelt fiókok közül az
igazgató/helyettes is. Feltöltött, de nem mentett fájl árván marad az `uploads/`-ban.

### 6.25 A média az adatbázisban van (nem a gitben, nem az image-ben)

Döntés (felhasználó, 2026-10-22): a `apps/client/public/media` (271 MB) és
minden feltöltés a SQLite `media_files` táblában él (`server/data/media-repo.ts`,
BLOB, kulcs: az NFC-normalizált URL-út). A repó (`git rm --cached` + `.gitignore`)
és mindkét Docker image média nélküli; a `.git` mérete a régi történet miatt
nem csökkent (a history átírása szándékosan elmaradt).
- **Kiszolgálás:** `lib/media.ts` `mediaRouter` — `/media/*` és `/uploads/*` a
  szerverből (ETag/304, `Cache-Control`, nem-képeknél `sandbox` CSP), az nginx
  mindkettőt a szerverre proxyzza, a vite dev-szerver is (`/media` a
  `vite.config.ts`-ben → a szervernek futnia kell).
- **Feltöltés:** multer `memoryStorage`, a bájtok közvetlenül az adatbázisba
  kerülnek (`storeImage`/`storeDocument`), lemezre semmi.
- **Betöltés (seed):** induláskor `importDirectory` bemásolja az `UPLOADS_DIR`
  (régi telepítések feltöltései, `/uploads/…`) és a `MEDIA_SEED_DIR`
  (`PNW_MEDIA_SEED_DIR`, alapból `apps/client/public/media`, `/media/…`) fájljait,
  amik még nincsenek benne (INSERT OR IGNORE; újraindításkor csak stat + index).
  Dockerben a compose `./apps/client/public/media`-t `/seed-media`-ként
  csatolja; a szerverre `deploy.ps1 -WithMedia` viszi fel (egyszer).
- **Csapdák:** (1) macOS NFD-ben adja a fájlnevet, a böngésző NFC-t kér — a
  kulcs ezért NFC. (2) Friss klónban nincs média (nincs a gitben): a
  `public/media`-t egy mentésből kell visszatenni, különben a szerver üres
  táblával indul és a képek 404-ek. (3) A `public/media` hiányzó 4 hivatkozása
  (pl. `2020/08/ebook-13.png`) már a mirrorban sem volt meg.
- **Hírkártyák képe:** a Hírkezelőbe importált (mirror) hírekhez nincs
  `featuredImage`; `postsContext.ts` `thumbnailFor`: featured → a statikus
  poszt azonos slugú miniatűrje → a cikk első képe.

## 7. Csapdák, amikbe már belefutottunk

1. **Bash heredoc megeszi a backslash-t.** Nagy fájlt Write-tal írj, ne
   heredockal; regexben kerüld a backslash-t, ha teheted.
2. **JSX string-attribútum nem dolgoz fel escape-et** — a `walk.ts` `attr()`
   helpere ezért expression-konténerbe teszi az ilyen értékeket.
3. **Az oldalankénti Divi design-CSS ütközik**, ha a scope a formázás előtt
   vagy a külső ősök elé kerül (lásd 4.3).
4. **A mentés DOM-sorrendje már oszlopokra van osztva** a blog-listákban
   (Salvattore) — az eredeti sorrend az `et_pb_blog_item_<feed>_<n>`
   osztályban van.
5. **A React nem ad ki whitespace-t a mappelt gyerekek között** — lásd a
   `{' '}`-eket a `Header.tsx`-ben és az `extract.ts` automatikus
   kibocsátását (4.5).
6. **Ne találj ki CSS-szabályt** — eszköz van rá: `matched-css.ts` (3.3).
7. **A Chrome ~500px alatt nem enged kisebb ablakot**
   (`Emulation.setDeviceMetricsOverride`).
8. **Ne futtass két ellenőrzést egyszerre** — lásd a 3. szakasz elején.
9. **A CDP csak az épp érvényes szabályokat adja vissza** — egy `@media`-n
   belüli szabály láthatatlan, ha a viewport nincs benne. A `docs-css.ts`
   ezért hat szélességen jár be minden oldalt.
10. **A stíluslap-ID-k oldalbetöltésenként változnak** — kaszkád-sorrendhez
    ne saját rangsort építs, a CDP elemenként már kaszkád-sorrendben adja
    vissza a szabályokat.
11. **A mentés HTML-je mindkét idézőjelet használja** (`name='robots'`
    egyszeres, `rel="canonical"` dupla, ugyanabban a fájlban) — attribútumot
    regexszel olvasva `["']`-t írj. Lásd 4.23.
12. **Ne bízz a regexben, ami "megtalálta" — nézd meg a darabszámot.** A
    robots-regex hibátlanul lefutott, mégis 129 helyett 25 oldalon talált. A
    generátorok ezért írják ki, hányból hányat dolgoztak fel.
13. **A `python - <<'PY'` heredocban a `\s`/`\.` figyelmeztetést ad**, és a
    backslash-ek száma TS-forrásba írva nem lesz, amit vársz — regexet
    tartalmazó kódot Write/Edit eszközzel írj.
14. **A `better-sqlite3` Alpine (Docker) alatt nem feltétlenül a saját előre
    fordított binárisát használja** — arm64 Alpine-on node-gyp-pal próbált
    forrásból fordítani, és build-eszközök (`python3 make g++`) nélkül
    elbukott, holott helyi macOS-en (ugyanaz a csomagverzió) simán a
    prebuilt binárist töltötte be. Ha egy natív npm-csomag helyben működik,
    de Dockerben nem, ez legyen az első gyanú — nem feltétlenül a kód hibája.
15. **A `check-text.ts`/`check-head.ts` egy hosszú futás közepén némán
    megakadhat** (ezen a Windows-gépen ~80 oldal után, mindkettő ugyanott):
    a böngésző 0% CPU-n áll, a szkript időkorlát nélkül vár egy be nem
    fejeződő oldalbetöltésre, kimenet nincs. Nem egy konkrét oldal hibája —
    friss böngészővel ugyanaz az oldal átment. Megoldás: darabokban futtatni
    (a `check-text.ts` elfogad oldal-könyvtárneveket; a `check-head.ts`
    nem, annak egy ideiglenes, szeletelő másolata kellett), és ne
    `| tail`-lel figyeld, mert akkor semmit sem látsz, amíg be nem fejeződik.
    Ugyanitt: az első oldalon (`home`) egyszer a *mentés* oldala adott 0
    karaktert — egyedül újrafuttatva `ok`.

---

## 8. Hátralévő munka és pixelpontosság

### 8.1 Lefedettség — mi NINCS portolva

A mentésben 345 oldal van, ebből **129 portolva**:

| Nincs portolva | Db | Miért |
|---|---|---|
| Blogposzt | 216 | Nem generált oldal, hanem Hírkezelő-import (6.24) — elérhető, de nem pixelpontos port |

`/hirkezelo/` **nincs ebben a táblázatban**: az korábban ide tartozott (a
mentés bejelentkező űrlapja, backend nélkül), de felhasználói kérésre
lecserélődött egy valódi, működő újraimplementációra — lásd 6.15.

### 8.2 Pixelpontosság — hol tart

Mért állapot 1440px-en, szűk szelektorral (`measure.ts`), nem az
összesítőből:

| Mit | Állapot |
|---|---|
| Kezdőlap: mind a 8 szekció, galéria, gombok, számlálók, blog-kártyák, `HeroSlider` | **0,0px** |
| Klasszikus oldal: `#left-area`, cikk, oldalsáv | **0,0px** |
| 64 archívum: teljes `#left-area` oszlop, kártyák, lapozó | **0,0px** |
| Docs: breadcrumb, fejléc, tartalom, reakció-lábléc, prev/next | **0,0px** |
| Tanári portrék, poszt fejléc/Divi-sor/megosztás-sáv, `/dokumentumtar/` első sor | **0,0px** |
| Hero-szekciók (18 oldal): háttérkép, címszín, magasság | egyezik (6.1 szerinti 116px szekciódoboz-eltéréssel) |
| Fejléc, főmenü, lenyílók, nyugalomban és görgetve | **0,0px** (desktop; mobil 2026-09-24 óta nincs újramérve, lásd "Aktuális állapot") |

Mindenhol jelen van a 6.1 szerinti konstans **-1px** függőleges eltolás, és a
builder-oldalakon a `section_0` doboz **116px**-es, vállalt eltérése.

**Még nyitott:** a maradék 128 (nem kezdőlap/klasszikus/docs/archívum) oldal
szekciónkénti végigmérése.

**Nem javítható a mentésből:** az "Örökös Ökoiskola" logó a kezdőlapról
hiányzik — de a mentésből is (`et_pb_image_8`/`_9` CSS-e és animációs adata
megvan, markupja és képfájlja nincs). A port pontosan azt mutatja, amit a
mentés.

#### Módszer: hogyan keress ilyet

Ha egy doboz mérete eltér és a nyilvánvaló tulajdonságok egyeznek, **ne
találgass** — diffeld az összes számított tulajdonságot:

```js
// getComputedStyle(el) iterálható: minden tulajdonság nevét kiadja
const s = getComputedStyle(el); const out = []
for (const p of s) out.push(p + ': ' + s.getPropertyValue(p))
```

Futtasd mindkét oldalon, írd fájlba, `diff`. A `matched-css.ts` a párja:
megmondja, melyik szabály adja a talált értéket.

#### A `layout-report.ts` korlátja

Az összesítő oldalanként kiírja a legnagyobb eltérést, de **ne vedd
készpénznek a nagy számait** — elem-kulcs szerint párosít
(`tag.elsőosztály` + sorszám), és ahol a két DOM nem egy az egyben felel meg,
félrepárosít és több száz pixeles hamis "eltérést" ír ki (`(n unpaired)`
jelzi). Egy ismert, vállalt tétel is torzít benne: a `section_0` doboza
(6.1) minden builder-oldalon `dy/dh = 116.0`-t ad. **Egy oldal komolyan
vételéhez a `measure.ts`-t használd szűk szelektorral**, ne az összesítőt:

```bash
node --experimental-strip-types scripts/measure.ts "<szelektor>" \
  http://localhost:8899/<út>/ http://localhost:5173/<út>/ 1440
```

### 8.3 Bundle-méret

```
dist/assets/index-*.css   419 kB   (gzip  39 kB)
dist/assets/data-*.js     390 kB   (gzip  68 kB)   a src/data/ alatti indexek
dist/assets/index-*.js    643 kB   (gzip 162 kB)   minden más
```

A `vite.config.ts` `manualChunks`-szal külön chunkba teszi a `src/data/`
alatti indexeket — az összméret nem változott, de külön cache-elhető.

**Szándékosan nem csináltuk meg:** a kivonatok külön `src/data/excerpts.ts`
fájlba emelését — semmi nem halasztja el a betöltésüket (`ArchiveCard`,
`PostCard` szinte minden tartalmi oldalon rájuk támaszkodik), csak akkor
fizetne ki, ha előbb route-szintű lusta betöltés kerülne be. **Route-szintű
`React.lazy` sem javasolt** — a Suspense-villanás hűségveszteség, és a
növekmény amúgy is adat, amit több komponens is importál. Ha egyszer mégis
szűkíteni kell: (1) `React.lazy` kizárólag a 27 docs oldalra (a fallback maga
a `<DocsLayout slug={slug} />` keret, bájtra azonos a betöltött állapottal),
(2) utána a kivonatok szétbontása.

`public/media` jelenleg **271 MB** — nincs eldöntve, `.gitignore`-ba kerül-e
(eddig a "másoljuk be mindet" opció volt választva, de a repóba még nincs
commitolva).

### 8.4 Ismert hiányosságok a mentésben — ezek NEM javíthatók portból

- **Három hivatkozott fájl nincs lementve** (a `copy-assets.ts` figyelmeztet
  rájuk, de nem áll meg): két PDF (`Akadalymentesitesi_nyilatkozat_Petrik.pdf`,
  `MVSZ_BMSZC Petrik_2023.pdf`) és egy kép (`Nyelvi-Verseny-–-2026-Februar-1024x675.png`).
- **11 lapozó-cél nincs lementve** (`page/3/`, `author/{padmin,toth-eva}/page/2/`
  stb.) — az `archives.ts` `*Missing`-gel jelöli.
- **`2026/09/` hónap-archívum nincs lementve** (csak a napok), év-archívum
  egyáltalán nincs.
- **Két képmodul (kezdőlap "Örökös Ökoiskola" logó)** markupja és képfájlja
  hiányzik — lásd 8.2.
- **Az ikonfont `@font-face`-e abszolút URL-re mutat**, offline nem éri el —
  lásd 4.19, 6.3.
- **Minden `rel="canonical"` href relatív útra van írva** — lásd 4.23.
- Néhány archív poszt-slug percent-kódolt emojit tartalmaz
  (`%f0%9f%8c%bf-zero-waste-fashion…`); a kulcs emojis lesz konzisztensen
  (`resolveUrl` `decodeURI`-t hív). Route nem kell rájuk (`available: false`).
