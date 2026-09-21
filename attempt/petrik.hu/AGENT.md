# petrik.hu — port állapot és hátralévő feladatok

Ez a dokumentum egy folyamatban lévő munkát ír le: a `petrik.hu` WordPress-oldal
statikus mentésének átültetését React + TypeScript + Vite projektbe.

**Írta:** a Fázis 3–5 munkát végző ügynök, a következő ügynöknek.
**Állapot ideje:** 2026-09-19. `npm run build`, `npm run lint` és
`check-routes.ts` zöld, `check-text.ts` **129/129 oldalon karakterre azonos**,
`check-titles.ts` **129/129 route-on a mentés saját címét** adja.

> **Hol tartunk egy mondatban:** a **Fázis 3, 4 és 5 kész**, és a mentés minden
> nem-poszt oldala portolva van — **129 oldal**, plusz a `/kereses/`, aminek
> nincs megfelelője a mentésben (a WP `?s=` keresését váltja ki), így 130 route.
> A pixelmunka nagy része is megvan; ami maradt, az a főoldali `Gallery` és
> néhány kis eltérés — lásd 8.2.

---

## Ezt a fájlt minden változtatás után frissíteni kell

**Ez nem opcionális, és nem a munka végén esedékes.** Ez a dokumentum az
egyetlen átadás a következő ügynöknek: ha egy javítás nincs benne leírva, a
következő kör újra megtalálja ugyanazt a hibát, vagy — rosszabb — „megjavítja"
azt, ami szándékos eltérés.

Amit minden kör után frissíts:

- a **fenti státuszsor** (dátum + a zöld ellenőrzések),
- a **„Mi van még hátra"** lista, ha valami elkészült vagy kiderült róla, hogy
  a premisszája téves volt,
- egy **új `4.x` alszakasz** minden megtalált hibáról: mi a tünet, mi volt az
  *ok*, és **hogyan derült ki** — az utolsó a legértékesebb,
- a **6. szakasz**, ha új *szándékos* eltérés keletkezett,
- a **7. szakasz**, ha új csapdába futottál bele.

Ha egy javítás közben kiderül, hogy az itt leírt szám vagy állítás **téves**,
azt javítsd ki, ne írj mellé egy másodikat. Ebben a körben például a 4. pont azt
állította, hogy hiányoznak az Open Graph tagek — a mentésben **egy sincs**,
tehát nem hiányoznak, lásd 4.23.

---

## Mi van még hátra — röviden, a felhasználónak

A port **működik és kész**: mind a 129 mentett oldal renderelődik, mindegyik a
saját címével, metaadataival és a valódi favicont mutatva, a szövegük
**karakterre azonos** a mentéssel, és a **kezdőlap minden szekciója 0,0px**-re
egyezik. Ami maradt, három tétel:

1. **A 252 blogposzt nincs portolva** (a felhasználó szerint nem érdekes). A
   kártyáik látszanak, de nem kattinthatók, és jelzik, hogy nincsenek a
   mentésben. Egy poszt (`/kutatok-ejszakaja-a-petrikben/`) mintaként be van
   kötve, tehát a sablon kész — ha kellenek, a `walk.ts` `post` ága végigfut
   rajtuk.

2. **A többi 128 oldal pixelellenőrzése.** A kezdőlap és a klasszikus oldal
   végig van mérve, a docs és az archívumok korábban; a maradékot még senki nem
   nézte végig szekcióról szekcióra. A módszer a 8.2-ben van leírva, és ebben a
   körben **öt hibát fogott ki a kezdőlapon egymás után** — tehát érdemes.

3. **A `public/media` 271 MB.** Erről kell egy döntés: bemegy a gitbe, vagy
   `.gitignore`-ba kerül és a `copy-assets.ts` állítja elő. Eddig a „másoljuk be
   mindet" opciót választottad, de a repóba még nincs commitolva semmi.

**Ami lekerült a listáról, és miért:**

- *A főoldali galéria* (volt 1. pont, −132,7px) **kész**, 0,0px — lásd 4.21.
- *A három apró pixel-eltérés* (volt 2. pont) **kész**, és útközben még öt
  másik is előkerült ugyanott — lásd 4.21 és 4.22.
- *A fejléc metaadatai* (volt 4. pont) **kész**, de a pont premisszája részben
  téves volt: a mentésben **egyetlen** Open Graph vagy Twitter tag sincs, és
  leírás is csak a kezdőlapon van. Ami tényleg ott van, az át lett véve — lásd
  4.23.

**Amit tudatosan nem csinálunk meg**, és ne „javítsd meg" egyeztetés nélkül: az
`Örökös Ökoiskola` logó a kezdőlapról. A mentésben a helye ott van (két üres
oszlop, `et_pb_image_8` és `_9`), a CSS-ük és az animációs adatuk is megvan, de
**sem a markupjuk, sem a képfájljuk nincs a mentésben** — a crawler nem hozta
el őket. A port pontosan azt mutatja, amit a mentés: két üres oszlopot. Ha a
felhasználó előkeríti a képfájlt, két `Image` modul kell a 14. és 15. oszlopba.

Nem hiba, csak tudni érdemes: a `/hirkezelo/` szándékosan kimaradt, a JS-bundle
1,0 MB nyersen (≈228 KB gzip), és a mentéshez képest több helyen **szándékosan
eltérünk**, mert a mentés maga törött — ezek a 6. szakaszban vannak felsorolva.

---

## 1. Mit kell tudni ahhoz, hogy bármit is csinálj

### A mentés helye

```
C:\Users\kovac\Downloads\scrape\mirror\petrik.hu\petrik.hu
```

**Nem** a repo gyökerében van, hanem egy szinttel feljebb. Egyetlen helyen van
leírva: `scripts/mirror.ts` → `MIRROR_ROOT`. Ha a mentés elmozdul, csak ezt kell
átírni.

A mentés WordPress + **Divi 4.27** téma + **BetterDocs** plugin.

| Típus | Darab | Állapot |
|---|---|---|
| Oldal (`body.page`) | 25 (home-mal) | **kész** |
| Klasszikus WP-oldal (nincs Divi-fa) | 1 (`adatkezelesi-tajekoztato`) | **kész** |
| Bejelentkezési űrlap (`hirkezelo`) | 1 | **kimarad** (felhasználói döntés) |
| Docs oldal (`docs/*`) | 27 | **kész** |
| `dokumentumtar` | 1 | **kész** |
| Doc-kategória (`dokumentum-kategoria/*`) | 10 | **kész** |
| Doc-címke (`dokumentum-cimke/tananyag`) | 1 | **kész** |
| Blogposzt (`body.single-post`) | 253 | ebből **1** kap route-ot — **kész** |
| Archívum (kategória + dátum + szerző) | **64** | **kész** |

### Jóváhagyott scope-döntések (a felhasználótól)

- **Csak 1 blogposzt** kap saját route-ot: `kutatok-ejszakaja-a-petrikben`.
  A többi 252 a listákban placeholder kártyaként jelenik meg, link nélkül.
- **Az archívumok benne vannak** a scope-ban, **valódi lapozó route-okkal**
  (`/kategoria/hirek/page/2/`), a mentés oldalméretével.
- **A `/hirkezelo/` kimarad** — nincs route, a menüben placeholder marad.
- **A 2 jelszóvédett docs oldal megkapja a keretet**, a tartalom helyén jelzéssel.
- **A `/dokumentum-kategoria/` 10 oldala benne van** a scope-ban.
- **A `/dokumentumtar/` rácsa sorrendhű** (nem pakolás-hű), lásd 6.5.
- **A docs kereső működő React-szűrő** a 27 dokumentum címére.
- **A PDF-ek a `public/`-ba kerülnek**, az eredeti `wp-content/uploads/...`
  útvonalat megtartva.
- **A cél a lehető legpixelpontosabb** egyezés az eredetivel.
- **Oldalanként külön `.tsx` fájl**; ami több helyen kell, megosztott komponens.
- Új npm dependency **csak a felhasználó jóváhagyásával**. Eddig egy van:
  `node-html-parser` (devDependency, csak a `scripts/` használja).

### Kötelező szabályok (a felhasználótól, változatlanul érvényesek)

- WordPress-szemét nem kerül át: jQuery, `wp-embed`, `wp-emoji`, `admin-ajax`,
  inline WP script blokkok, Divi/plugin JS. Helyettük React-megoldás.
  **Pontosítás (felhasználói döntés):** ez a *kódra* vonatkozik, nem a
  *helyfoglalásra*. Két plugin-widget markupja átkerül — inertként, `href`
  nélkül —, mert eldobva valódi elrendezés-eltolást okoztak. Lásd 6.9.
- **Nincs `dangerouslySetInnerHTML`.** A tartalom strukturált adatból vagy
  közvetlen JSX-ből renderelődik. Ez jelenleg **sehol nincs megszegve**.
- A CSS-t nem egy blokkban másoljuk: csak a szükséges szabályokat, a projekt
  styling-megoldásához illesztve (komponens melletti sima `.css` fájl).
- A törött linkekre nem generálunk route-ot; placeholder kerül a helyükre.
- **Ne találj ki CSS-szabályt.** Erre most már eszköz is van, lásd 3.3.

---

## 2. A projekt felépítése

### Konvenciók

TypeScript, `.tsx`, `jsx: react-jsx`. A `tsconfig.app.json` szigorú:
`verbatimModuleSyntax` (típusimport mindig `import type`), `erasableSyntaxOnly`
(**nincs enum, parameter property, namespace**), `noUnusedLocals`,
`noUnusedParameters`. Sima CSS a komponens mellett, natív nesting, `:root`
custom property-k. Pontosvessző nélküli, egyes idézőjeles importok `.tsx`
kiterjesztéssel.

### Könyvtárak

