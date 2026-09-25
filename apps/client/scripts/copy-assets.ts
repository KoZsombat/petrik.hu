/**
 * Copies the images, PDFs and the Divi icon font referenced by a set of mirror
 * pages into public/, keeping the original wp-content/uploads layout so the
 * rewritten /media/... URLs line up one-to-one with the originals.
 *
 *   node --experimental-strip-types scripts/copy-assets.ts <page-dir> [...]
 *
 * With no arguments it copies the layout assets only (logo + icon font), which
 * is what every page needs.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, normalize, relative, resolve, sep } from 'node:path'
import { MEDIA_DIR, MIRROR_ROOT, PROJECT_ROOT } from './mirror.ts'

/**
 * Divi's icon font.
 *
 * The theme ships three subsets and picks one per page: `base` on 307 of the
 * mirror's pages, `all` on 35 (the home page among them) and `social` on 3.
 * This port has one @font-face for the whole bundle, so it has to carry the
 * superset - with `base` the slider's arrow glyphs are simply absent and the
 * controls render as blank boxes. 92 KB instead of 6 KB, once, cached.
 */
const ICON_FONT = 'wp-content/themes/Divi/core/admin/fonts/modules/all/modules.woff'

/**
 * Assets every page needs, regardless of which pages are being copied: the
 * header logo, and the four sizes WordPress generated for the site icon. The
 * icons are referenced from index.html rather than from any page's body, and
 * the 270x270 one only ever appeared in a `content=` attribute, so nothing
 * that scans page markup would find them.
 */
const LAYOUT_ASSETS = [
  'wp-content/uploads/2020/08/logo-nagy.png',
  'wp-content/uploads/2020/08/cropped-logo-nagy-32x32.png',
  'wp-content/uploads/2020/08/cropped-logo-nagy-180x180.png',
  'wp-content/uploads/2020/08/cropped-logo-nagy-192x192.png',
  'wp-content/uploads/2020/08/cropped-logo-nagy-270x270.png',
]

/**
 * `data` is here for Gutenberg's file block, which embeds its PDF with
 * <object data="..."> rather than an href - without it that one PDF would be
 * the only referenced file never copied.
 */
const ASSET_RE = /(?:src|href|data)="([^"]+\.(?:png|jpe?g|webp|gif|svg|pdf))"/g

/** Every URL in a srcset, so responsive images keep working. */
const SRCSET_RE = /srcset="([^"]+)"/g

/** `url(...)` inside an inline style attribute in the mirror's HTML. */
const INLINE_URL_RE = /url\(\s*["']?([^)"']+\.(?:png|jpe?g|webp|gif|svg))/g

/** `background-image: url(/media/...)` in a stylesheet this project ships. */
const CSS_URL_RE = /url\(["']?(\/media\/[^)"']+)/g

function assetsIn(pageDir: string): string[] {
  const file = join(MIRROR_ROOT, pageDir, 'index.html')
  if (!existsSync(file)) {
    console.warn(`  ! no such page: ${pageDir}`)
    return []
  }
  const html = readFileSync(file, 'utf8')
  const found = new Set<string>()
  const add = (raw: string) => {
    // Divi writes its inline background-image with HTML entities around the
    // URL - url(&quot;...&quot;) - so they have to come off before the path
    // means anything. That is why the testimonial portrait never copied.
    const url = decodeURIComponent(
      raw.trim().replace(/&quot;|&#0?39;|&apos;/g, '').replace(/&amp;/g, '&'),
    )
    if (!url || url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) return
    // Mirror URLs are relative to the page directory; resolve them to mirror root.
    const abs = normalize(join(MIRROR_ROOT, pageDir, url))
    found.add(relative(MIRROR_ROOT, abs).split(sep).join('/'))
  }
  for (const m of html.matchAll(ASSET_RE)) add(m[1])
  for (const m of html.matchAll(SRCSET_RE)) {
    for (const candidate of m[1].split(',')) add(candidate.trim().split(/\s+/)[0])
  }
  // An inline `style="background-image: url(...)"`, which is how the slider
  // carries its photographs - they are not <img> tags and were missed.
  for (const m of html.matchAll(INLINE_URL_RE)) add(m[1])
  return [...found]
}

function copy(rel: string, targetRoot: string): number {
  const source = join(MIRROR_ROOT, rel)
  if (!existsSync(source) || !statSync(source).isFile()) return 0
  const target = join(targetRoot, rel)
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(source, target)
  return statSync(source).size
}

/**
 * Media the generated stylesheets ask for.
 *
 * A Divi section's background image is never an <img>: it lives in a
 * `background-image: url(...)` inside the page's design stylesheet. Scanning
 * only the HTML therefore misses every one of them - eighteen hero images, one
 * per page, silently absent until someone looked at the page. Reading the CSS
 * the project actually ships catches them regardless of which script wrote it.
 */
function assetsInStyles(): string[] {
  const roots = ['src/pages', 'src/components', 'src/styles']
  const found = new Set<string>()

  const walk = (dir: string) => {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
        continue
      }
      if (!entry.name.endsWith('.css')) continue
      const css = readFileSync(full, 'utf8')
      for (const m of css.matchAll(CSS_URL_RE)) {
        found.add(m[1].replace(/^\/media\//, ''))
      }
    }
  }

  for (const root of roots) walk(resolve(PROJECT_ROOT, root))
  return [...found]
}

const pages = process.argv.slice(2)
let files = 0
let bytes = 0

for (const rel of [...LAYOUT_ASSETS, ...pages.flatMap(assetsIn), ...assetsInStyles()]) {
  const size = copy(rel, MEDIA_DIR)
  if (size) {
    files += 1
    bytes += size
  } else {
    console.warn(`  ! missing asset: ${rel}`)
  }
}

// The icon font lives next to the webfonts, not under /media.
const iconTarget = resolve(PROJECT_ROOT, 'public/fonts/etmodules/modules.woff')
mkdirSync(dirname(iconTarget), { recursive: true })
copyFileSync(join(MIRROR_ROOT, ICON_FONT), iconTarget)

/**
 * BetterDocs' category icon. The crawler saved it as "...svg@v=4.9.2", and a
 * static server hands that out with the wrong content type, which is why the
 * icon is a broken image in the mirror. Copying it to a plain .svg name makes
 * the port render what the live site rendered - the same call as the Divi icon
 * font in AGENT.md section 4.2.
 */
const CATEGORY_ICON =
  'wp-content/plugins/betterdocs/assets/static/admin/images/betterdocs-cat-icon.svg@v=4.9.2'
const categoryIconTarget = resolve(PROJECT_ROOT, 'public/media/betterdocs-cat-icon.svg')
mkdirSync(dirname(categoryIconTarget), { recursive: true })
copyFileSync(join(MIRROR_ROOT, CATEGORY_ICON), categoryIconTarget)

console.log(`assets: ${files} files, ${(bytes / 1048576).toFixed(1)} MB → public/media`)
console.log(`icon font → ${relative(PROJECT_ROOT, iconTarget)}`)
console.log(`docs category icon → ${relative(PROJECT_ROOT, categoryIconTarget)}`)
