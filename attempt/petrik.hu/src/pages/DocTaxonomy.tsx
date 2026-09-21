import { Link, useParams } from 'react-router-dom'
import DocsBreadcrumb from '../components/docs/DocsBreadcrumb.tsx'
import DocsCategoryList from '../components/docs/DocsCategoryList.tsx'
import DocsSearch from '../components/docs/DocsSearch.tsx'
import { ArticleIcon, CategoriesIcon } from '../components/docs/DocsIcons.tsx'
import NotFound from './NotFound.tsx'
import { docCategories, docTags, docs } from '../data/docs.ts'
import '../components/docs/betterdocs.css'
import '../components/docs/DocsLayout.css'

type Props = {
  /**
   * Which taxonomy this page lists. BetterDocs used one template for both and
   * varied only the heading: a category gets an <h2 class="betterdocs-entry-
   * heading"> followed by an empty <p>, a tag an <h3 class="docs-cat-heading">.
   */
  kind: 'category' | 'tag'
}

/**
 * /dokumentum-kategoria/<slug>/ and /dokumentum-cimke/<slug>/.
 *
 * Eleven pages share this template and differ only in which documents they
 * list, so one component serves them all off the route parameter. The sidebar
 * lists every category with none marked active, which is what the mirror does.
 *
 * The article list is flatter than the sidebar's: the links have no <span>
 * inside them on this template.
 */
export default function DocTaxonomy({ kind }: Props) {
  const { slug } = useParams()
  const term =
    kind === 'category'
      ? docCategories.find((item) => item.slug === slug)
      : docTags.find((item) => item.slug === slug)
  if (!term) return <NotFound />

  return (
    <div className="betterdocs-wrapper betterdocs-taxonomy-wrapper betterdocs-category-archive-wrapper betterdocs-wraper">
      <DocsSearch />

      <div className="betterdocs-content-wrapper betterdocs-display-flex doc-category-layout-1">
        <aside
          className="betterdocs-shortcode betterdocs-sidebar betterdocs-sidebar-layout-1"
          id="betterdocs-sidebar"
        >
          <div className="betterdocs-sidebar-content betterdocs-category-sidebar">
            <DocsCategoryList layout="sidebar" />
          </div>
        </aside>

        <div id="main" className="betterdocs-content-area">
          <div className="betterdocs-content-inner-area">
            <div className="betterdocs-mobile-nav">
              <div className="betterdocs-sidebar-icon">
                <div className="betterdocs-mobile-nav-icon-svg">
                  <CategoriesIcon />
                </div>
                <span>View Categories</span>
              </div>
            </div>

            {kind === 'category' ? (
              <DocsBreadcrumb category={term} />
            ) : (
              <DocsBreadcrumb tag={term} />
            )}

            <div className="betterdocs-entry-title">
              {kind === 'category' ? (
                <>
                  <h2 className="betterdocs-entry-heading">{term.title}</h2>
                  <p />
                </>
              ) : (
                <h3 className="docs-cat-heading">{term.title}</h3>
              )}
            </div>

            <div className="betterdocs-entry-body betterdocs-taxonomy-doc-category">
              <ul>
                {term.docs.map((doc) => (
                  <li key={doc}>
                    <ArticleIcon />
                    <Link to={`/docs/${doc}/`}>{docs[doc]?.title ?? doc}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
