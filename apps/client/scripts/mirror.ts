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
 * Root of the scraped WordPress mirror. It lives outside the repo, two levels
 * above the repo root (PROJECT_ROOT is apps/client since the client/server
 * split) — change this single constant if the mirror moves.
 */
export const MIRROR_ROOT = resolve(PROJECT_ROOT, '../../../../mirror/petrik.hu/petrik.hu')

/** Where copied uploads land, mirroring their original wp-content layout. */
export const MEDIA_DIR = resolve(PROJECT_ROOT, 'public/media')

/** Where webfonts land. */
export const FONT_DIR = resolve(PROJECT_ROOT, 'public/fonts')

/** The one blog post that gets a real route; every other post is a placeholder. */
export const SAMPLE_POST_SLUG = 'kutatok-ejszakaja-a-petrikben'
