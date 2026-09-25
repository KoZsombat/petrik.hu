import { Link } from 'react-router-dom'
import type { MenuItem } from '../data/site.ts'

type Props = {
  items: MenuItem[]
  /** Nested levels carry WordPress's "children" class; the root level does not. */
  nested?: boolean
}

/**
 * The nested category list in the footer, as WordPress's category widget
 * renders it — up to three levels deep.
 */
export default function CategoryTree({ items, nested = false }: Props) {
  return (
    <ul className={nested ? 'children' : undefined}>
      {items.map((item) => (
        <li key={item.to ?? item.label} className="cat-item">
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
          {item.children && <CategoryTree items={item.children} nested />}
        </li>
      ))}
    </ul>
  )
}