```
scripts/            fejlesztői eszközök, sosem kerülnek a bundle-be
  mirror.ts         MIRROR_ROOT és a többi útvonal-konstans
  pages.ts          az oldaltérkép: mirror-könyvtár → route → komponens
  extract.ts        közös segédek: osztályok, URL-átírás, inline HTML → JSX
  walk.ts           a bejáró: négy oldalforma → TSX
  generate.ts       mind az 53 oldal újragenerálása (ezt hívd)
  page-css.ts       az oldal Divi design-stíluslapjának kinyerése + scope-olása
  docs.ts           a BetterDocs index → src/data/docs.ts            [ÚJ]
  archives.ts       a 64 archívum → src/data/archives.ts             [ÚJ]
  collect-css.ts    stíluslap építése a ténylegesen illeszkedő szabályokból [ÚJ]
  posts.ts          poszt-összefoglalók gyűjtése → src/data/posts.ts
  fonts.ts          Google-fontok kinyerése → public/fonts + src/styles/fonts.css
  copy-assets.ts    képek/PDF-ek másolása → public/media
  measure.ts        geometria-összehasonlítás CDP-n át
  matched-css.ts    egy elemre ténylegesen illeszkedő szabályok        [ÚJ]
  css-rules.ts      szabályok kiszedése egy stíluslapból szelektor szerint [ÚJ]
  check-text.ts     renderelt szöveg összehasonlítása
  check-routes.ts   route-tábla és oldalkomponensek egyezése           [ÚJ]
  layout-report.ts  oldalankénti legnagyobb eltérés a mentéshez        [ÚJ]
  shot.ts           screenshot pontos viewport-szélességen

src/
  components/       Layout, TopBar, Header, Footer, Sidebar, ...
                    PostHeader, SharedCounts                  (a poszt)
                    ArchiveView, ArchiveCard, ArchivePagination  (a 64 archívum)
  components/divi/  a Divi modulok: Section, Row, Column, Text, Blurb, ...
  components/docs/  a BetterDocs keret: DocsLayout, DocsSearch,
                    DocsCategoryList, DocsBreadcrumb, DocsNav,
                    DocsReactions, DocsIcons, FileBlock, DocsProtectedNote
  data/             site.ts, footer.ts, posts.ts, docs.ts, archives.ts
  lib/              useColumnCount.ts, text.ts (fold), useBodyClass.ts,
                    useFixedHeader.ts (a görgetéskor zsugorodó fejléc)
  pages/            oldalanként egy .tsx + egy .css
  pages/docs/       a 27 generált docs oldal
  pages/            Dokumentumtar.tsx, DocTaxonomy.tsx (kategória + címke)
  routes/           docsRoutes.tsx — a 27 docs route
  styles/           divi-layout.css (rács), sidebar-layout.css (kétoszlopos
                    keret, generált), fonts.css (generált)
```

### Generálás

```bash
node --experimental-strip-types scripts/generate.ts
```

Ez újraírja mind az 53 oldal `.tsx` és `.css` fájlját a mentésből. **A
`src/pages/` alatti fájlokat ne szerkeszd kézzel** — a következő generálás
felülírja őket. Ha egy oldal rosszul néz ki, a `scripts/walk.ts`-t javítsd.

Komponensnevekkel szűkíthető, ha egy modul változott és nem akarod, hogy 53
fájl átírása eltemesse azt az egyet, ami mozdult:

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

Mindegyik preset megmondja, **mely oldalakat járja be, mit tart meg, és hová ír**;
a `scripts/collect-css.ts` tetején vannak. A `gallery` preset ki van kommentezve,
lásd 8.2.

Mindhárom **ellenőrzi magát** és nem nulla kilépési kóddal áll meg, ha a mentés
ellentmond a feltevéseinek (pl. két archívum más dátumot ír ugyanarra a posztra).
Ha ez bejön, **a terv rossz** — ne írd felül az egyiket, hanem szólj.

Egy oldal önmagában:
```bash
node --experimental-strip-types scripts/walk.ts <mirror-könyvtár> [--report]
node --experimental-strip-types scripts/walk.ts home --report
```
A `--report` kiírja az oldal fajtáját, a szekciók számát, a használt
komponenseket, a **tudatosan eldobott** részeket, és az ismeretlen modulokat
`UNHANDLED`-ként — **sosem hagyja ki némán**. Jelenleg egyetlen oldalon sincs
`UNHANDLED`.

---

## 3. Ellenőrző eszközök — ezeket használd, ne szemrevételezz

Mindhez két szerver kell:

```bash
npm run dev                                    # :5173
cd <MIRROR_ROOT> && python -m http.server 8899 # :8899
```

### 3.1 Szöveghűség

```bash
node --experimental-strip-types scripts/check-text.ts [oldal ...]
node --experimental-strip-types scripts/check-text.ts --only=docs
```

Blokkonként hasonlítja a renderelt szöveget a mentéshez. **Jelenleg 129/129
oldal karakterre azonos.** Ez a legerősebb védőháló.

A `--only=<kind>` szűkít (`builder`, `classic`, `docs`, `post`, `archive`, `taxonomy`) —
teljes futás 129 oldalon ~7 perc. Az archívumok nincsenek a `PAGES`-ben (mind a
64-et egy komponens rendereli), de az URL-jeik egybeesnek a mentés könyvtáraival,
ezért leképezés nélkül ellenőrizhetők.

Szándékosan kizárt elemek (mindkét oldalon), a `check-text.ts` `IGNORED`
listája szerint: ikonfont-glyph-ek, az `.et_overlay`, a „bővebben" link vs. a
placeholder-jelzés, a lapozó, a kereső spinnere, az olvasásiidő-ikon, és a két
jelszóvédett dokumentum (a mentés a WP bejelentkező űrlapját mutatja, a port egy
jelzést — egyik sem maga a dokumentum).

A BetterDocs reakció-lábléc és a poszt megosztás-sávja **már nincs kizárva**:
azóta inertként renderelődnek (lásd 6.9), tehát összehasonlíthatók, és
egyeznek is.

### 3.1b A dokumentum fejléce

```bash
node --experimental-strip-types scripts/check-head.ts
```

Mind a 129 route címét, leírását, robots metáját és a canonical **meglétét**
veti össze a mentésével. **Böngészőt hajt** (mindezt effect állítja be, a
kiszolgált HTML-ben még nincs benne), tehát a 3.1-es szabály áll rá is: **ne
fusson más ellenőrzéssel egyszerre.**

### 3.2 Geometria

```bash
node --experimental-strip-types scripts/measure.ts "<css-szelektor>" <urlA> <urlB> [szélesség]
```

Elemenként összeveti a pozíciót és a méretet. **Ha a két oldalon nem ugyanannyi
elem van, nem diffel, hanem szól.**

### 3.3 „Honnan jön ez a szabály?" — ÚJ, ezt használd CSS-hez

```bash
node --experimental-strip-types scripts/matched-css.ts <url> "<szelektor>" [szélesség]
```

Megkérdezi a böngészőt (`CSS.getMatchedStylesForNode`), hogy egy elemre
**ténylegesen** mely szabályok illeszkednek, kaszkád-sorrendben, a legyengébbtől.

**Korlátja, és ez a `collect-css.ts`-re is áll:** csak az elem *aktuális*
állapotára illeszkedő szabályokat adja vissza, tehát `:hover`, `:focus` és
társaik **sosem** kerülnek bele. Ha egy interaktív viselkedés hiányzik a
portból, ez az első hely, ahol keresd — lásd 4.18(d).

**A második korlát ennél is fontosabb:** amit a Divi/plugin JS-e `.animate()`-tel
vagy inline stílussal csinált, ahhoz **egyáltalán nincs szabály**, amit be
lehetne gyűjteni. Ilyenkor a mentés HTML-je sem segít, mert az a *nyugalmi*
állapotot rögzíti. A forrás ilyenkor maga a script:
`wp-content/themes/Divi/js/scripts.min.js@ver=4.27.8`. Olvasható formába hozva:

```bash
python -c "import re,sys; s=open(sys.argv[1],encoding='utf8',errors='ignore').read(); i=s.find(sys.argv[2]); print(re.sub(r'(,|;|\{|\})', lambda m: m.group(0)+chr(10), s[i:i+1500]))" <script> <keresett-token>
```

Így került elő a csúszka `fade_speed: 700`-a és a keresztúsztatás pontos
sorrendje (4.18(e)).
Ez a helyes válasz az AGENT.md „ne találj ki CSS-szabályt" szabályára: a plugin
minified lapjai 180 KB-osak és **nyolc alternatív elrendezést** tartalmaznak,
amiknek a szelektorai hihetőnek látszanak, de sosem illeszkednek erre a markupra.
Grep-pel ezt nem lehet eldönteni.

```bash
node --experimental-strip-types scripts/css-rules.ts <css-fájl> <token> [token ...]
```
Egy konkrét stíluslapból szedi ki a tokenre illeszkedő szabályokat, a `@media`
kontextust megtartva. Akkor jó, ha már tudod, melyik lapot nézed.

---

## 4. Amit ebben a körben találtam és javítottam — **olvasd el**

Ezek nem kozmetikai javítások: mindegyik **csendes tartalom- vagy
stílusvesztés** volt, és több oldalt érintett.

### 4.1 `blockJsx` eldobta a szöveget az inline elemek között

A `<div>`-ág csak az **elem**-gyerekeket térképezte, a köztük lévő szövegcsomókat
nem. Egy Outlookból bemásolt bekezdésből (`<div><strong>X</strong> hosszú szöveg…</div>`)
**csak a `<strong>` maradt meg**, a mondat többi része eltűnt. A
`docs/petrik-alapitvany` oldalon ~1400 karakter hiányzott.

Javítva: a div csak akkor lapul ki, ha tényleg blokk-gyerekei vannak; különben
bekezdésként renderelődik.

### 4.2 A `<div>`-ekből `<p>` lett, és a `<p>` margója eltolta az oldalt

A bemásolt tartalom `<div>`-jeit a bejáró `<p>`-vé alakította. A Divi `<p>`-nek
alsó margót ad → nyolc ilyen wrapper **112px-szel** tolta el az oldalt. Most
`<div>` marad, a `text-align` inline stílusa megőrizve.

### 4.3 A scope-olás megölt 83 Divi-szabályt

