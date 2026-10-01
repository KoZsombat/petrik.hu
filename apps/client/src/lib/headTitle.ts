import { heads } from '../data/head.ts'

/** A mirrored page's name for lists and as an editor's starting title: its <title> without the site suffix. */
export function mirroredTitle(route: string): string {
  const title = heads[route]?.title ?? route
  return title.replace(/\s*[|–-]\s*petrik\.hu$/i, '') || route
}
