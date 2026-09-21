import DocsCategoryList from '../components/docs/DocsCategoryList.tsx'
import DocsSearch from '../components/docs/DocsSearch.tsx'
import '../components/docs/betterdocs.css'
import '../components/docs/DocsLayout.css'

/**
 * /dokumentumtar/ - the document library's front page.
 *
 * WordPress served this as the archive of the `docs` post type, but there is
 * nothing to generate: it is the same ten category cards the docs sidebar
 * shows, laid out as a wall. So it is written by hand from the same data
 * instead of going through the page generator.
 *
 * The original packed the cards with the Masonry script. Without it the grid
 * keeps the cards in their original order at the cost of the tight packing -
 * see AGENT.md section 4.2.
 */
export default function Dokumentumtar() {
  return (
    <div className="betterdocs-wrapper betterdocs-docs-archive-wrapper betterdocs-category-layout-1 betterdocs-grid-layout betterdocs-wraper">
      <DocsSearch />
      <div className="betterdocs-content-wrapper betterdocs-archive-wrap betterdocs-archive-main">
        <DocsCategoryList layout="grid" />
      </div>
    </div>
  )
}
