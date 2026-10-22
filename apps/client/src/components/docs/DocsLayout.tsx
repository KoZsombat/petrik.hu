import { useState, type ReactNode } from 'react'
import { categoryOf, docs } from '../../data/docs.ts'
import DocsBreadcrumb from './DocsBreadcrumb.tsx'
import DocsCategoryList from './DocsCategoryList.tsx'
import DocsNav from './DocsNav.tsx'
import DocsReactions from './DocsReactions.tsx'
import DocsSearch from './DocsSearch.tsx'
import { CategoriesIcon, ClockIcon } from './DocsIcons.tsx'
import './betterdocs.css'
import './DocsLayout.css'

type Props = {
  /** Which document this page is; everything else is looked up from it. */
  slug: string
  /** The page's scoped Divi design class, as generated pages pass it. */
  className?: string
  children?: ReactNode
}

/**
 * The chrome around a single document.
 *
 * Every docs page in the mirror carried this identical frame - search box,
 * category sidebar, breadcrumb, title, reading time, prev/next - with only the
 * body differing, so it is a component here and the generated page files hold
 * just their content.
 *
 * The "What are your Feelings" footer is rendered but inert - see
 * DocsReactions. The duplicate mobile category drawer is not here; only the
 * plugin's script could open it, and it takes up no space.
 */
export default function DocsLayout({ slug, className, children }: Props) {
  const doc = docs[slug]
  if (!doc) throw new Error(`no such document: ${slug}`)
  const category = categoryOf(doc)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div
      className={
        'betterdocs-wrapper betterdocs-single-wrapper betterdocs-single-layout-1' +
        ' betterdocs-single-classic-layout betterdocs-single-wraper' +
        (className ? ' ' + className : '')
      }
    >
      <DocsSearch />

      <div className="betterdocs-content-wrapper betterdocs-display-flex">
        <aside
          className={
            'betterdocs-shortcode betterdocs-sidebar betterdocs-sidebar-layout-1' +
            (sidebarOpen ? ' docs-sidebar-open' : '')
          }
          id="betterdocs-sidebar"
        >
          <div className="betterdocs-sidebar-content betterdocs-category-sidebar">
            <DocsCategoryList layout="sidebar" activeDoc={slug} />
          </div>
        </aside>

        <div id="betterdocs-single-main" className="betterdocs-content-area">
          <div className="betterdocs-mobile-nav">
            <button
              type="button"
              className="betterdocs-sidebar-icon"
              aria-expanded={sidebarOpen}
              aria-controls="betterdocs-sidebar"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              <div className="betterdocs-mobile-nav-icon-svg">
                <CategoriesIcon />
              </div>
              <span>Kategóriák</span>
            </button>
          </div>
          {/* The mirror's markup has a line break here, which is a real space
              between this label and whatever the document starts with. */}{' '}
          <DocsBreadcrumb doc={doc} category={category} />

          <header className="betterdocs-entry-header">
            <div className="docs-single-title">
              <h1 className="betterdocs-entry-title" id="betterdocs-entry-title">
                {doc.title}
              </h1>
            </div>
          </header>

          <div className="reading-time betterdocs">
            <p>
              <ClockIcon />
              {doc.readingTime}
            </p>
          </div>

          <div className="betterdocs-entry-content">
            <div id="betterdocs-single-content" className="betterdocs-content">
              {/*
                Divi's per-page stylesheet targets `.et-db #et-boc .et-l ...`,
                so this wrapper - which the ordinary pages do not have - has to
                stay or the document's own styling stops matching.
              */}
              <div id="et-boc" className="et-boc">
                <div className="et-l et-l--post">
                  <div className="et_builder_inner_content et_pb_gutters3">{children}</div>
                </div>
              </div>
            </div>
          </div>

          {/* The mirror breaks the line between the content and the footer,
              which is a real space where a document ends in a bare link. */}{' '}
          <DocsReactions tags={doc.tags} />
          <DocsNav doc={doc} />
        </div>
      </div>
    </div>
  )
}
