/**
 * Shared configuration for the one-off migration scripts.
 *
 * These run under `node --experimental-strip-types` (Node 24) and never ship in
 * the browser bundle; `node-html-parser` is a devDependency for the same reason.
 */
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** The client app's root (apps/client), derived from this file's location. */
export const PROJECT_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')

/**
 * Root of the scraped WordPress mirror. It lives outside the repo; set the
 * `PETRIK_MIRROR` environment variable to wherever it is on this machine
 * (the directory holding the mirror's top-level `index.html`). The fallback is
 * the mirror's old location, two levels above the repo root.
 */
export const MIRROR_ROOT = process.env.PETRIK_MIRROR
  ? resolve(process.env.PETRIK_MIRROR)
  : resolve(PROJECT_ROOT, '../../../../mirror/petrik.hu/petrik.hu')

/** Where copied uploads land, mirroring their original wp-content layout. */
export const MEDIA_DIR = resolve(PROJECT_ROOT, 'public/media')

/** Where webfonts land. */
export const FONT_DIR = resolve(PROJECT_ROOT, 'public/fonts')
