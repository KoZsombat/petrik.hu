import type { CSSProperties } from 'react'
import Blurb from '../divi/Blurb.tsx'
import Button from '../divi/Button.tsx'
import Column from '../divi/Column.tsx'
import Divider from '../divi/Divider.tsx'
import Image from '../divi/Image.tsx'
import Row from '../divi/Row.tsx'
import Section from '../divi/Section.tsx'
import Text from '../divi/Text.tsx'
import Toggle from '../divi/Toggle.tsx'
import VideoEmbed from '../divi/VideoEmbed.tsx'
import RichText from '../hirkezelo/RichText.tsx'
import { OverrideScopeContext } from '../../lib/site/siteContext.ts'
import { youtubeId } from './video.ts'
import type { PageDocument, PageModule, PageSection } from '../../../../../shared/pnw/page-types.ts'
import './builder-page.css'

/**
 * Divi numbers every module type on a page separately (et_pb_text_0, _1, …;
 * et_pb_image_0, …), in document order. A builder page is numbered the same
 * way, so its markup has exactly the shape of a generated page's.
 */
type Counters = Record<'section' | 'row' | 'column' | PageModule['kind'], number>

function counters(): Counters {
  return { section: 0, row: 0, column: 0, text: 0, image: 0, button: 0, blurb: 0, divider: 0, video: 0, toggle: 0 }
}

function next(count: Counters, key: keyof Counters): number {
  const value = count[key]
  count[key] += 1
  return value
}

/**
 * The hero's background is the rule the mirror's hero sections share
 * (`.et_pb_section_0` on /nyolcadikos/ and /kozoktatas/: a black-to-clear
 * gradient over the photo); any other section just shows its picture or
 * colour.
 */
function sectionStyle(section: PageSection): CSSProperties | undefined {
  const { background } = section
  if (!background) return undefined
  const style: CSSProperties = {}
  if (background.color) style.backgroundColor = background.color
  if (background.image) {
    const url = `url("${encodeURI(background.image)}")`
    style.backgroundImage = section.first
      ? `linear-gradient(120deg,#000000 0%,rgba(0,0,0,0) 100%),${url}`
      : url
  }
  return style
}

function renderModule(module: PageModule, count: Counters) {
  switch (module.kind) {
    case 'text':
      return (
        <Text key={module.id} index={next(count, 'text')} align={module.align} bgLayout={module.bgLayout}>
          <RichText document={module.content} />
        </Text>
      )
    case 'image':
      return (
        <Image
          key={module.id}
          index={next(count, 'image')}
          src={module.src}
          alt={module.alt}
          href={module.href}
          width={module.width}
          height={module.height}
          // Lazy only with a size to reserve - AGENT.md 4.22's rule for the mirror's images.
          loading={module.width && module.height ? 'lazy' : undefined}
        />
      )
    case 'button':
      return (
        <Button key={module.id} index={next(count, 'button')} to={module.to} href={module.href} align={module.align}>
          {module.label}
        </Button>
      )
    case 'blurb':
      return (
        <Blurb
          key={module.id}
          index={next(count, 'blurb')}
          title={module.title}
          titleHref={module.titleHref}
          image={module.image}
          icon={module.icon}
        >
          <RichText document={module.content} />
        </Blurb>
      )
    case 'divider':
      return <Divider key={module.id} index={next(count, 'divider')} />
    case 'video': {
      const index = next(count, 'video')
      const id = youtubeId(module.url)
      return id ? <VideoEmbed key={module.id} index={index} videoId={id} title="YouTube videó" /> : null
    }
    case 'toggle':
      return (
        <Toggle key={module.id} index={next(count, 'toggle')} title={module.title}>
          <RichText document={module.content} />
        </Toggle>
      )
  }
}

/** Just the sections - for callers that supply their own `.et_builder_inner_content` wrapper. */
export function PageSections({ sections }: { sections: PageSection[] }) {
  const count = counters()

  return (
    // A builder document numbers its own modules from 0, so it must never
    // read the current route's overrides (saved against the generated page's
    // numbering) - see siteContext.ts.
    <OverrideScopeContext.Provider value={false}>
      {sections.map((section) => (
        <Section
          key={section.id}
          index={next(count, 'section')}
          first={section.first}
          withBackground={!!section.background?.image}
          dividerTop={section.dividerTop}
          dividerBottom={section.dividerBottom}
          style={sectionStyle(section)}
        >
          {section.rows.map((row) => (
            <Row key={row.id} index={next(count, 'row')} gutters={row.gutters}>
              {row.columns.map((column, columnIndex) => (
                <Column
                  key={column.id}
                  span={column.span}
                  index={next(count, 'column')}
                  last={columnIndex === row.columns.length - 1}
                  className={column.bordered ? 'et_pb_with_border' : undefined}
                >
                  {column.modules.map((module) => renderModule(module, count))}
                </Column>
              ))}
            </Row>
          ))}
        </Section>
      ))}
    </OverrideScopeContext.Provider>
  )
}

/**
 * A PageDocument through the same Divi components and wrappers a generated
 * builder page uses (compare src/pages/Nyolcadikos.tsx). Used for builder
 * pages (DynamicPage.tsx) and the editor's live preview (PagePreview.tsx).
 */
export default function PageRenderer({ document, className }: { document: PageDocument; className?: string }) {
  return (
    <div id="main-content" className={['page-builder', className].filter(Boolean).join(' ')}>
      <article className="page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <PageSections sections={document.sections} />
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
