import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Divi numbers rows per page so the design stylesheet can target them. */
  index: number
  /**
   * Divi's gutter width. The site default is 3; individual rows opt into 4,
   * which widens the space between columns; 2 narrows it.
   */
  gutters?: 2 | 3 | 4
  /** Divi's "equal height" columns: the row is a flex container. */
  equalColumns?: boolean
  className?: string
}

/** A row inside a Divi section. Columns are its direct children. */
export default function Row({ children, index, gutters = 3, equalColumns = false, className }: Props) {
  const classes = ['et_pb_row', `et_pb_row_${index}`, `et_pb_gutters${gutters}`]
  if (equalColumns) classes.push('et_pb_equal_columns')
  if (className) classes.push(className)
  return <div className={classes.join(' ')}>{children}</div>
}