A `page-css.ts` minden szelektor elé betette a `.page-<slug>` osztályt. A Divi
viszont a dokumentum gyökerétől ír szelektort:

```
body #page-container .et_pb_section .et_pb_button_0   → 54 szabály
.et-db #et-boc .et-l .et_pb_image_0                   → 29 szabály
```

`.page-home body …` egy `<body>`-t keres **az oldalon belül** — ilyen nincs, a
szabály **sosem illeszkedett**. A főoldal gombjainak színe, kerete és ikonja
emiatt hónapok óta halott volt, a docs képek `width: 10%`-a szintén.

Javítva: a scope a **külső ősök után** kerül be (`OUTER` lista a `page-css.ts`-ben:
`html`, `body`, `.et-db`, `.et_divi_theme`, `#page-container`, `#et-main-area`),
és az `index.html` `<body>`-ja megkapta a mentés `et-db et_divi_theme` osztályait.

> **Figyelem:** ez az AGENT.md korábbi §4 pixel-táblázatát **érvénytelenítette**.
> A számokat újra kell mérni, mert most olyan szabályok is élnek, amik addig nem.

### 4.4 `rewriteUrl` rossz mélységben

A `rewriteUrl(url, depth)` fix számú `../`-t vág le. Ez a legfelső szintű
oldalakra jó, de egy `docs/` alatti oldal testvér-linkje csak **egy** `../`-t
hordoz, miközben az oldal két szinttel lejjebb van — így a `docs/` prefix elveszett
(`/dualis-kepzes-tajekoztato/` a `/docs/dualis-kepzes-tajekoztato/` helyett).

Javítva: új `resolveUrl(url, fromDir)` az `extract.ts`-ben, ami valódi
útvonal-feloldást végez. **Az új scriptek ezt használják**, a `rewriteUrl` a
meglévő hívóknak változatlan maradt (így a 24 zöld oldal nem mozdult).

### 4.5 A JSX elnyelte a whitespace-t az elemek között

A mentésben `<a>A</a><br />\n<a>B</a>` — a sortörés valódi szóköz. A JSX minden
olyan whitespace-futamot eldob, ami sortörést tartalmaz. Javítva: az `extract.ts`
`{' '}`-ot bocsát ki oda, ahol a mentésben két elem között whitespace-csomó van.
(Ugyanaz a fogás, amit a `Header.tsx` használ — lásd 7.5.)

### 4.6 `copy-assets.ts` nem látta az `<object data="…pdf">`-et

Az `ASSET_RE` csak `src|href`-et illesztett, így a Gutenberg fájl-blokk PDF-je
sosem másolódott át. Javítva: `data` is benne van.

### 4.7 A body-osztályok valódi elrendezést vezérelnek

A téma nem dísznek tette ki a `<body>`-ra a `single-post`, `archive`,
`et_right_sidebar`, `et_pb_pagebuilder_layout` osztályokat — **szabályokat köt
rájuk**. Például:

```css
.et_pb_pagebuilder_layout.single-post:not(.et-tb-has-body) #main-content .et_pb_row {
  width: 100%;
}
```

Enélkül a poszt Divi-sora a generikus 80%-ot kapja, és **159px-szel keskenyebb**
lesz. Egy SPA-nak egy `<body>`-ja van, ezért a `src/lib/useBodyClass.ts` teszi
fel és le őket route-váltáskor. A `walk.ts` a **mentés tényleges body-osztályait**
adja ki a poszthoz (a `bodyClasses()` helper), kiszűrve a site-szintűeket
(`et-db`, `et_divi_theme` — ezek az `index.html`-ben vannak) és a crawler
gépéről beragadt `linux`/`windows`/`chrome` tokeneket.

**Ha egy elrendezési szabály nem érvényesül, ezt nézd meg először.**

### 4.8 A kétoszlopos keret közös — és egyszer már elvesztettem

A `#left-area` / `#sidebar` / a köztük lévő hajszálvonal a téma szabályai, és
**négy oldalcsalád osztozik rajtuk**: a klasszikus WP-oldal, az egyetlen poszt,
a kereső és mind a 64 archívum. Amikor a `Search.css` globális `#left-area`
szabályát az archívumok kedvéért `.page-kereses` alá scope-oltam, a klasszikus
oldal és a poszt **elvesztette a kétoszlopos elrendezést** (1080px, `float: none`) —
a szövegellenőrzés ezt nem fogta meg, mert a szöveg ugyanaz maradt.

Ezért a keret most a `src/styles/sidebar-layout.css`-ben van, globálisan
importálva a `main.tsx`-ből, és a `collect-css.ts frame` presetje generálja.
**Tanulság:** ami a témából jön és több oldalcsalád használja, az nem tartozik
egyetlen komponens stíluslapjába sem.

### 4.9 A hiányzó `border-style` — két rejtély egy okra

A Divi minden modulra, aminek keretet állítottak be, kitesz egy
`et_pb_with_border` osztályt, és a **téma** adja hozzá a keret *stílusát*:

```css
.et_pb_with_border                              { border: 0 solid #333 }
.et_pb_with_border .et_pb_team_member_image     { border: 0 solid #333 }
.et_pb_with_border .et_pb_image_wrap            { border: 0 solid #333 }
.et_pb_post .entry-featured-image-url           { border: 0 solid #333 }
```

Ezek önmagukban **semmit nem rajzolnak** (a szélesség 0), viszont az oldal saját
design-stíluslapja már csak a szélességet írja elő (`border-width: 10px 0`).
`border-style` nélkül a `border-width` **nem fest és nem is foglal helyet** —
a szabály csendben hatástalan.

Ez volt:
- az AGENT.md §4.1(a) **10px-e** a tanári portrék fölött, és
- az AGENT.md §4.1(b) **21,6px-e** minden blog-kártyán (2×15px keret).

Mindkettő **megoldva**: a négy alapszabály a `divi-layout.css`-ben és a
`PostCard.css`-ben van, a `walk.ts` pedig a `borderProp()` helperrel továbbviszi
az `et_pb_with_border` osztályt a `Text`, `TeamMember`, `Row` és `Column`
modulokra is (eddig csak a `Section` és a `PostFeed` kapta meg).

**Tanulság:** ha egy generált oldal-CSS szabálya nem érvényesül, nézd meg, van-e
hozzá téma-szintű alapszabály, amit a port nem vitt át.

### 4.10 Kitalált kép-szabályok helyett a valódiak

Három szabály volt kitalálva az `Image.css`-ben, és mindegyik rontott:

| Kitalált | A mentés valójában | Mit okozott |
|---|---|---|
| `.et_pb_image img { display: block }` | a kép **inline** | elrejtette az alapvonal-rést, de megakadályozta a `vertical-align` működését |
| `.et_pb_image img { width: auto }` | nincs ilyen; csak `max-width: 100%` | felülírta a `width`/`height` attribútumot, így a **lusta betöltésű képek 0×0-ra estek össze** |
| — | `.et_pb_image { line-height: 0 }` | ez a valódi megoldás az alapvonal-résre |

A `display: block` egy helyen **megmaradt**, szándékosan: a `.et_pb_image img`-nél
a mentésben több feltöltés hiányzik, és egy törött inline kép `width: auto`-val
semmivé zsugorodik, míg blokként megtartja az attribútumai szerinti dobozt.
Ez kommentben is le van írva a fájlban.

### 4.11 A hero-háttérképek sosem másolódtak át

A `copy-assets.ts` a HTML `src`/`href`/`data` attribútumait olvasta. Egy Divi
szekció háttérképe viszont **soha nem `<img>`**: az oldal design-stíluslapjában
él, `background-image: url(...)` alakban. Így **18 oldal hero-képe hiányzott**,
csendben — a szekció helyén csak a fölé tett `linear-gradient` látszott.

Javítva: a `copy-assets.ts` most végigolvassa a projekt **generált CSS-fájljait**
is (`assetsInStyles()`), és a `/media/...` hivatkozásokat is átmásolja. 17 kép
került be (8,4 MB); a 18. a mentésben sincs meg.

**Ugyanez a hiba másodszor:** a főoldali csúszka fotói a mentés HTML-jében
**inline `style="background-image: url(...)"`**-ben vannak, nem `src`-ben —
azokat sem másolta. Az `INLINE_URL_RE` ezt is lefedi. **Ha egy kép hiányzik,
mindig azzal kezdd, hogy megnézed, honnan hivatkozzák.**

**Tanulság:** ha egy kép hiányzik, nézd meg, nem CSS-ből hivatkozzák-e.

### 4.12 Három hiba, ami miatt a hero szövege rossz színű volt

Egymástól függetlenek, de ugyanazon az oldalon látszottak:

1. **A stílusos `<span>`-eket kibontottuk.** Az `inlineJsx` `case 'span'`-je a
   tartalmat adta vissza, az inline `style`-t eldobva. A szerkesztő viszont
   így színezett: `<h1><span style="color: #72c3b6;">…</span></h1>`. **140 ilyen
   span** van a mentésben (szín, vastagság, méret). Most a `styleProp()` helper
   JSX style-objektummá alakítja; a stílus nélküli spanokat továbbra is kibontja.
2. **A `Text` komponens bedrótozva `et_pb_bg_layout_light`-ot adott.** A Divi
   ebből színezi a szöveget, és a hero-fotókon `dark` a helyes — a mentésben 59
   ilyen text modul van. Most `bgLayout` prop, amit a `walk.ts` tölt ki.
3. **Hiányzott a `.et_pb_bg_layout_dark { color: #fff !important }` szabály.**
   A 2. pont enélkül nem ért volna semmit. A `divi-layout.css`-ben van.

### 4.13 `background-size: cover` — egy kétszer deklarált tulajdonság fele

A téma így írja:

```css
.et_pb_section { background-size: 100%; background-size: cover; }
```

A második nyer. A portba **csak az első** került át, ezért minden háttérképes
szekció széltében nyújtotta a képet ahelyett, hogy kitöltötte volna. Ráadásul a
Divi az ilyen szekcióra kiteszi az `et_pb_with_background` osztályt (ami szintén
`cover`-t mond), amit a `Section` komponens nem adott ki. Mindkettő javítva —
a komponens új `withBackground` propja a `walk.ts`-ből jön.

