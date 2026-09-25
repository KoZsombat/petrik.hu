import { useEffect, useRef, useState } from 'react'
import './NumberCounter.css'

type Props = {
  /** The figure to count up to. */
  value: number
  title: string
  /** Suffix Divi appends, typically "%" or nothing. */
  suffix?: string
  index: number
}

const DURATION_MS = 1200

/**
 * Divi's number counter, which counts up when scrolled into view.
 *
 * The number itself is what the markup contains, so it is correct before any
 * script runs and for anyone who never scrolls past it. The count-up is an
 * enhancement layered on top: once the counter first enters the viewport it
 * restarts from zero and animates, exactly as the original did — and it is
 * skipped for visitors who asked for reduced motion.
 */
export default function NumberCounter({ value, title, suffix = '', index }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  // null means "show the real number"; a number means an animation is running.
  const [animated, setAnimated] = useState<number | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const step = (now: number) => {
          const progress = Math.min((now - start) / DURATION_MS, 1)
          // Ease out, so the last digits settle rather than snap.
          setAnimated(progress < 1 ? Math.round(value * (1 - (1 - progress) ** 3)) : null)
          if (progress < 1) frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
      },
      { threshold: 0.4 },
    )
    observer.observe(node)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return (
    <div
      ref={ref}
      className={`et_pb_module et_pb_number_counter et_pb_number_counter_${index} et_pb_text_align_center et_pb_bg_layout_light et_pb_with_title active`}
      data-number-value={value}
    >
      <div className="percent">
        <p>
          <span className="percent-value">{animated ?? value}</span>
          <span className="percent-sign">{suffix}</span>
        </p>
      </div>
      <h3 className="title">{title}</h3>
    </div>
  )
}
