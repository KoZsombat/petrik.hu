/**
 * Every file the site serves that is not code: the mirrored images and PDFs
 * (`/media/...`) and everything uploaded through the Hírkezelő and the
 * Szerkesztő (`/uploads/...`), as rows of one table. The repo and the Docker
 * images carry no media; the database is the single place it lives, so a
 * backup of the database is a backup of the whole site.
 *
 * Keys are the public URL path, NFC-normalised (a macOS filesystem hands out
 * decomposed accents, a browser asks for composed ones).
 */
import { db } from './db.ts'

export type MediaFile = { path: string; mime: string; size: number; modifiedAt: string; data: Buffer }

export function mediaKey(path: string): string {
  return path.normalize('NFC')
}

const insert = db.prepare(`
  INSERT INTO media_files (path, mime, size, modified_at, data)
  VALUES (@path, @mime, @size, @modified_at, @data)
  ON CONFLICT(path) DO UPDATE SET mime = excluded.mime, size = excluded.size, modified_at = excluded.modified_at, data = excluded.data
`)
const insertIfMissing = db.prepare(`
  INSERT OR IGNORE INTO media_files (path, mime, size, modified_at, data)
  VALUES (@path, @mime, @size, @modified_at, @data)
`)
const selectFile = db.prepare('SELECT path, mime, size, modified_at, data FROM media_files WHERE path = ?')
const selectExists = db.prepare('SELECT 1 FROM media_files WHERE path = ?')
const selectList = db.prepare(
  'SELECT path, size, modified_at FROM media_files WHERE path LIKE @prefix ESCAPE \'\\\' AND mime LIKE \'image/%\' ORDER BY modified_at DESC',
)

export function putMedia(path: string, mime: string, data: Buffer, modifiedAt = new Date().toISOString()): void {
  insert.run({ path: mediaKey(path), mime, size: data.length, modified_at: modifiedAt, data })
}

/** For seeding: never overwrites what is already stored (an edit made through the site wins). */
export function putMediaIfMissing(path: string, mime: string, data: Buffer, modifiedAt: string): boolean {
  return insertIfMissing.run({ path: mediaKey(path), mime, size: data.length, modified_at: modifiedAt, data }).changes > 0
}

export function hasMedia(path: string): boolean {
  return selectExists.get(mediaKey(path)) !== undefined
}

export function getMedia(path: string): MediaFile | null {
  const row = selectFile.get(mediaKey(path)) as
    | { path: string; mime: string; size: number; modified_at: string; data: Buffer }
    | undefined
  return row ? { path: row.path, mime: row.mime, size: row.size, modifiedAt: row.modified_at, data: row.data } : null
}

/** Images stored under a URL prefix, newest first - no file contents. */
export function listImageMedia(prefix: string): { path: string; size: number; modifiedAt: string }[] {
  const rows = selectList.all({ prefix: `${prefix.replace(/[\\%_]/g, '\\$&')}%` }) as {
    path: string
    size: number
    modified_at: string
  }[]
  return rows.map((row) => ({ path: row.path, size: row.size, modifiedAt: row.modified_at }))
}
