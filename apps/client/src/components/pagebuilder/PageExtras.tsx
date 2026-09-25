import { useRouteOverrides } from '../../lib/site/usePageOverride.ts'
import { PageSections } from './PageRenderer.tsx'

/**
 * The sections the Szerkesztő appended below a mirrored page (AGENT.md 6.19),
 * placed right after the page in Layout.tsx. They sit in the same
 * `entry-content / et-l / et_builder_inner_content` wrapper a generated page
 * uses, but outside that page's `.page-<slug>` element - its design
 * stylesheet targets numbered modules (`.page-nyolcadikos .et_pb_text_3`),
 * and these number themselves from 0 too. `.page-builder` gives them the
 * builder pages' design instead.
 *
 * Renders nothing at all when there are none - the normal case.
 */
export default function PageExtras() {
  const sections = useRouteOverrides()?.extraSections
  if (!sections || sections.length === 0) return null

  return (
    <div className="page-builder page-extras">
      <div className="entry-content">
        <div className="et-l et-l--post">
          <div className="et_builder_inner_content et_pb_gutters3">
            <PageSections sections={sections} />
          </div>
        </div>
      </div>
    </div>
  )
}
