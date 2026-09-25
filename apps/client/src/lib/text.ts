/**
 * Case- and accent-insensitive comparison key, so "erettsegi" finds
 * "érettségi". Used by the two client-side searches: the site search over the
 * post index and the docs search over the document titles.
 */
export function fold(value: string): string {
  return value
    .toLocaleLowerCase('hu')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}