### 4.14 Amit én rontottam el: per-oldal szabály közös stíluslapban

A `HeroSlider.css`-t a `collect-css.ts slider` presettel generáltam a mentésből,
és bekerült egy **scope nélküli** `.et_pb_section_0 { min-height: 600px }` — ez a
főoldal saját design-szabálya, de így **minden oldal első szekciójára** ráragadt,
és 600px magasra fújta őket.

A `collect-css.ts` most **általánosan kizárja** az ilyen szabályokat
(`PER_PAGE_RE`): a Divi számozott modulosztályai (`.et_pb_section_0`,
`.et_pb_text_3`) oldalanként mást jelentenek, ezért a `page-css.ts` dolga őket
kezelni — az scope-olja is. Közös komponens-stíluslapba egy sem való.

### 4.15 A site-szintű body-osztályok hiányoztak

A 4.7 a *per-oldal* body-osztályokról szólt. Kiderült, hogy a **site-szintűek**
is hiányoztak: a mentés mind a 345 oldalán ugyanaz a 19 osztály ül a `<body>`-n,
nálunk viszont csak kettő volt (`et-db`, `et_divi_theme`).

Ezek nem díszek. Az `et_header_style_left` és az `et_fixed_nav` hajtja a fejléc
elrendezését, az `et_pb_gutters3` a rácsot, az `et_transparent_nav` a fejléc
alatti helykihagyást. Nélkülük a téma szabályainak egy rétege néma maradt.

Mind a 19 bekerült az `index.html`-be, kommenttel. Meghatározásuk: az összes
mentés-oldal body-osztályainak metszete, a crawler gépéről beragadt
`linux`/`windows`/`chrome` tokenek nélkül.

### 4.16 A fejléc nem zsugorodott görgetéskor

A Divi görgetéskor `et-fixed-header` osztályt tesz a `#main-header`-re, és onnan
**minden méretezés CSS**. Ez JS volt, tehát a port szabályai szerint React-
megoldás kell hozzá: `src/lib/useFixedHeader.ts`.

A küszöb **mérve, nem becsülve**: a mentésen a class `scrollY = 60`-nál jelenik
meg és 59-nél még nem. A fejléc így **80px → 54px**, ahogy az eredetin.

Ami ehhez kellett:
- a 4.15 szerinti body-osztályok (a szabályok `.et_header_style_left`-re épülnek);
- a téma `.et-fixed-header` szabályai a `Header.css`-ben;
- és a 4.17 — enélkül a lenyíló menüpontok nem zsugorodtak volna.

### 4.17 `<span>` az `<a>` helyett — harmadszor

A nem kattintható lenyíló menüszülőket (`Oktatás`, `Vizsga`, …) `<span>`-ként
rendereltük. A mentés `<a href="#">`-et ír. A téma viszont **`a`-szelektorokra**
köti a menü paddingjét és a lenyíló nyilát, így ez az 5 elem 47px magas maradt,
miközben a fejléc többi része 34-re húzódott össze.

Most `href` nélküli `<a>` — nem link, nem fókuszálható, de `<a>`. Ugyanaz a
megoldás, mint a 6.11-ben az elérhetetlen posztok képénél. **Ez a minta
harmadszor jött elő: ha a téma `a`-ra épít, `<span>`-t tenni oda mindig törik.**

Ugyanitt derült ki egy **specifikusság-hiba is**: a mi `#top-menu li`
szabályunkba bele volt olvasztva a téma `.nav li { line-height: 1em }`-je. Az
ID miatt ez erősebb lett, mint a `.nav li li { line-height: 2em }`, ezért a
lenyíló menü sorai összeértek (26px helyett 40px kellett volna). A `line-height`
visszakerült a saját `.nav li` szabályába.

---

### 4.18 A főoldali csúszka — négy külön hiba egy modulban

A felhasználó négy tünetet jelzett a kezdőlapon: túl nagy a hero-kép, a
lapozópöttyök helyén fehér téglalap van, hoverre nem jönnek elő a nyilak, és
mindig ugyanaz a kép látszik. Négy **külön** ok volt, és egyik sem a csúszka
logikája.

**(a) A kép azért volt „túl nagy": nem volt túl nagy, csak 116px-cel lejjebb.**
A `Layout.css` minden oldalon a `#page-container`-re teszi a fix fejléc
115px-es helyét. A mentésen a Divi scriptje **a kezdőlapon nem ezt csinálja**:
ott az első modul egy fullwidth csúszka, a fotó **felfut a áttetsző fejléc
mögé**, és a 116px a *dia saját* `padding-top`-ja lesz (`data-fix-page-container="on"`,
a mentés HTML-jében **benne van** inline). Mivel a háttér `background-attachment:
fixed`, a doboz eltolása más kivágást ad ugyanabból a képből — ezért *tűnt*
nagyobbnak.

Megoldás: a `walk.ts` átveszi a mentésből a mért inline `padding-top`-ot
(`headerOffset` prop), a `HeroSlider` kiírja a diára az attribútummal együtt, a
`Layout.css` pedig `:has(.et_pb_slide[data-fix-page-container='on'])`-nal
nullázza a konténer eltolását. Mérve: `#page-container`, `.et_pb_section_0`,
`.et_pb_slide`, `.et_parallax_bg` és `.et_pb_container` **mind 0,0px**.

A `bemutatkozas` és az `about-us` ugyanezt az attribútumot a *szekción* hordozza
(136px = 20px saját + 116px). Ott a tartalom pozíciója így is pontos
(−1+136 = 115+20 = 135), csak a szekciódoboz teteje kezdődik máshol; a szekció
háttere fehér, kerete 0px, tehát **nem látszik**. Szándékosan nem nyúltam hozzá.

**(b) Mindig ugyanaz a kép: `hidden` attribútummal nem lehet Divi-diát váltani.**
A téma `.et_pb_slider .et_pb_slide { display: none }` + `:first-child { display:
list-item }` párost használ, ami mindkettő erősebb a `[hidden]` UA-szabálynál.
Bármit tesz a React az osztályokba, a 0. dia marad látható — örökre. A Divi
scriptje is **inline `display`-t** írt, most a komponens is azt teszi.

**(c) A pöttyök helyén fehér téglalap: `<a>` helyett `<button>`.** A téma a
`.et-pb-controllers a`-ra köti a 7×7px-et, a lekerekítést és a `text-indent`-et;
a port gombot renderel (akadálymentességi eltérés, mint a docs akkordeonnál),
így a gomb natív kinézete maradt. Új `HeroSliderRuntime.css` ülteti át a téma
saját deklarációit a gombra. **Ez a 4.17 mintájának a fordítottja**, és most már
négyszer jött elő: *ha a téma `a`-ra épít, a tageltérést mindig meg kell fizetni
— vagy `<a>`-val, vagy a szabály átültetésével.*

**(d) Hoverre nincs nyíl: a `collect-css.ts` nem tud `:hover`-t gyűjteni.**
A `CSS.getMatchedStylesForNode` azt adja vissza, ami az elem **aktuális**
állapotára illeszkedik, tehát `:hover`-es szabály sosem kerül bele. A nyilak
`opacity: 0`-n állnak, és kizárólag a `.et_pb_slider:hover .et-pb-arrow-*`
hozza elő őket — ez négy szabály, szó szerint átmásolva a
`wp-content/cache/wpfc-minified/e79cb9st/bnakn.css`-ből. **Ezt nézd meg minden
begyűjtött stíluslapnál: ami csak hoverre/fókuszra él, hiányozni fog.**

**(e) Hiányzott a váltás animációja.** Ez már a fentiek javítása *után* jött
elő, és külön ok: a Divi a diaváltást jQuery `.animate()`-tel csinálta, tehát
**nem létezik hozzá szabály, amit a `collect-css.ts` begyűjthetne** — nem is
hover-probléma, egyszerűen nincs CSS.

Amit a script csinál (`Divi/js/scripts.min.js`, `et_pb_simple_slider`): minden
dia `z-index: 1`, a **kimenő** dia `z-index: 2`-re megy, megkapja az
`et-pb-moved-slide` + `et_slide_transition` osztályt és `opacity: 1 → 0`-ra
animál; a **bejövő** dia `opacity: 0`-val jelenik meg *alatta* és `0 → 1`-re
animál; a kimenő csak az animáció végén kap `display: none`-t. Tehát
**keresztúsztatás, nem csere** — ezért lett a kiúszó dia (`leaving`) React-state
és nem valami, amit a CSS ki tudna következtetni.

Két szám, amit ne találj ki újra:

- **700ms**, nem 500. A plugin alapértéke 500, de az `et_pb_slider_init` minden
  `.et_pb_slide`-os csúszkára `fade_speed: 700`-at ad át.
- A jQuery alapértelmezett easingje a `swing`, ami `0.5 - cos(p·π)/2`, azaz
  **szinuszos ease-in-out** — CSS-ben `cubic-bezier(0.37, 0, 0.63, 1)`.

Ugyanitt az automata léptetés `setInterval`-ról **`setTimeout`-ra** váltott,
`active`-ra kulcsolva: a Divi minden mozgás *után* fegyverezte újra az időzítőt
(`j()`), tehát egy kézi kattintás is eltolja a következő automatikus váltást.
Az első festésen **nincs** animáció (az eredetin sem): a bejövő dia csak akkor
kapja meg az `et_slide_entering`-et, ha van mit kiúsztatni. Mérve 7,9s-nél:
kimenő `opacity 0,316 / z 2`, bejövő `opacity 0,684 / z 1`.

A stíluslap neve emiatt **`HeroSliderRuntime.css`** (volt: `…Controls.css`) —
az a gyűjtőhelye mindannak, amit a Divi scriptje futásidőben csinált.

Két további buktató ugyanitt, mindkettő mérve:

