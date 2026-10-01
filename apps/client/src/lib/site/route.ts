/**
 * The router matches `/nyolcadikos` as well as `/nyolcadikos/`; pages are
 * stored and looked up under the mirror's own trailing-slash form.
 */
export function routeKey(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}
