/**
 * Plays the entrance animations of the modules on the page (animations.css).
 *
 * Divi waited for the window `load` event and then started each module as it
 * came into view; the content itself is on screen from the first paint, only
 * the reveal is animated. A finished module drops `et_animated`, as Divi's did,
 * so it takes part in the layout as any other from then on.
 *
 * Returns the cleanup for useEffect.
 */
export function runModuleAnimations(): () => void {
  const modules = Array.from(document.querySelectorAll<HTMLElement>('.et_animated'))
  if (modules.length === 0) return () => {}

  const finish = (element: HTMLElement) => {
    element.classList.remove('et_animated', 'et_is_animating')
    element.classList.add('et_had_animation')
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    modules.forEach(finish)
    return () => {}
  }

  let observer: IntersectionObserver | undefined
  const start = () => {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const element = entry.target as HTMLElement
          observer?.unobserve(element)
          element.classList.add('et_is_animating')
          element.addEventListener('animationend', () => finish(element), { once: true })
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    modules.forEach((element) => observer?.observe(element))
  }

  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })

  return () => {
    window.removeEventListener('load', start)
    observer?.disconnect()
  }
}