- A gomb-reset **nem tartalmazhat `font`-ot vagy `color`-t**: a nyilakat a téma
  `font-size: 48px`-cel méretezi a saját osztályukon, egy későbbi `font: inherit`
  ezt lecsapja (a nyíl 48px-ről 14px-re esett). A pöttyök viszont **kell**, hogy
  örököljék — a `.et-pb-controllers` dobozmagassága a szöveg sorboxából jön.
- A nyilak függőleges középre állítását a Divi scriptje a 116px-es eltoláshoz
  igazítja (`margin-top: 34px` a téma `-24px`-e helyett). A komponens ugyanezt
  számolja: `calc(-24px + <offset> / 2)`. Mérve `y = 333` mindkét oldalon.

### 4.19 Rossz ikonfont-részhalmaz — 35 oldalon hiányoztak glifek

A `copy-assets.ts` a Divi ikonfont **`base`** részhalmazát másolta (6 KB), azzal
az indoklással, hogy „az oldal csak ezt tölti be". Ez a mentésre nézve **nem
igaz**: 307 oldal tölti a `base`-t, **35 az `all`-t** (köztük a kezdőlap), 3 a
`social`-t. A portnak egyetlen `@font-face`-e van az egész bundle-re, tehát a
szuperhalmazt kell vinnie. A `base`-zel a csúszka nyilai egyszerűen **nem
léteztek** a fontban.

Most `all` (92 KB, egyszer, cache-elve). Ellenőrizve: a `base`-ből korábban
működő ikonok (idézőjel, közösségi ikonok, menü-chevron, kereső) változatlanok.

**Mellékfelismerés, és ez fontos a mérésekhez:** a mentésben az ETmodules
`@font-face` **abszolút** URL-re mutat (`//petrik.hu/...`), tehát offline
**sosem tölt be** — a mentés a nyers `4` és `5` karaktert rajzolja ki a nyilak
helyére. A port a valódi glifet mutatja, ezért ott a nyíl doboza 48px széles a
mentés 24px-e helyett. Ez **nem regresszió**, ugyanaz a döntés, mint a 4.2-ben
a docs kategória-ikonjánál: az élő oldal viselkedését portoljuk, nem a mentés
hibáját. Amikor a mentés ikonjai furcsán mérődnek, **először a font betöltését
nézd meg** (`[...document.fonts].map(f => f.family + f.status)`).

---

### 4.20 Minden oldal egy címet és semmilyen faviconú tabot kapott

Két külön hiány, ugyanaz az ok: a WordPress **egész dokumentumot** szolgált ki
kérésenként, tehát minden oldal a saját `<title>`-jével és a site ikonjával
érkezett. Egy SPA-nak **egy** `index.html`-je van, és abban a Vite sablon
`petrik.hu` címe meg a `favicon.svg` placeholderje állt.

**A címek.** Új generátor kiszedi mind a 129 mentett oldal `<title>`-jét egy
route→cím táblába, és egy hook állítja be őket route-váltáskor — ugyanaz a
minta, mint a `useBodyClass`-nál. (A fájlok neve azóta `scripts/head.ts`,
`src/data/head.ts` és `src/lib/useDocumentHead.ts`, mert a 4.23-ban a többi
fejléc-metaadat is beléjük került.) A hívás a `Layout`-ban van, mert az `App.tsx` minden
route-ja alatta ül; a generált oldalkomponensekbe nem is lehetne beletenni.

**A címeket átírjuk, nem előállítjuk.** A WordPress a poszt címéből, a taxonómia
címkéjéből és a Yoast sablonjából rakta össze őket, és **több oldal a saját
címét sehol nem hordozza a törzsében**: mind a 8 dátum-archívum egyszerűen
„Archívum", a docs listák pedig a kategóriát nevezik meg, nem a dokumentumot.
A „ | petrik.hu" utótagot sem vágjuk le: az is része annak, amit az eredeti a
tabra írt (a főoldal az egyetlen kivétel, ott a cím maga a site neve).

Két route-nak nincs mentett oldala, tehát nincs honnan másolni: a `/kereses/`
(a WP `?s=` keresését váltja ki) és a 404. Ezek szövege a porté, a
`useDocumentTitle.ts`-ben, kommenttel jelölve.

**A favicon.** A mentés négy méretet hivatkozik
(`cropped-logo-nagy-{32,180,192,270}.png`). Ebből három átjött korábban, mert
`href`-ben szerepelnek; a **270×270-es `msapplication-TileImage` viszont
`content=` attribútumban van**, amit semmilyen markupot pásztázó szabály nem
talál meg — ezért mind a négy bekerült a `copy-assets.ts` `LAYOUT_ASSETS`-ébe,
ahol a logó is van. Az `index.html` most a mentés sorrendjében hivatkozza őket,
a `public/favicon.svg` (Vite-sablon) törölve. Ugyanitt a `<html lang>` `en`-ről
`hu`-ra javítva — a mentésben is `hu`.

**Ellenőrzés:** új `scripts/check-head.ts`. Nem olvashatja a kiszolgált
HTML-t, mert a címet egy effect állítja be, ezért ugyanúgy böngészőt hajt, mint
a `check-text.ts` — és ugyanúgy **nem futhat vele egyszerre** (közös port).

**Mellékesen megszűnt egy duplikáció:** a „mely route-oknak van mentett oldala"
felsorolás eddig a `check-text.ts`-ben élt, most a `scripts/pages.ts`
`MIRRORED`-je, és a `check-text`, a `head` és a `check-head` is ebből
dolgozik. Két külön lista előbb-utóbb elcsúszott volna.

---

### 4.21 A főoldali galéria — két ok, egyik sem a CSS

A `Gallery` volt a legrégebbi nyitott tétel (−132,7px), és kétszer kudarcot
vallott a begyűjtése. Mindkét ok a begyűjtésen *kívül* volt:

**(a) A modul minden eleme `display: none`.** A téma így írja:
`.et_pb_gallery_grid .et_pb_gallery_item { display: none }`, és a Divi scriptje
tette vissza `display: block`-kal azokra, amik az aktuális lapon vannak
(lapozás). A korábbi próbálkozás ezért kapott **0 magasságú galériát** a valódi
szabályokkal — a markup nem tartalmazta az inline `display`-t. Most a komponens
írja ki, ahogy a script tette; a porton nincs lapozás, tehát minden elem az
első lapon van.

**(b) A szélességi szabályt a `collect-css.ts` saját szűrője dobta ki.** A modul
egyetlen szélesség-szabálya **az oszlopra van scope-olva**, amiben áll:
`.et_pb_gutters3 .et_pb_column_1_6 .et_pb_grid_item { width: 100%; margin-bottom: 45.517% }`.
A `PER_PAGE_RE` viszont `.et_pb_column_1`-ként olvasta és per-oldal szabálynak
hitte. Új `STRUCTURAL_RE` veszi ki a szelektorból a Divi **szerkezeti**
osztályait (`.et_pb_column_1_6`, `.et_pb_row_6col`), mielőtt a teszt lefut.

**Ezt a kettőt nem lehetett volna kitalálni**, csak megkérdezni a böngészőt,
hogy mi illeszkedik a mentés elemére — `matched-css.ts`, 3.3.

Eredmény: a galéria és a ProSuli logó **130×93px, 0,0px eltéréssel**.

### 4.22 A kezdőlap — öt hiba egymás után, szekcióról szekcióra

Miután a galéria megvolt, a `measure.ts ".et_pb_section"` még mindig négy
szekcióban mutatott eltérést. Mind az öt ok más volt, és **egyik sem látszott
addig, amíg az előtte lévőt ki nem javítottuk** — ezért érdemes szekciónként
haladni, nem az összesítőt nézni.

1. **A blog-kártyák +1,6px-e (a régi 2. pont) és egy +29px.** A téma utolsó
   kártyára külön szabályt ad:
   `.et_pb_gutters3 .et_pb_column .et_pb_blog_grid .column.size-1of3 .et_pb_post:last-child { margin-bottom: 30px }`,
   és minden kártya az egyetlen a saját oszlopában. Enélkül a százalékos
   `18.539%` maradt érvényben, kártyánként 29px pluszban.
   A maradék **1,6px** pedig a port saját jelzése volt: a „nem érhető el"
   szöveg `<p>`-ben állt, saját margóval, a helyettesített `.more-link` 32,2px-es
   sorboxa helyett. Most `<a class="more-link post-unavailable-note">`, href
   nélkül — ugyanaz a hívás, mint a 6.11-ben. **A sorboxba beleszóló semmilyen
   tulajdonságot nem szabad ráírni**: a téma sormagassága `2.3em`, tehát már egy
   13px-es `font-size` is 2,3px-szel rövidíti a kártyát. Ezért lett a szöveg
   rövid is (14px-en a hosszabb mondat második sorba törik, az 32px kártyánként);
   a teljes mondat az `<article title="…">`-ben van, ami nem kerül layoutba.

2. **Egy kép 5px magas volt 198 helyett.** A mentés nem minden képet
   lazy-tölt, és a különbség nem kozmetikai: `width`/`height` nélküli képnek
   nincs mivel helyet foglalnia, tehát `loading="lazy"`-vel pár pixel magasan ül,
   amíg be nem görgetik. A `kornyezetvedelem-agazat.jpg`-n a mentésben **nincs**
   `loading` attribútum, a komponensünk viszont mindig kiírta. Most a `walk.ts`
   hozza át az attribútumot, és az `Image`, a `TeamMember` és a `Gallery` is
   propból kapja.

3. **A gombok −3,6px szélesek és +1px magasak voltak.** A téma a nyilat
   `::after`-re **és** `::before`-ra együtt írja
   (`position: absolute`), a `Button.css` viszont csak `::after`-t hozta át. Egy
   oldal design-stíluslapja ad a `::before`-nak saját `content`-et
   (`attr(data-icon)`), így az a nyíl **a sorban maradt**: 12px szélességet vitt,
   a −15,6px margója visszahúzott belőle, és a gomb 3,6px-szel keskenyebb lett.

