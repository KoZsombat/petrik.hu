import { Children, type ReactNode } from 'react'

/** Divi's column widths, named as fractions of the row. */
export type ColumnSpan = '4_4' | '3_4' | '2_3' | '3_5' | '2_5' | '1_2' | '1_3' | '1_4' | '1_5' | '1_6'

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
