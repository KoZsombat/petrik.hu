import { useEffect, useState } from 'react'
import './HeroSlider.css'
import './HeroSliderRuntime.css'

export type Slide = {
  /** Background photograph. */
  image: string
  heading?: string
  text?: string
}

type Props = {
  slides: Slide[]
  index: number
  /** Milliseconds between automatic advances; 0 turns autoplay off. */
  intervalMs?: number
  /**
   * The inline padding-top Divi's script wrote onto every slide, verbatim from
   * the mirror (`data-fix-page-container="on"`). On a page whose first module
   * is a fullwidth slider the theme does not push the page body below the fixed
   * header - it lets the photograph run up behind the transparent header and
   * pads the slide's own content instead. Layout.css takes the page container's
   * offset off again when a slide carries the attribute.
   */
  headerOffset?: string
}

/**
 * How long one slide takes to cross-fade into the next.
 *
 * Divi's default is 500ms, but `et_pb_slider_init` overrides it to 700 for
 * every `.et_pb_slide` slider before handing the options to the plugin
 * (`Divi/js/scripts.min.js`, `fade_speed: 700`).
 */
const FADE_MS = 700

type State = {
  active: number
  /** The slide fading out, or null when nothing is in flight. */
  leaving: number | null
}

/**
 * Divi's fullwidth slider.
 *
 * The original was driven by Divi's jQuery slider with a parallax background.
 * This keeps the same markup and look with React state and two timers, pauses
 * while the pointer is over it, and stops autoplay entirely for visitors who
 * asked for reduced motion.
 *
 * Which slide shows is an inline `display`, because that is the one thing the
 * theme's CSS cannot express: `.et_pb_slider .et_pb_slide` is `display: none`
 * and `:first-child` is `display: list-item`, so any state the port keeps in a
 * class would lose to those two rules and slide 0 would show for ever. Divi's
 * script set the same two inline values.
 *
 * The change itself is a cross-fade, and the original's shape is worth keeping
 * in mind because it is not a simple swap: both slides are on screen at once,
 * the outgoing one raised to `z-index: 2` and fading to 0 while the incoming
 * one fades up underneath it, and only then is the outgoing one hidden. That is
 * why `leaving` is state rather than something the CSS could infer.
 */
export default function HeroSlider({
  slides,
  index,
  intervalMs = 7000,
  headerOffset,
}: Props) {
  const [{ active, leaving }, setState] = useState<State>({ active: 0, leaving: null })
  const [paused, setPaused] = useState(false)
  const count = slides.length

  /*
   * Divi re-armed a `setTimeout` after every move rather than running a steady
   * interval, so a manual click also postpones the next automatic advance.
   * Keying the effect on `active` reproduces that.
   */
  useEffect(() => {
    if (count < 2 || !intervalMs || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setTimeout(() => {
      setState((current) => ({ active: (current.active + 1) % count, leaving: current.active }))
    }, intervalMs)
    return () => window.clearTimeout(timer)
  }, [active, count, intervalMs, paused])

  /* Take the outgoing slide out of the flow once it has finished fading. */
  useEffect(() => {
    if (leaving === null) return
    const timer = window.setTimeout(
      () => setState((current) => ({ ...current, leaving: null })),
      FADE_MS,
    )
    return () => window.clearTimeout(timer)
  }, [leaving])

  const go = (next: number) =>
    setState((current) => {
      const target = ((next % count) + count) % count
      return target === current.active ? current : { active: target, leaving: current.active }
    })

  /*
   * The theme centres the arrows on the whole slider with `margin-top: -24px`,
   * half their height. When the slide is padded clear of the fixed header the
   * visible half is lower, and Divi's script rewrote the margin to suit - it is
   * the same centring, shifted by half the header offset.
   */
  const arrowStyle = headerOffset
    ? { marginTop: `calc(-24px + ${headerOffset} / 2)` }
    : undefined

  const classes = [
    'et_pb_module',
    `et_pb_fullwidth_slider_${index}`,
    'et_pb_slider',
    'et_slider_auto',
    `et_slider_speed_${intervalMs}`,
    'et_pb_bg_layout_dark',
  ]

  return (
    <div
      className={classes.join(' ')}
      data-active-slide={`et_pb_slide_${active}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="et_pb_slides">
        {slides.map((slide, position) => {
          const isActive = position === active
          const isLeaving = position === leaving
          const slideClasses = [
            'et_pb_slide',
            `et_pb_slide_${position}`,
            'et_pb_section_parallax',
            'et_pb_bg_layout_dark',
            'et_pb_media_alignment_center',
          ]
          if (isActive) slideClasses.push('et-pb-active-slide')
          // Divi's own two class names for the slide on its way out.
          if (isLeaving) slideClasses.push('et-pb-moved-slide', 'et_slide_transition')
          // The port's own: the incoming slide only fades when one is leaving,
          // so the first paint is not an animation the original never played.
          if (isActive && leaving !== null) slideClasses.push('et_slide_entering')

          return (
            <div
              key={slide.image}
              className={slideClasses.join(' ')}
              data-slide-id={`et_pb_slide_${position}`}
              data-fix-page-container={headerOffset ? 'on' : undefined}
              style={{
                paddingTop: headerOffset,
                display: isActive || isLeaving ? 'list-item' : 'none',
                zIndex: isLeaving ? 2 : 1,
              }}
            >
              <span className="et_parallax_bg_wrap">
                <span
                  className="et_parallax_bg et_pb_parallax_css"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
              </span>
              <div className="et_pb_container clearfix">
                <div className="et_pb_slider_container_inner">
                  <div className="et_pb_slide_description">
                    {slide.heading && <h2 className="et_pb_slide_title">{slide.heading}</h2>}
                    {slide.text && <div className="et_pb_slide_content">{slide.text}</div>}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {count > 1 && (
        <>
          <div className="et-pb-slider-arrows">
            <button
              type="button"
              className="et-pb-arrow-prev"
              aria-label="Előző"
              style={arrowStyle}
              onClick={() => go(active - 1)}
            >
              <span>Előző</span>
            </button>
            <button
              type="button"
              className="et-pb-arrow-next"
              aria-label="Következő"
              style={arrowStyle}
              onClick={() => go(active + 1)}
            >
              <span>Következő</span>
            </button>
          </div>
          <div className="et-pb-controllers">
            {slides.map((slide, position) => (
              <button
                key={slide.image}
                type="button"
                className={position === active ? 'et-pb-active-control' : undefined}
                aria-label={`${position + 1}. dia`}
                aria-current={position === active}
                onClick={() => go(position)}
              >
                {position + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