4. **Minden szekció-alcím rossz méretben és nem nagybetűvel jelent meg.** A
   szerkesztő nem csak a `<span>`-eket stilizálta, hanem **egész bekezdéseket**:
   a mentésben **293 `<p style="…">`** van. Az `extract.ts` csak a spanokra
   hívta a `styleProp`-ot. Most a `p`/`h*`/`blockquote`/`div` ág is. (Stílusos
   `ul`/`ol` a mentésben nincs, ellenőriztem.)

5. **A számlálók 44px-szel alacsonyabbak voltak.** A `NumberCounter.css` két
   dolgot talált ki: a `.percent` a témában **fix `height: 72px`**, nem a
   sorából számolódik, a `.percent p` sormagassága pedig **sima `72px`**, amit a
   design-stíluslap nem ír felül, pedig a `font-size`-ot 48px-re igen. `1em`-ként
   írva követte a kisebb betűt 48px-re. Ráadásul a `.title`-re rakott
   `margin-top: 10px; padding-bottom: 0` elvette a téma h1–h6 szabályának 10px-ét.

6. **A záró fullwidth fejléc 106,8px-szel volt rövidebb.** Két téma-szabály
   hiányzott: `.header-content { padding: 10px }` és
   `.center .header-content { margin: 20px auto; width: 80%; max-width: 800px }`.
   A szélesség nélkül a `<h1>` nem ott tört, ahol az eredetiben.

**A kezdőlap most szekciónként 0,0px** (egy 0,2px-es kerekítéssel).

Ugyanebben a körben a **klasszikus oldal 20px-e** (a régi 2. pont harmadik
tétele) is megvan: a `.main_title { margin-bottom: 20px }` téma-szabály nem
volt sehol. A `frame` preset `keep`-jébe bekerült **`.main_title`** — a ponttal
együtt, mert nélküle a token a téma `h1.et_pb_contact_main_title` szabályára is
illeszkedik, és egy **globális h1 betűméretet** tenne a közös stíluslapba —, a
preset pedig meglátogatja a klasszikus oldalt is.

És egy hetedik, ugyanitt: az **oldalsáv widget-címe 4px-szel volt magasabb**. A
`Sidebar.css` `18px`-et és `20px` paddinget írt rá; a téma h4-e 21px, 10px
paddinggel — a `.widgettitle` sima `<h4>`, nincs is rá szüksége saját szabályra.

### 4.23 A fejléc metaadatai — és egy téves premissza

A korábbi „hátralévő munka" lista azt állította, hogy hiányoznak az Open Graph
és Twitter tagek. **A mentésben egy sincs belőlük** — 345 oldalon 0 és 0 —,
tehát nem hiányoznak, és beírni őket *kitalálás* lenne. Amit a mentés tényleg
hordoz, és ami most át van véve:

| Mit | Hány oldalon |
|---|---|
| `<title>` | mind a 345 |
| `<meta name="description">` | **1** (a kezdőlap) |
| `<meta name='robots'>` | mind a 345 (csak a `/hirkezelo/` értéke más, az nincs portolva) |
| `<link rel="canonical">` | 269 |
| Open Graph, Twitter | **0** |

**Az idézőjel itt nem formaság.** A Yoast `name='robots'`-ot ír **egyszeres**
idézőjellel, a téma `rel="canonical"`-t duplával — ugyanabban a dokumentumban.
A generátor első változata csak duplát ismert, és 129 helyett **25** oldalon
találta meg a robots metát. Nem a kód nézte meg magát: a `check-head.ts` fogta
meg, mert az a **renderelt oldalt** olvassa, nem a generátor elképzelését arról,
amit beolvasott. Minden mintának mindkét idézőjelet kezelnie kell.

A `scripts/titles.ts` ezért `scripts/head.ts` lett, a kimenete
`src/data/head.ts` (`heads`), a hook `useDocumentHead`, az ellenőrző pedig
`check-head.ts` — a cím mellett a leírást, a robotst és a canonical **meglétét**
is összeveti.

**A canonical az egyetlen, amit nem lehet átírni.** A crawler mind a 269 hrefjét
relatív útra írta át (`""`, `"index.html"`, `"../bemutatkozas/"`), tehát az
eredeti abszolút URL sehol nincs meg. Ami biztos, az az, hogy *mire* mutatott: a
WordPress ön-canonicalt ad ki, az oldal saját URL-jét. Ezért az adatban csak a
**ténye** szerepel, a hook pedig `window.location.origin + pathname`-ből rakja
össze — így ott is igaz marad, ahol a portot kiszolgálják, és nem talál ki
domaint.

A `setMeta` **törölni is tud**: 25 route-on van robots meta, a többin nincs, és
egy előző route-ról ottfelejtett tag ugyanolyan hiba lenne, mint egy hiányzó.

---

## 5. Hogyan épül fel a bejáró most (`walk.ts`)

**A diszpécser a `PageEntry.kind`-ból dolgozik, nem DOM-szimatból.** Ez fontos:
**26 docs oldal is tartalmaz `.et_builder_inner_content`-et** (a `#et-boc`-on
belül), tehát a régi szimat a sima builder-ágra vitte volna őket, és a plugin
teljes körítése eltűnt volna.

Négy ág:

| `kind` | Mi ez | Kimenet |
|---|---|---|
| `builder` | Divi-fa | `#main-content > article > .entry-content > …` |
| `classic` | WP-szerkesztős próza | `#left-area` + `<Sidebar />` |
| `docs` | BetterDocs dokumentum | `<DocsLayout slug=…>` + a belső Divi-fa |
| `post` | egyetlen blogposzt | `#left-area > article` + `<PostHeader />` + `<Sidebar />` |

A `--kind=` nélküli kézi futtatásnál a `sniff()` tartalékol, és abban a
**`.betterdocs-single-wrapper` próbája megelőzi** a Divi-ét.

Kapcsolók: `--report`, `--scope=<class>`, `--kind=<kind>`, `--up=<n>` (hány
szinttel lejjebb van a komponens a `src/pages`-hez képest — az importok `../`-jai).

Az `emitSection` **változatlanul újrahasználható** minden ágon; ellenőriztem,
mind a 27 docs oldalon és a poszton 0 UNHANDLED (csak `Text`, `Image`, `Divider`).

### A `DROPPED` halmaz

A `walk.ts`-ben egy nevesített lista tartja, mit hagyunk ki szándékosan. Jelenleg
**egyetlen tétel van benne**: az `et_duplicate_social_icons` (a fejléc social
ikonjainak rejtett másolata, ami JS nélkül semmit nem csinál és helyet sem
foglal). A `--report` kiírja `dropped:` sorként, így a „sosem hagyja ki némán"
szabály **döntéssel** teljesül, nem átcsúszással.

A `shared-counts-wrap` és a `betterdocs-entry-footer` **korábban itt volt, már
nincs** — azóta inertként renderelődnek (6.9).

---

## 6. Amit szándékosan nem egyezőre csináltam

Ezeket **ne** „javítsd" anélkül, hogy a felhasználóval egyeztetnél.

1. **`section_0` doboza.** A fejléc alatti helykihagyást a `#page-container`
   paddingjére tettem (`115px` desktopon, `114px` ≤980px-en), nem az első
   szekció paddingjébe. A **tartalom pozíciója 0.0px-re egyezik**; csak a
   szekció saját doboza tér el.
   **Kivétel:** a docs oldalakon a mentésnek *nincs* ilyen eltolása (a BetterDocs
   lecserélte a teljes tartalmi területet), ezért a `Layout.css`
   `#page-container:has(.betterdocs-wrapper)` szabálya visszaveszi. Enélkül
   minden docs oldal 115px-szel lejjebb kezdődne.

2. **Elérhetetlen posztok.** A kártya „bővebben" linkje helyett jelzés áll.

3. **Ikonfont.** A mentés `@font-face`-e abszolút URL-re mutat
   (`//petrik.hu/...`), tehát offline **hibára fut**, és a mentés a nyers
   karaktereket rajzolja az ikonok helyére (a csúszka nyilainál `4` és `5`).
   Nálunk a font be van töltve → **a mi renderünk a helyes**. Ne igazítsd a
   mentéshez. Ezért a nyíl doboza nálunk 48px széles a mentés 24px-e helyett.
   A `copy-assets.ts` az **`all`** részhalmazt viszi, mert a portnak egyetlen
   `@font-face`-e van 342 oldalra — lásd 4.19.

4. **A BetterDocs kategória-ikon** ugyanez az eset: a crawler
   `betterdocs-cat-icon.svg@v=4.9.2` néven mentette, amit a statikus szerver rossz
   MIME-mel ad ki, ezért a **mentésben törött kép** — és az alt-szövege
   **193,7px**-et foglal a 32px-es ikon helyett. Mi `/media/betterdocs-cat-icon.svg`
   néven másoljuk, így helyesen jelenik meg. Emiatt a `/dokumentumtar/` kártyáinak
   címe máshol tördelődik, mint a mentésben — **ez várt, és a mi oldalunk a jó.**

5. **`/dokumentumtar/` rács.** Az eredetin a Masonry JS pakolta a kártyákat a
   legrövidebb oszlopba. Nálunk flex-sorok: **az oszlopszélesség és az első sor
   pozíciója pixelre egyezik** (338,75px, 15px köz, 1024px alatt 1 oszlop), de a
   kártyák sorrendhűen balról jobbra állnak, nem tömören pakolva. Felhasználói
   döntés.

6. **Akkordeon `<button>`.** A mentésben a nyíl csupasz `<svg>`, amit csak a
   plugin JS-e ért el. Nálunk `<button aria-expanded>` — akadálymentességi
   javítás. A **nyitott állapot** viszont hűen reprodukált: a stíluslap minden
   kategóriát becsuk, és a plugin JS **csak az aktuális dokumentum kategóriáját**
   nyitja ki inline `display:block`-kal. Ezt állapotként utánozzuk.
   *(Megjegyzés: a korábbi tervem azt feltételezte, hogy alapból minden nyitva
   van — ez téves volt, a böngésző cáfolta.)*

7. **A Gutenberg PDF-beágyazás rejtve marad.** A `wp-block-file` `<object>`-je
   `hidden` attribútummal jön, és a Gutenberg Interactivity API nyitná ki, ha a
   böngésző tud PDF-et előnézni. Azt a scriptet nem portoljuk; a mentésben is
   0×0-n renderelődik (lemértem). A fájl a két link alatt így is elérhető.

