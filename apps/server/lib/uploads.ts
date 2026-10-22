/**
 * Uploads - one multer config shared by the Hírkezelő's featured image
 * (routes/posts.ts), the Szerkesztő's media picker (routes/pages.ts,
 * AGENT.md 6.19) and the Dokumentumtár (routes/library.ts). The bytes are kept
 * in memory just long enough to be written to the database (data/media-repo.ts)
 * and are served from there at /uploads - nothing touches the disk.
 */
import { randomUUID } from 'node:crypto'
import { extname } from 'node:path'
import multer from 'multer'
import { slugify } from '../../../shared/pnw/slug.ts'
import { UPLOADS_URL_PREFIX } from '../config.ts'
import { listImageMedia, putMedia } from '../data/media-repo.ts'
import { mimeFor } from './media.ts'

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
})

/** What an uploaded image may be called - the extension decides the MIME /uploads serves it with. */
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'])

/**
 * Ported from PNW_Actions::handle_featured_image() - re-checks the MIME
 * server-side too. Returns the public URL, or undefined when there was no
 * file or it was not an image.
 */
export async function storeImage(file: Express.Multer.File | undefined): Promise<string | undefined> {
  if (!file) return undefined
  const extension = extname(file.originalname).toLowerCase()
  if (!file.mimetype.startsWith('image/') || !IMAGE_EXTENSIONS.has(extension)) return undefined

  const filename = `${randomUUID()}${extension}`
  putMedia(`${UPLOADS_URL_PREFIX}/${filename}`, mimeFor(filename), file.buffer)
  return `${UPLOADS_URL_PREFIX}/${filename}`
}

export type MediaItem = { url: string; name: string; size: number; modifiedAt: string }

/** Every stored image, newest first. */
export async function listImages(): Promise<MediaItem[]> {
  return listImageMedia(`${UPLOADS_URL_PREFIX}/`).map((item) => ({
    url: item.path,
    name: item.path.slice(UPLOADS_URL_PREFIX.length + 1),
    size: item.size,
    modifiedAt: item.modifiedAt,
  }))
}

/** nginx allows 10 MB per request (apps/client/nginx.conf), so a document stays just under that. */
export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 9 * 1024 * 1024 },
})

/** What the Dokumentumtár accepts - the extension is also what /uploads serves the MIME by. */
const DOCUMENT_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp', '.rtf', '.txt', '.csv', '.zip',
])

/**
 * Stores an uploaded document under a readable name (`alapito-okirat-3f9a1c.pdf`)
 * and returns its public URL, or undefined when there was no file or its type is
 * not allowed. The original name is only a hint - what lands on disk is
 * slugified, so it cannot traverse or shadow anything.
 */
export async function storeDocument(file: Express.Multer.File | undefined): Promise<string | undefined> {
  if (!file) return undefined
  const extension = extname(file.originalname).toLowerCase()
  if (!DOCUMENT_EXTENSIONS.has(extension)) return undefined

  const base = slugify(file.originalname.slice(0, file.originalname.length - extension.length)).slice(0, 60)
  const filename = `${base}-${randomUUID().slice(0, 6)}${extension}`
  putMedia(`${UPLOADS_URL_PREFIX}/${filename}`, mimeFor(filename), file.buffer)
  return `${UPLOADS_URL_PREFIX}/${filename}`
}
