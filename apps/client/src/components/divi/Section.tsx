import type { CSSProperties, ReactNode } from 'react'
import './Section.css'

type Props = {
  /** Optional: the mirror does contain empty sections, e.g. on docs/6360. */
  children?: ReactNode
  /**
   * Divi numbers every section on a page (et_pb_section_0, _1, …) and targets
   * those classes from the page's generated design stylesheet.
   */
  index: number
  /** Adds Divi's `et_pb_section_first` modifier. */
  first?: boolean
  /** Edge dividers; the shape and colour come from the page's design CSS. */
  dividerTop?: boolean
  dividerBottom?: boolean
  /** A section whose modules span the viewport instead of sitting in a row. */
  fullwidth?: boolean
  /**
   * Divi marks a section that has a background image. The class carries
   * `background-size: cover`, so without it the image stretches to the full
   * width instead of covering the box.
   */
  withBackground?: boolean
  className?: string
  /** Only the Szerkesztő passes this - a background picked in the editor (AGENT.md 6.19). */
  style?: CSSProperties
}

/**
 * A Divi page-builder section: the outermost band of a page. Emits the original
 * class names so the ported theme and design CSS apply unchanged.
 */
export default function Section({
  children,
  index,
  first = false,
  dividerTop = false,
  dividerBottom = false,
  fullwidth = false,
  withBackground = false,
  className,
  style,
}: Props) {
  const classes = ['et_pb_section', `et_pb_section_${index}`]
  if (withBackground) classes.push('et_pb_with_background')
  if (fullwidth) classes.push('et_pb_fullwidth_section')
  classes.push('et_section_regular')
  if (dividerTop || dividerBottom) classes.push('section_has_divider')
  if (dividerTop) classes.push('et_pb_top_divider')
  if (dividerBottom) classes.push('et_pb_bottom_divider')
  if (first) classes.push('et_pb_section_first')
  if (className) classes.push(className)

  return (
    <div className={classes.join(' ')} style={style}>
      {dividerTop && <div className="et_pb_top_inside_divider" />}
      {children}
      {dividerBottom && <div className="et_pb_bottom_inside_divider" />}
    </div>
  )
}