8. **A Divi `et_duplicate_social_icons` blokkja** nincs átvéve.

9. **A WP-widgetek most inertként renderelődnek, nem hiányoznak.** Ez
   **megváltozott** a korábbi döntéshez képest (felhasználói döntés): a
   BetterDocs reakció-lábléc (~213px minden docs oldalon) és a poszt
   megosztás-sávja (~41px) markupja és mérete átkerül, de `href` nélküli
   `<a>`-kból áll — nem link, nem fókuszálható, nem csinál semmit. Az indok:
   eldobva valódi függőleges eltolást okoztak, és „egy widget, ami láthatóan
   nem csinál semmit" közelebb van az eredetihez, mint egy lyuk a helyén.
   Komponensek: `DocsReactions.tsx`, `SharedCounts.tsx`.

10. **Az archív kártya nem kap „nem érhető el" sort.** A blog-modul kártyáján
   van egy „bővebben" link, aminek a helyére a jelzés kerül; az archív kártyán
   nincs ilyen link — a cím egyszerűen nem kattintható —, tehát nincs mit
   helyettesíteni. Egy külön sor mind a 252 elérhetetlen kártyát ~30px-szel
   lejjebb tolná, ezért az állapot az `<article>` `post-unavailable` osztályán
   és `title` attribútumán szerepel, ami nem kerül layoutba.

11. **Az elérhetetlen posztok képe `<a>`-ban marad, `href` nélkül.** Nem link és
    nem fókuszálható, de `<a>` — és ez számít, mert a téma
    `.et_pb_post a img { vertical-align: bottom }` szabálya erre illeszkedik.
    `<span>`-nel a kép visszaesne az alapvonalra, és minden ilyen kártya alá
    ~7px kerülne. (Ez a `PostCard`-ban is javítva lett.)

12. **A csúszka vezérlői `<button>`-ok.** A mentésben `<a href="#">`, amit
    csak a Divi JS-e kezelt. Ugyanaz az akadálymentességi eltérés, mint a 6.6-os
    akkordeonnál, és ugyanaz az ára: a téma `a`-ra kötött deklarációit át kell
    ültetni a gombra (`HeroSliderRuntime.css`). Ugyanott van egy **hozzáadott**
    szabály is, jelölve: a `:focus-within` ugyanúgy előhozza a nyilakat, mint a
    `:hover` — egy fókuszálható, de láthatatlan vezérlő olyan csapda lenne, amit
    a port hozna be, nem az eredeti.

13. **A body per-oldal osztályait a `useBodyClass` rakja ki.** A WordPress
    minden oldalnak adott egy `archive` / `single` / `et_right_sidebar`-féle
    body-osztályt, és a téma **valódi elrendezési döntéseket** köt hozzájuk
    (oldalsáv helye, tartalomoszlop szélessége, listacímek mérete). Egy SPA-nak
    egy `<body>`-ja van, ezért ezek route-váltáskor kerülnek fel és le. A
    minden oldalon közös osztályok (`et-db`, `et_divi_theme`) az `index.html`-ben
    vannak.

---

## 7. Csapdák, amikbe már belefutottam

1. **Bash heredoc megeszi a backslash-t.** Nagy fájlt a Write eszközzel írj,
   ne heredockal; regexben kerüld a backslash-t, ha teheted.

2. **JSX string-attribútum nem dolgoz fel escape-et.** A `walk.ts` `attr()`
   helpere ezért expression-konténerbe teszi az ilyen értékeket.

3. **Az oldalankénti Divi design-CSS ütközik.** A `page-css.ts` minden szabályt
   `.page-<slug>` alá scope-ol — **a formázás előtt**, és **a külső ősök után**
   (lásd 4.3).

4. **A mentés DOM-sorrendje már oszlopokra van osztva.** A blog-listákban a
   Salvattore szétosztotta a kártyákat; az eredeti sorrend a
   `et_pb_blog_item_<feed>_<n>` osztályban van.

5. **A React nem ad ki whitespace-t a mappelt gyerekek között.** Lásd a `{' '}`-eket
   a `Header.tsx`-ben és az `extract.ts` automatikus kibocsátását (4.5).

6. **Ne találj ki CSS-szabályt.** Most már eszköz is van rá: `matched-css.ts` (3.3).

7. **A Chrome ~500px alatt nem enged kisebb ablakot.** `Emulation.setDeviceMetricsOverride`.

8. **Ne futtass két ellenőrzést egyszerre.** Közös böngészőt hajtanak, és az
   eredmények **összekeverednek — nem hibával, hanem hihető, hamis számokkal**:
   a `check-text.ts` „ok"-ot ír olyan oldalakra, amiket a másik futás töltött be.
   Ha egy ismert oldal karakterszáma nem stimmel (a `home` **7908**, nem 1443),
   ez történt: állítsd le mindkettőt, és indíts egyet.
   (Portok: measure 9333, check-text 9388, shot 9366, collect-css 9355,
   matched-css 9377, layout-report 9344.)

9. **A CDP csak az épp érvényes szabályokat adja vissza.** Egy `@media`-n belüli
   szabály láthatatlan, ha a viewport nincs benne. A `docs-css.ts` ezért **hat
   szélességen** járja be az oldalakat — egyetlen szélességen futtatva a teljes
   reszponzív réteg csendben kimaradna.

10. **A stíluslap-ID-k oldalbetöltésenként változnak.** Kaszkád-sorrendhez ne
    saját stíluslap-rangsort építs: a CDP **elemenként már kaszkád-sorrendben**
    adja vissza a szabályokat, arra támaszkodj. (Ezen múlt, hogy a docs oldalak
    paddingje 21px lett 25px helyett.)

11. **A mentés HTML-je mindkét idézőjelet használja.** `name='robots'`
    egyszeressel, `rel="canonical"` duplával — ugyanabban a fájlban. Aki
    attribútumot regexszel olvas ki, `["']`-t írjon. Lásd 4.23.

12. **Ne bízz a regexben, ami „megtalálta" — nézd meg a darabszámot.** A
    robots-regex hibátlanul lefutott, nem dobott hibát, csak 129 helyett 25
    oldalon talált. A generátorok ezért írják ki, **hányból hányat** dolgoztak
    fel, az ellenőrzők pedig ezért olvassák a renderelt oldalt.

13. **A `python - <<'PY'` heredocban a `\s` és `\.` figyelmeztetést ad**, és ami
    rosszabb: ha a mintát TypeScript-forrásba írod, a backslash-ek száma nem az
    lesz, amit vársz. Regexet tartalmazó kódot a Write/Edit eszközzel írj.

---

## 8. Hátralévő munka

A három fázis kész. Ami maradt, az a pixelpontossági kör, plusz két opcionális
tétel (bundle-méret, a mentés hiányosságai).

### 8.1 Fázis 5 — archívumok: **kész**

- `scripts/archives.ts` → `src/data/archives.ts`: **64 archívum** (49 kategória,
  8 dátum, 7 szerző), **253 külön poszt**, **11 lapozó-cél**, ami nincs
  lementve (`olderMissing` / `newerMissing` → inert vezérlő).
- `scripts/posts.ts`: **253 összefoglaló** (75 a blog-modulokból, 178 csak az
  archívumokból), új mezőkkel (`archiveExcerpt`, `archiveImage`, `date`,
  `author`, `id`, `articleClass`). A 75 modul-poszt értékei **bájtra
  változatlanok**, ezért a 13 blog-listás oldal ellenőrzése zöld maradt.
  A generátor **0 dátum- és szerző-ütközést** talált a 64 fájlon — ezért
  kerülhettek ezek a posztra, a feedenként eltérő formátum pedig maradt a
  `FeedItem`-en.
- `ArchiveView` + `ArchiveCard` + `ArchivePagination`, `ArchiveView.css`
  a `collect-css.ts archive` presetből.
- 64 route az adatból képezve; `check-routes.ts` őrzi.
- `check-text.ts` archívum-köre: **64/64 karakterre azonos**.

Geometria 1440px-en (`kategoria/hirek`, `2026/09/15`, `author/galberey`,
`kategoria/egyeb/page/2`): a `#left-area` teljes oszlopa, mind a 12 kártya és a
lapozó **0,0px-re egyezik** pozícióban, szélességben és magasságban. Egyetlen
eltérés a konstans **−1px** függőleges eltolás, ami a 6.1-ben leírt, vállalt
`#page-container` döntés következménye.

### Lefedettség — mi NINCS portolva

A mentésben **345** oldal van (`index.html`-lel rendelkező könyvtár), ebből
**129 van portolva**. A különbség:

| Nincs portolva | Db | Miért |
|---|---|---|
| Blogposzt | 215 | **Felhasználói döntés**: csak 1 kap route-ot, a többi placeholder kártya |
| `hirkezelo` | 1 | **Felhasználói döntés**: bejelentkezési űrlap, backend nélkül nem működhet |

A `dokumentum-cimke/tananyag` korábban hiányzott; **portolva van**. A
`DocTaxonomy.tsx` szolgálja ki a 10 kategória- és az 1 címke-oldalt is (a kettő
csak a fejlécben tér el), és a docs oldalak lábléce is kiírja a dokumentum
címkéit, ahogy a mentés.

### 8.2 Pixelpontosság — hol tart

Mért állapot 1440px-en, **szűk szelektorral** (`measure.ts`), nem az összesítőből:

