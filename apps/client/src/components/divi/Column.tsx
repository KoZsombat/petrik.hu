import { Children, type ReactNode } from 'react'
import type { ColumnSpan } from '../../../../../shared/pnw/page-types.ts'

/**
 * Divi's column widths, named as fractions of the row. Defined in
 * shared/pnw/page-types.ts so the Szerkesztő's document model (which the
 * server validates too) can use it without shared/ importing from src/.
 */
export type { ColumnSpan }

type Props = {
  children?: ReactNode
  span: ColumnSpan
  /** Divi numbers columns per page so the design stylesheet can target them. */
  index: number
  /** Marks the last column in a row, which drops its right margin. */
  last?: boolean
  className?: string
}

/**
 * A column inside a Divi row. An empty column is a real thing in Divi layouts —
 * it is used as a spacer — so it keeps its `et_pb_column_empty` modifier.
 */
export default function Column({ children, span, index, last = false, className }: Props) {
  const isEmpty = Children.count(children) === 0
  const classes = [
    'et_pb_column',
    `et_pb_column_${span}`,
    `et_pb_column_${index}`,
    'et_pb_css_mix_blend_mode_passthrough',
  ]
  if (isEmpty) classes.push('et_pb_column_empty')
  if (last) classes.push('et-last-child')
  if (className) classes.push(className)

  return <div className={classes.join(' ')}>{children}</div>
}
