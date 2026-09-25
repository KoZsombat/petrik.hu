/**
 * Image uploads - one multer config shared by the Hírkezelő's featured image
 * (routes/posts.ts) and the Szerkesztő's media picker (routes/pages.ts,
 * AGENT.md 6.19). Both land in UPLOADS_DIR and are served at /uploads.
 */
import { randomUUID } from 'node:crypto'
import { readdir, rename, stat, unlink } from 'node:fs/promises'
import { extname, join } from 'node:path'
import multer from 'multer'
import { UPLOADS_DIR, UPLOADS_URL_PREFIX } from '../config.ts'

export const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 8 * 1024 * 1024 },
})

/** What an uploaded image may be called on disk - the extension decides the MIME /uploads serves it with. */
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'])

/**
 * Ported from PNW_Actions::handle_featured_image() - re-checks the MIME
 * server-side too. Returns the public URL, or undefined when there was no
 * file or it was not an image.
 */
export async function storeImage(file: Express.Multer.File | undefined): Promise<string | undefined> {
  if (!file) return undefined
  if (!file.mimetype.startsWith('image/')) {
    await unlink(file.path).catch(() => {})
    return undefined
  }

  const filename = `${randomUUID()}${extname(file.originalname).toLowerCase() || ''}`
  await rename(file.path, join(UPLOADS_DIR, filename))
  return `${UPLOADS_URL_PREFIX}/${filename}`
}

export type MediaItem = { url: string; name: string; size: number; modifiedAt: string }

/** Every stored image, newest first - multer's own extension-less temp files are not images and are skipped. */
export async function listImages(): Promise<MediaItem[]> {
  const names = await readdir(UPLOADS_DIR).catch(() => [] as string[])
  const items: MediaItem[] = []
  for (const name of names) {
    if (!IMAGE_EXTENSIONS.has(extname(name).toLowerCase())) continue
    const info = await stat(join(UPLOADS_DIR, name))
    items.push({ url: `${UPLOADS_URL_PREFIX}/${name}`, name, size: info.size, modifiedAt: info.mtime.toISOString() })
  }
  return items.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
}