| Mit | Állapot |
|---|---|
| **Kezdőlap: mind a 8 szekció** | **0,0px** (egy 0,2px kerekítéssel) — 4.21, 4.22 |
| Kezdőlap: galéria, gombok, számlálók, blog-kártyák, záró fejléc | **0,0px** |
| Kezdőlap: `HeroSlider` — konténer, dia, parallax, pöttyök, nyilak | **0,0px** (4.18) |
| Klasszikus oldal: `#left-area`, cikk, oldalsáv | **0,0px** (4.22) |
| 64 archívum: teljes `#left-area` oszlop, kártyák, lapozó | **0,0px** |
| Docs: breadcrumb, fejléc, olvasási idő, tartalom, reakció-lábléc, prev/next | **0,0px** |
| Tanári portrék (`tanari-kar`, `elerhetoseg`, `egeszsegugy`) | **0,0px** |
| Poszt: fejléc, Divi-sor, megosztás-sáv | **0,0px** |
| `/dokumentumtar/` első sor | **0,0px** |
| Hero-szekciók (18 oldal): háttérkép, címszín, magasság | **egyezik** (a 6.1 szerinti 116px szekciódoboz-eltéréssel) |
| Fejléc, főmenü, lenyílók — nyugalomban és görgetve | **0,0px** |
| Kezdőlapi csúszka képei | **váltakoznak**, 700ms keresztúsztatással (4.18) |

Mindenhol ott van a 6.1 szerinti konstans **−1px** függőleges eltolás, és a
builder-oldalakon a `section_0` doboz **116px**-es, vállalt eltérése.

#### Ami ebben a körben megoldódott

- **A tanári portrék 10px-e** és a **blog-kártyák 21,6px-e** ugyanarra vezetett
  vissza: a hiányzó `border-style` alapszabályokra. Lásd 4.9.
- **A képek alapvonal-rése** és a lusta képek összeomlása: 4.10.
- **A hero-szekciók** három külön hibája: a háttérkép sosem másolódott át
  (4.11), a szöveg színe elveszett (4.12), és a kép nyúlt (4.13). Mind javítva;
  a `/nyolcadikos/` most képileg egyezik a mentéssel.
- **A `HeroSlider` becsült CSS-e** lecserélve a mentésből gyűjtöttre
  (`collect-css.ts slider`), majd a csúszka **öt tünete**: 4.18.
- **Az ikonfont rossz részhalmaza**, ami miatt 35 oldalon hiányozhattak glifek:
  4.19.
- **A `Gallery`** — a legrégebbi nyitott tétel, −132,7px: 4.21.
- **A kezdőlap öt további hibája** és a klasszikus oldal 20px-e: 4.22.

#### Még nyitott

- **A maradék 128 oldal végigmérése.** A kezdőlap és a klasszikus oldal
  szekcióról szekcióra meg van mérve, a docs és az archívumok korábban. A többi
  builder-oldalt még senki nem nézte végig — és a kezdőlapon ugyanez a menet
  **öt** külön hibát fogott ki egymás után, tehát nem formalitás.
- **A `#page-container` −1px.** A 6.1 döntés mellékhatása; a felhasználó úgy
  döntött, **maradjon** (az érdemi tartalom pozíciója pontos).
- **Az `Örökös Ökoiskola` logó** a kezdőlapról hiányzik — de **a mentésből is**.
  A helye megvan (`et_pb_column_14`, `_15` üresen), a CSS-ük és az animációs
  adatuk is (`et_pb_image_8`, `_9`), a markupjuk és a képfájljuk viszont nincs
  lementve. A port pontosan azt mutatja, amit a mentés. **Ez nem javítható a
  mentésből**, csak a hiányzó kép beszerzésével.

#### Hogyan keress ilyet — a bevált módszer

Amikor egy doboz mérete eltér, és a nyilvánvaló tulajdonságok (méret, betű,
sortáv) egyeznek, **ne találgass**: diffeld az *összes* számított tulajdonságot.
Ez vezetett el a keret-rejtélyhez másodpercek alatt, miután órákig kerülgettem.

```js
// getComputedStyle(el) iterálható: minden tulajdonság nevét kiadja
const s = getComputedStyle(el); const out = []
for (const p of s) out.push(p + ': ' + s.getPropertyValue(p))
```

Futtasd mindkét oldalon, írd fájlba, `diff`. A `scripts/matched-css.ts` ehhez a
párja: megmondja, **melyik szabály** adja a talált értéket.

#### A `layout-report.ts` korlátja

Van egy összesítő (`scripts/layout-report.ts`), ami oldalanként kiírja a
legnagyobb eltérést. **Ne vedd készpénznek a nagy számait.** Elem-kulcs szerint
párosít (`tag.elsőosztály` + sorszám), és ahol a két DOM nem egy az egyben
felel meg egymásnak — a bejáró néhány szerkesztő-wrappert kilapít —, ott
félrepárosít, és több száz pixeles „eltérést" ír ki, ami nem valódi. A sor
végén lévő `(n unpaired)` jelzi, ha ez fennáll.

Egy ismert, **vállalt** tétel is torzít benne: a `section_0` doboza (6.1) minden
builder-oldalon `dy/dh = 116.0`-t ad. (A docs oldalak korábbi ~213px-es
eltolódása megszűnt — a reakció-lábléc azóta renderelődik, lásd 6.9.)

Amit ténylegesen megmértem, szűk szelektorral, az a 8.2 eleji táblázat. Egy
oldal komolyan vételéhez **a `measure.ts`-t használd szűk szelektorral**, ne az
összesítőt.

#### Hogyan mérj

```bash
node --experimental-strip-types scripts/measure.ts "<szelektor>" \
  http://localhost:8899/<út>/ http://localhost:5173/<út>/ 1440
```
Ha az elemszám eltér, a `measure.ts` szól — általában azért, mert valamit
szándékosan eldobunk (6.), ilyenkor szűkítsd a szelektort.

### 8.3 Bundle-méret

Jelenlegi build (a Vite saját számai):

```
dist/assets/index-*.css   419 kB   (gzip  39 kB)
dist/assets/data-*.js     390 kB   (gzip  68 kB)   a src/data/ alatti indexek
dist/assets/index-*.js    643 kB   (gzip 162 kB)   minden más
```

**Ami megtörtént:** a `vite.config.ts` `manualChunks`-szal külön chunkba teszi a
`src/data/` alatti indexeket. Az **összméret nem változott** — nem is ez volt a
cél —, de a kettő **külön cache-elhető**: az indexek újragenerálása nem
érvényteleníti a komponenseket, és egy komponens szerkesztése nem kényszerít
újra letölteni 376 kB adatot.

**Amit szándékosan nem csináltam meg:** a kivonatok külön `src/data/excerpts.ts`
fájlba emelését, pedig az AGENT.md korábbi változata javasolta. Önmagában **nem
csökkentené, amit a böngésző letölt**, mert semmi nem halasztja el a
betöltésüket: a kivonatokra az `ArchiveCard` és a `PostCard` is támaszkodik,
azaz gyakorlatilag minden tartalmi oldal. Csak akkor fizetne ki, ha előbb
route-szintű lusta betöltés kerülne be.

**Route-szintű `React.lazy` továbbra sem javasolt.** A Suspense-villanás a hűség
rovására megy, és a növekmény amúgy is **adat**: a `posts.ts`-t a `PostCard`, a
`Search`, a `RecentPosts` (a `Sidebar`-ban, tehát majdnem minden oldalon) és az
`ArchiveCard` is importálja, tehát a komponensek szétvágása nem viszi ki az
indexet a közös chunkból.

Ha egyszer mégis szűkíteni kell, ez a sorrend működhet:

1. `React.lazy` **kizárólag a 27 docs oldalra**. Itt a fallback maga a docs
   keret lehet (`<DocsLayout slug={slug} />` gyerek nélkül), ami bájtra azonos a
   betöltött állapottal — ez az egyetlen hely az oldalon, ahol a villanás
   láthatatlanná tehető.
2. **Utána** a kivonatok szétbontása, mert akkor már van, ami elhalasztja őket.

A `public/media` jelenleg **271 MB** (a `.gitignore`-ról a felhasználóval kell
egyeztetni; eddig a „másoljuk be mindet" opciót választotta).

### 8.4 Ismert hiányosságok a mentésben

- **Három hivatkozott fájl nincs lementve** (ellenőrizve):
  `wp-content/uploads/2024/02/Akadalymentesitesi_nyilatkozat_Petrik.pdf`,
  `wp-content/uploads/2023/11/MVSZ_BMSZC Petrik_2023.pdf` és
  `wp-content/uploads/2026/02/Nyelvi-Verseny-–-2026-Februar-1024x675.png`.
  A `copy-assets.ts` figyelmeztet rájuk, de nem áll meg — ez a mentés hiánya,
  nem a porté, és nincs mit tenni vele.
- **11 lapozó-cél** nincs lementve (`page/3/`, `author/{padmin,toth-eva}/page/2/`
  stb.) — az `archives.ts` `*Missing`-gel jelöli őket.
- **`2026/09/` hónap-archívum nincs lementve** (csak a napok), és **év-archívum
  egyáltalán nincs**.
- **Két képmodul markupja és képfájlja hiányzik a kezdőlapról.** Az
  `et_pb_image_8` és `_9` CSS-e és animációs adata benne van a mentésben, a
  14. és 15. oszlop viszont **üresen** van elmentve, és az `uploads` alatt sincs
  hozzájuk tartozó kép. A felhasználó szerint ez az „Örökös Ökoiskola" logó. A
  port ugyanazt a két üres oszlopot rendereli — **ezt a mentésből nem lehet
  pótolni**, csak a kép beszerzésével.
- **Az ikonfont `@font-face`-e abszolút URL-re mutat** (`//petrik.hu/...`), tehát
  a mentés offline **nem éri el**, és a nyers karaktereket rajzolja az ikonok
  helyére. Lásd 4.19 és 6.3 — a port renderje a helyes, ne igazítsd hozzá.
- **Minden `rel="canonical"` href át van írva** relatív útra (`""`,
  `"index.html"`, `"../bemutatkozas/"`), tehát az eredeti abszolút URL mind a
  269-ből eltűnt. Lásd 4.23.
- Néhány archív poszt-slug **percent-kódolt emojit** tartalmaz
  (`%f0%9f%8c%bf-zero-waste-fashion…`). A `resolveUrl` `decodeURI`-t hív, így a
  kulcs emojis lesz — konzisztensen, mert az `archives.ts` és a `posts.ts` is
  ugyanazon megy át. Route nem kell rájuk (mind `available: false`).
