import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import './Button.css'

type Props = {
  children: string
  /** In-app route. */
  to?: string
  /** External URL. */
  href?: string
  align?: 'left' | 'center' | 'right'
  /**
   * The ETmodules glyph Divi slides in on hover, taken from the original
   * data-icon attribute. Defaults to Divi's arrow.
   */
  icon?: string
  index: number
}

/** Divi's button module. */
export default function Button({ children, to, href, align = 'left', icon, index }: Props) {
  const className = `et_pb_button et_pb_button_${index} et_pb_bg_layout_light`
  const style = icon ? ({ '--et-button-icon': `'${icon}'` } as CSSProperties) : undefined
  /**
   * The glyph is carried twice on purpose. Button.css reads the custom
   * property, which is how a button with no page design of its own gets its
   * icon; but some pages style their buttons with a rule of Divi's that reads
   * `content: attr(data-icon)` instead, and disables that ::after while doing
   * it. Emitting the attribute as the mirror does keeps both paths working.
   */
  const props = { className, style, 'data-icon': icon }

  return (
    <div
      className={`et_pb_button_module_wrapper et_pb_button_${index}_wrapper et_pb_button_alignment_${align} et_pb_module`}
    >
      {to ? (
        <Link {...props} to={to}>
          {children}
        </Link>
      ) : (
        <a {...props} href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      )}
    </div>
  )
}
