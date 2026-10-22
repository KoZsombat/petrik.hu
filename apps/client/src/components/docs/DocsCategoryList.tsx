import { useState } from 'react'
import { useDocCategories } from '../../lib/site/docLibrary.ts'
import DocLink from './DocLink.tsx'
import { ArticleIcon, ChevronDown } from './DocsIcons.tsx'

type Props = {
  /**
   * 'sidebar' is the collapsible list beside a document; 'grid' is the card
   * wall on /dokumentumtar/ and the category pages, which the original left
   * permanently open and gave no collapse control.
   */
  layout: 'sidebar' | 'grid'
  /** The document being read, so its category opens and its entry is marked. */
  activeDoc?: string
  /** Show only this category, as the taxonomy pages did. */
  onlyCategory?: string
}

/**
 * The BetterDocs category cards.
 *
 * The plugin printed this same markup into every docs page and then drove it
 * with its own JavaScript: the stylesheet hides every category body, and the
 * script re-showed the one belonging to the document on screen. That behaviour
 * is reproduced here as state rather than restored by loading the plugin.
 */
export default function DocsCategoryList({ layout, activeDoc, onlyCategory }: Props) {
  const docCategories = useDocCategories()
  const owning = activeDoc ? docCategories.find((category) => category.docs.some((doc) => doc.slug === activeDoc))?.slug : undefined
  // An accordion: opening one category closes the one before it.
  const [current, setCurrent] = useState<string | null | undefined>(undefined)

  const shown = onlyCategory
    ? docCategories.filter((category) => category.slug === onlyCategory)
    : docCategories

  const isOpen = (slug: string) =>
    layout === 'grid' ? true : (current === undefined ? slug === owning : slug === current)

  return (
    <div className="betterdocs-category-grid-wrapper betterdocs-shortcode">
      <div
        className={
          layout === 'grid'
            ? 'betterdocs-category-grid-inner-wrapper layout-1 masonry docs-col-4 single-kb'
            : 'betterdocs-category-grid-inner-wrapper layout-1'
        }
        // The original set this inline and its stylesheet reads it back.
        style={layout === 'grid' ? ({ '--column': 4 } as React.CSSProperties) : undefined}
      >
        {shown.map((category) => {
          const open = isOpen(category.slug)
          return (
            <article
              key={category.slug}
                            className={
                'betterdocs-single-category-wrapper category-grid' +
                (category.slug === owning ? ' active' : '') +
                ' default' +
                (open ? '' : ' collapsed')
              }
            >
              <div className="betterdocs-single-category-inner">
                <div
                  className="betterdocs-category-header"
                  style={layout === 'sidebar' ? { cursor: 'pointer' } : undefined}
                  onClick={
                    layout === 'sidebar'
                      ? () => setCurrent(open ? null : category.slug)
                      : undefined
                  }
                >
                  <div className="betterdocs-category-header-inner">
                    <div className="betterdocs-category-icon">
                      <img
                        alt="betterdocs-category-icon"
                        className="betterdocs-category-icon-img"
                        src="/media/betterdocs-cat-icon.svg"
                      />
                    </div>
                    <h2 className="betterdocs-category-title">{category.title}</h2>
                    <div data-count={category.docs.length} className="betterdocs-category-items-counts">
                      <span> {category.docs.length} </span>
                    </div>
                    {layout === 'sidebar' && (
                      // The mirror used a bare <svg> that only its script could
                      // reach. A button is the same control, usable by keyboard.
                      <button
                        type="button"
                        className="betterdocs-category-collapse-button"
                        aria-expanded={open}
                        aria-controls={`betterdocs-body-${category.slug}`}
                        aria-label={`${category.title} kategória ki- és becsukása`}
                        onClick={(event) => {
                          // The whole header toggles; don't toggle twice.
                          event.stopPropagation()
                          setCurrent(open ? null : category.slug)
                        }}
                      >
                        <ChevronDown />
                      </button>
                    )}
                  </div>
                </div>
                <div className="betterdocs-body" id={`betterdocs-body-${category.slug}`}>
                  <ul className="betterdocs-articles-list">
                    {category.docs.map((doc) => (
                      <li key={doc.slug}>
                        <ArticleIcon />
                        <DocLink doc={doc} className={doc.slug === activeDoc ? 'active' : undefined}>
                          <span>{doc.title}</span>{' '}
                        </DocLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          )
        })}
      </div>
      <div className="clearfix" />
    </div>
  )
}
