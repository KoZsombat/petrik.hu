import type { PageDocument } from '../../../../../shared/pnw/page-types.ts'

type LinkOption = NonNullable<PageDocument['linkOptions']>[number]

/**
 * Divi's "link options": a module, row or column that opens a URL when clicked
 * anywhere on it (the original marked it `et_clickable`). The links inside it
 * keep working as they are. Returns the cleanup for useEffect.
 *
 * `navigate` is used for the site's own pages, so they open without a reload;
 * anything else opens in the target the original asked for.
 */
export function applyLinkOptions(
  options: LinkOption[] | undefined,
  navigate: (path: string) => void,
): () => void {
  if (!options?.length) return () => {}
  const cleanups: (() => void)[] = []

  const open = (option: LinkOption) => {
    if (option.url.startsWith('/') && !option.url.startsWith('//') && !option.url.startsWith('/media/')) {
      navigate(option.url)
    } else if (option.target === '_blank') {
      window.open(option.url, '_blank', 'noopener,noreferrer')
    } else {
      window.location.assign(option.url)
    }
  }

  for (const option of options) {
    const element = document.querySelector<HTMLElement>(`#main-content .${option.class}, #betterdocs-single-content .${option.class}`)
    if (!element) continue
    element.classList.add('et_clickable')
    element.setAttribute('role', 'link')
    element.tabIndex = 0

    const onClick = (event: MouseEvent) => {
      // A link or button inside the module does its own thing.
      if ((event.target as HTMLElement).closest('a, button')) return
      open(option)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.target === element && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        open(option)
      }
    }
    element.addEventListener('click', onClick)
    element.addEventListener('keydown', onKey)
    cleanups.push(() => {
      element.removeEventListener('click', onClick)
      element.removeEventListener('keydown', onKey)
      element.classList.remove('et_clickable')
      element.removeAttribute('role')
      element.removeAttribute('tabindex')
    })
  }
  return () => cleanups.forEach((cleanup) => cleanup())
}
