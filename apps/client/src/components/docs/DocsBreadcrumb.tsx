import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { DocCategory, DocEntry, DocTag } from '../../data/docs.ts'
import { ChevronRight } from './DocsIcons.tsx'

type Crumb = { label: string; to?: string; className?: string }

type Props = {
  doc?: DocEntry
  category?: Pick<DocCategory, 'slug' | 'title'>
  /** A tag archive ends the trail here, marked as the current item. */
  tag?: DocTag
}

/**
 * Home > Dokumentumtár > category > title, as BetterDocs printed it.
 *
 * The delimiter is a list item of its own in the original markup rather than a
 * pseudo-element, and the plugin's stylesheet spaces the items on that basis,
 * so it is kept as an element here too.
 */
export default function DocsBreadcrumb({ doc, category, tag }: Props) {
  const crumbs: Crumb[] = [
    { label: 'Home', to: '/', className: 'item-home' },
    { label: 'Dokumentumtár', to: '/dokumentumtar/', className: 'item-cat item-custom-post-type-docs' },
  ]
  // On a category page the mirror still prints this as a link, pointing at the
  // page you are already on, rather than marking it as the current item.
  if (category) {
    crumbs.push({ label: category.title, to: `/dokumentum-kategoria/${category.slug}/` })
  }
  if (doc) {
    crumbs.push({ label: doc.title, className: `item-current item-${doc.id} current` })
  }
  if (tag) {
    crumbs.push({ label: tag.title, className: `item-current item-tag-${tag.id} current` })
  }

  return (
    <nav className="betterdocs-breadcrumb layout-1" id="betterdocs-breadcrumb" aria-label="Morzsamenü">
      <ul className="betterdocs-breadcrumb-list">
        {crumbs.map((crumb, at) => (
          <Fragment key={crumb.label}>
            {at > 0 && (
              <li className="betterdocs-breadcrumb-item breadcrumb-delimiter">
                <span className="icon-container">
                  <ChevronRight />
                </span>
              </li>
            )}
            <li className={`betterdocs-breadcrumb-item${crumb.className ? ' ' + crumb.className : ''}`}>
              {crumb.to ? (
                <Link to={crumb.to} className="bread-link" title={crumb.label}>
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ul>
    </nav>
  )
}
