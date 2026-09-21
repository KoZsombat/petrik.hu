/**
 * Collects post summaries from the mirror and writes them to src/data/posts.ts.
 *
 * Two passes, in this order:
 *
 *  1. the blog modules embedded in the Divi pages, which is where the feeds get
 *     their cards from;
 *  2. the 64 category, date and author archives, which list far more posts and
 *     carry two things the modules do not - the author and a date in the
 *     theme's own format.
 *
 * The module pass runs first and is never overwritten, so the pages that were
 * already checked character for character keep rendering exactly what they did.
 * Where the two sources disagree - and for the excerpt and the thumbnail they
 * often do - the archive's version is kept beside the module's rather than
 * replacing it.
 *
 * Only one post is in scope for a real route (see SAMPLE_POST_SLUG); every
 * other entry is marked `available: false` so the cards can say plainly that it
 * is not part of the snapshot, rather than linking into a 404.
 *
 *   node --experimental-strip-types scripts/posts.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parse, type HTMLElement } from 'node-html-parser'
import { MIRROR_ROOT, PROJECT_ROOT, SAMPLE_POST_SLUG } from './mirror.ts'
import { resolveUrl, rewriteUrl } from './extract.ts'
import { archives } from '../src/data/archives.ts'

/** Pages whose Divi layout embeds a blog module. */
const PAGES = [
  '',
  'allas',
  'ebed',
  'egeszsegugy',
  'erettsegi-vizsga',
  'in-memoriam',
  'kozoktatas',
  'nyari-gyakorlatok',
  'nyolcadikos',
  'orokos-okoiskola',
  'projekt',
  'szakmai-vizsga',
  'technikusi-kepzesek',
]

type Image = {
  src: string
  alt: string
  srcSet?: string
  sizes?: string
  width?: number
  height?: number
}

type Summary = {
  slug: string
  title: string
  excerpt: string
  archiveExcerpt?: string
  categories: { label: string; to: string }[]
  image?: Image
  archiveImage?: Image
  date?: string
  author?: { name: string; to: string }
  id?: number
  articleClass?: string
  available: boolean
}

const q = (value: string) => JSON.stringify(value)

