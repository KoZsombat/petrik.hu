import { useState } from 'react'
import { Link } from 'react-router-dom'
import { docCategories, docs } from '../../data/docs.ts'
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
  const owning = activeDoc ? docs[activeDoc]?.category : undefined
  // The grid was never collapsible, so only the sidebar tracks open state.
  const [opened, setOpened] = useState<Record<string, boolean>>({})

  const shown = onlyCategory
    ? docCategories.filter((category) => category.slug === onlyCategory)
    : docCategories

  const isOpen = (slug: string) =>
    layout === 'grid' ? true : (opened[slug] ?? slug === owning)

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
              data-id={category.id}
              className={
                'betterdocs-single-category-wrapper category-grid' +
                (category.slug === owning ? ' active' : '') +
                ' default' +
                (open ? '' : ' collapsed')
              }
            >
              <div className="betterdocs-single-category-inner">
                <div className="betterdocs-category-header">
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
                        onClick={() =>
                          setOpened((state) => ({ ...state, [category.slug]: !open }))
                        }
                      >
                        <ChevronDown />
                      </button>
                    )}
                  </div>
                </div>
                <div className="betterdocs-body" id={`betterdocs-body-${category.slug}`} hidden={!open}>
                  <ul className="betterdocs-articles-list">
                    {category.docs.map((slug) => (
                      <li key={slug}>
                        <ArticleIcon />
                        <Link
                          to={`/docs/${slug}/`}
                          className={slug === activeDoc ? 'active' : undefined}
                        >
                          <span>{docs[slug]?.title ?? slug}</span>{' '}
                        </Link>
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
