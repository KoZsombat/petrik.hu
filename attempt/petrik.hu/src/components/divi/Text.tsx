import type { ReactNode } from 'react'
import './Text.css'

export type TextAlign = 'left' | 'center' | 'right' | 'justified'

type Props = {
  /** Divi allows an empty text module; the site uses one as a spacer. */
  children?: ReactNode
  align?: TextAlign
  /**
   * Divi numbers every text module on a page (et_pb_text_0, et_pb_text_1, …)
   * and targets those classes from the page's generated design stylesheet.
   * Passing the index keeps those per-module overrides working.
   */
  index: number
  /**
   * Divi marks whether a module sits on a light or a dark background, and the
   * theme colours the text from it - white on dark. Hard-coding `light` turned
   * every hero subtitle grey against its photo.
   */
  bgLayout?: 'light' | 'dark'
  className?: string
}

/** Divi's text module: a styled wrapper around a block of prose. */
export default function Text({
  children,
  align = 'left',
  index,
  bgLayout = 'light',
  className,
}: Props) {
  const classes = [
    'et_pb_module',
    'et_pb_text',
    `et_pb_text_${index}`,
    `et_pb_text_align_${align}`,
    `et_pb_bg_layout_${bgLayout}`,
  ]
  if (className) classes.push(className)

  return (
    <div className={classes.join(' ')}>
      <div className="et_pb_text_inner">{children}</div>
    </div>
  )
}