/** Turns "/valami/" into the bare slug "valami". */
function slugOf(href: string): string {
  return href.replace(/^\//, '').replace(/\/$/, '')
}

const posts = new Map<string, Summary>()
const problems: string[] = []
const report = (message: string) => {
  problems.push(message)
  console.error(`  ! ${message}`)
}

/** Reads an <img> into the shape src/data/posts.ts stores. */
function imageOf(img: HTMLElement | null, rewrite: (url: string) => string): Image | undefined {
  if (!img) return undefined
  const srcset = img.getAttribute('srcset')
  return {
    src: rewrite(img.getAttribute('src') ?? ''),
    alt: img.getAttribute('alt') ?? '',
    ...(srcset
      ? {
          srcSet: srcset
            .split(',')
            .map((part) => {
              const [url, size] = part.trim().split(/\s+/)
              return `${rewrite(url)}${size ? ' ' + size : ''}`
            })
            .join(', '),
        }
      : {}),
    ...(img.getAttribute('sizes') ? { sizes: img.getAttribute('sizes') as string } : {}),
    ...(img.getAttribute('width') ? { width: Number(img.getAttribute('width')) } : {}),
    ...(img.getAttribute('height') ? { height: Number(img.getAttribute('height')) } : {}),
  }
}

/* -- pass 1: the blog modules --------------------------------------------- */

for (const dir of PAGES) {
  const depth = dir === '' ? 0 : dir.split('/').length
  const root = parse(readFileSync(join(MIRROR_ROOT, dir, 'index.html'), 'utf8'))

  for (const article of root.querySelectorAll('article.et_pb_post')) {
    const titleLink = article.querySelector('.entry-title a')
    if (!titleLink) continue
    const slug = slugOf(rewriteUrl(titleLink.getAttribute('href') ?? '', depth))
    if (!slug || posts.has(slug)) continue

    const meta = article.querySelector('.post-meta')
    const categories = (meta?.querySelectorAll('a') ?? [])
      .map((a) => ({
        label: a.text.trim(),
        to: rewriteUrl(a.getAttribute('href') ?? '', depth),
      }))
      .filter((cat) => cat.to.startsWith('/kategoria/'))

    const summary: Summary = {
      slug,
      title: titleLink.text.trim(),
      excerpt: article.querySelector('.post-content-inner')?.text.trim() ?? '',
      categories,
      available: slug === SAMPLE_POST_SLUG,
    }

    const image = imageOf(article.querySelector('.et_pb_image_container img'), (url) =>
      rewriteUrl(url, depth),
    )
    if (image) summary.image = image

    posts.set(slug, summary)
  }
}

const fromModules = posts.size

/* -- pass 2: the archives -------------------------------------------------- */

for (const archive of Object.values(archives)) {
  const dir = archive.route.replace(/^\/|\/$/g, '')
  const root = parse(readFileSync(join(MIRROR_ROOT, dir, 'index.html'), 'utf8'))
  const rewrite = (url: string) => resolveUrl(url, dir)

  for (const article of root.querySelectorAll('#left-area article.et_pb_post')) {
    const titleLink = article.querySelector('.entry-title a')
    if (!titleLink) continue
    const slug = slugOf(rewrite(titleLink.getAttribute('href') ?? ''))
    if (!slug) continue

    const meta = article.querySelector('.post-meta')
    const authorLink = meta?.querySelector('.author.vcard a')
    const author = authorLink
      ? { name: authorLink.text.trim(), to: rewrite(authorLink.getAttribute('href') ?? '') }
      : undefined
    const date = meta?.querySelector('.published')?.text.trim()

    // The excerpt is a bare text node after the meta paragraph - the theme
    // wraps it in nothing at all - so it is read off the article's own
    // children rather than queried for.
    const excerpt = article.childNodes
      .filter((node) => node.nodeType === 3)
      .map((node) => node.text)
      .join('')
      .replace(/\s+/g, ' ')
      .trim()

    const categories = (meta?.querySelectorAll('a[rel="category tag"]') ?? []).map((a) => ({
      label: a.text.trim(),
      to: rewrite(a.getAttribute('href') ?? ''),
    }))

    const existing = posts.get(slug)
    const summary: Summary = existing ?? {
      slug,
      title: titleLink.text.trim(),
      excerpt,
      categories,
      available: slug === SAMPLE_POST_SLUG,
    }

    // Every archive prints the same date and the same author for a post, so
    // these belong on the post. The feeds are the ones that disagree, and
    // their formatting stays on FeedItem where it always was. If that ever
    // stops being true the design is wrong, so say so rather than pick one.
    if (date) {
      if (summary.date && summary.date !== date) {
        report(`${slug}: date is "${summary.date}" in one archive and "${date}" in ${dir}`)
      }
      summary.date = date
    }
    if (author) {
      if (summary.author && summary.author.name !== author.name) {
        report(`${slug}: author is "${summary.author.name}" and "${author.name}" in ${dir}`)
      }
      summary.author = author
    }

    // WordPress renders the excerpt differently from the Divi module - it
    // keeps a space where a paragraph break was - so both are kept.
    if (existing) {
      if (excerpt && excerpt !== existing.excerpt) summary.archiveExcerpt = excerpt
    }
    if (!summary.categories.length) summary.categories = categories

    const image = imageOf(article.querySelector('.entry-featured-image-url img'), rewrite)
    // A different upload, not a different size of the same one.
    if (image) summary.archiveImage = image

    const id = Number(/post-([0-9]+)/.exec(article.getAttribute('id') ?? '')?.[1] ?? 0)
    if (id) summary.id = id
    summary.articleClass = article.getAttribute('class') ?? ''

    posts.set(slug, summary)
  }
}

/* -- write ----------------------------------------------------------------- */

function printImage(name: string, image: Image | undefined): string[] {
  if (!image) return []
  const fields = [`src: ${q(image.src)}`, `alt: ${q(image.alt)}`]
  if (image.srcSet) fields.push(`srcSet: ${q(image.srcSet)}`)
  if (image.sizes) fields.push(`sizes: ${q(image.sizes)}`)
  if (image.width) fields.push(`width: ${image.width}`)
  if (image.height) fields.push(`height: ${image.height}`)
  return [`    ${name}: { ${fields.join(', ')} },`]
}

const entries = [...posts.values()]
  .sort((a, b) => a.slug.localeCompare(b.slug, 'hu'))
  .map((post) => {
    const categories = post.categories
      .map((cat) => `{ label: ${q(cat.label)}, to: ${q(cat.to)} }`)
      .join(', ')
    return [
      `  ${q(post.slug)}: {`,
      `    slug: ${q(post.slug)},`,
      `    title: ${q(post.title)},`,
      `    excerpt: ${q(post.excerpt)},`,
      ...(post.archiveExcerpt ? [`    archiveExcerpt: ${q(post.archiveExcerpt)},`] : []),
      `    categories: [${categories}],`,
      ...printImage('image', post.image),
      ...printImage('archiveImage', post.archiveImage),
      ...(post.date ? [`    date: ${q(post.date)},`] : []),
      ...(post.author
        ? [`    author: { name: ${q(post.author.name)}, to: ${q(post.author.to)} },`]
        : []),
      ...(post.id ? [`    id: ${post.id},`] : []),
      ...(post.articleClass ? [`    articleClass: ${q(post.articleClass)},`] : []),
      `    available: ${post.available},`,
      '  },',
    ].join('\n')
  })

const available = [...posts.values()].filter((post) => post.available).length

const source = [
  '/**',
  ' * Post summaries, collected from the blog modules embedded in the mirrored',
  ' * pages and from the category, date and author archives.',
  ' * Generated by scripts/posts.ts - do not edit by hand.',
  ' *',
  ' * `available` marks the one post that is part of this port and therefore has',
  ' * a route of its own. Everything else is shown as a card that says so, so no',
  ' * link leads to a silent 404.',
  ' *',
  " * The two sources word things differently, so both readings are kept: a Divi",
  ' * blog module drops the space at a paragraph break that WordPress keeps, and',
  ' * the two pick different thumbnails - not two sizes of one file, two files.',
  ' *',
  ' * Dates are the exception that proves the rule. `date` here is the one every',
  ' * archive printed, and it is the same everywhere. The feeds are what vary:',
  ' * Divi let each blog module choose its own format, so one page renders a post',
  ' * as "2025 aug 12" and another as "aug 12, 2025". That still lives on the',
  ' * feed - see FeedItem in components/divi/PostCard.tsx.',
  ' */',
  '',
  'export type PostImage = {',
  '  src: string',
  '  alt: string',
  '  srcSet?: string',
  '  sizes?: string',
  '  width?: number',
  '  height?: number',
  '}',
  '',
  'export type PostSummary = {',
  '  slug: string',
  '  title: string',
  '  /** As a Divi blog module renders it. */',
  '  excerpt: string',
  '  /** As a WordPress archive renders it, when the two differ. */',
  '  archiveExcerpt?: string',
  '  categories: { label: string; to: string }[]',
  "  /** The blog module's thumbnail. */",
  '  image?: PostImage',
  "  /** The archive's thumbnail, which is a different upload. */",
  '  archiveImage?: PostImage',
  '  /** The date every archive printed for this post. */',
  '  date?: string',
  '  author?: { name: string; to: string }',
  '  /** WordPress post id, which the archive markup prints as id="post-N". */',
  '  id?: number',
  "  /** The archive article's class list, verbatim. */",
  '  articleClass?: string',
  '  /** False when the post was not captured in the snapshot. */',
  '  available: boolean',
  '}',
  '',
  'export const posts: Record<string, PostSummary> = {',
  ...entries,
  '}',
  '',
  '/** Looks a post up by slug, returning undefined when it was never captured. */',
  'export function postBySlug(slug: string): PostSummary | undefined {',
  '  return posts[slug]',
  '}',
  '',
]

const out = resolve(PROJECT_ROOT, 'src/data/posts.ts')
writeFileSync(out, source.join('\n'), 'utf8')
console.log(
  `posts: ${posts.size} summaries (${fromModules} from blog modules, ` +
    `${posts.size - fromModules} only in archives, ${available} available) -> src/data/posts.ts`,
)
if (problems.length) process.exit(1)
