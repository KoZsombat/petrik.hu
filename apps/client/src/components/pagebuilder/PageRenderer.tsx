import { useEffect, useMemo } from 'react'
import type { CSSProperties } from 'react'
import Blurb from '../divi/Blurb.tsx'
import Button from '../divi/Button.tsx'
import Column from '../divi/Column.tsx'
import Divider from '../divi/Divider.tsx'
import FullwidthHeader from '../divi/FullwidthHeader.tsx'
import Gallery from '../divi/Gallery.tsx'
import HeroSlider from '../divi/HeroSlider.tsx'
import Image from '../divi/Image.tsx'
import NumberCounter from '../divi/NumberCounter.tsx'
import PostFeed from '../divi/PostFeed.tsx'
import PricingTables from '../divi/PricingTables.tsx'
import Row from '../divi/Row.tsx'
import Section from '../divi/Section.tsx'
import SocialFollow from '../divi/SocialFollow.tsx'
import TeamMember from '../divi/TeamMember.tsx'
import Testimonial from '../divi/Testimonial.tsx'
import Text from '../divi/Text.tsx'
import Toggle from '../divi/Toggle.tsx'
import VideoEmbed from '../divi/VideoEmbed.tsx'
import DocsLayout from '../docs/DocsLayout.tsx'
import DocsProtectedNote from '../docs/DocsProtectedNote.tsx'
import FileBlock from '../docs/FileBlock.tsx'
import PostHeader from '../PostHeader.tsx'
import SharedCounts from '../SharedCounts.tsx'
import Sidebar from '../Sidebar.tsx'
import { useBodyClass } from '../../lib/useBodyClass.ts'
import { designCss } from '../../lib/designCss.ts'
import { normalizeDocument } from '../../../../../shared/pnw/page-doc.ts'
import type { PageDocument, PageModule, PageSection } from '../../../../../shared/pnw/page-types.ts'
import RichContent from './RichContent.tsx'
import { youtubeId } from './video.ts'
import './builder-page.css'
import './animations.css'
import { runModuleAnimations } from './animations.ts'

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

/** The module's own classes plus the ones its entrance animation needs (animations.css). */
function moduleClass(module: PageModule): string | undefined {
  const animation = module.animation ? `et_animated et_anim_${module.animation}` : ''
  return [module.className, animation].filter(Boolean).join(' ') || undefined
}

function renderModule(module: PageModule) {
  const index = module.index ?? 0

  switch (module.kind) {
    case 'text':
      return (
        <Text key={module.id} index={index} align={module.align} bgLayout={module.bgLayout} className={moduleClass(module)}>
          <RichContent nodes={module.content} />
        </Text>
      )
    case 'image':
      return (
        <Image
          key={module.id}
          index={index}
          src={module.src}
          alt={module.alt}
          href={module.href}
          width={module.width}
          height={module.height}
          srcSet={module.srcSet}
          sizes={module.sizes}
          loading={module.loading}
          className={module.className}
        />
      )
    case 'button':
      return (
        <Button key={module.id} index={index} to={module.to} href={module.href} align={module.align} icon={module.icon}>
          {module.label}
        </Button>
      )
    case 'blurb':
      return (
        <Blurb
          key={module.id}
          index={index}
          title={module.title}
          titleHref={module.titleHref}
          iconHref={module.iconHref}
          image={module.image}
          icon={module.icon}
          position={module.position}
          align={module.align}
          className={moduleClass(module)}
        >
          {module.content.length > 0 ? <RichContent nodes={module.content} /> : undefined}
        </Blurb>
      )
    case 'divider':
      return <Divider key={module.id} index={index} />
    case 'video': {
      const id = youtubeId(module.url)
      return id ? <VideoEmbed key={module.id} index={index} videoId={id} title={module.title ?? 'YouTube videó'} /> : null
    }
    case 'toggle':
      return (
        <Toggle key={module.id} index={index} title={module.title} defaultOpen={module.defaultOpen} className={module.className}>
          <RichContent nodes={module.content} />
        </Toggle>
      )
    case 'post-feed':
      return (
        <PostFeed
          key={module.id}
          index={index}
          items={module.items}
          columns={module.columns}
          align={module.align}
          hasOlder={module.hasOlder}
          olderPages={module.olderPages}
          includeLive={module.includeLive}
          className={module.className}
        />
      )
    case 'team-member':
      return (
        <TeamMember
          key={module.id}
          index={index}
          name={module.name}
          position={module.position}
          image={module.image}
          headingLevel={module.headingLevel}
          align={module.align}
          className={module.className}
        >
          {module.content && module.content.length > 0 ? <RichContent nodes={module.content} /> : undefined}
        </TeamMember>
      )
    case 'social-follow':
      return <SocialFollow key={module.id} index={index} networks={module.networks} align={module.align} />
    case 'number-counter':
      return <NumberCounter key={module.id} index={index} value={module.value} title={module.title} suffix={module.suffix} />
    case 'testimonial':
      return (
        <Testimonial key={module.id} index={index} author={module.author} portrait={module.portrait} align={module.align}>
          <RichContent nodes={module.content} />
        </Testimonial>
      )
    case 'pricing-tables':
      return <PricingTables key={module.id} index={index} tables={module.tables} />
    case 'hero-slider':
      return (
        <HeroSlider
          key={module.id}
          index={index}
          slides={module.slides}
          intervalMs={module.intervalMs}
          headerOffset={module.headerOffset}
        />
      )
    case 'gallery':
      return <Gallery key={module.id} index={index} items={module.items} perPage={module.perPage} />
    case 'fullwidth-header':
      return (
        <FullwidthHeader
          key={module.id}
          index={index}
          heading={module.heading}
          text={module.text}
          buttons={module.buttons}
          align={module.align}
        />
      )
    case 'file-block':
      return (
        <FileBlock
          key={module.id}
          embed={module.embed}
          href={module.href}
          label={module.label}
          buttonLabel={module.buttonLabel}
          embedLabel={module.embedLabel}
        />
      )
  }
}

/**
 * The sections, preceded by the page's design stylesheet when any node has
 * design settings (src/lib/designCss.ts) - and by nothing at all otherwise, so
 * an unedited page's markup is exactly what it always was.
 */
function PageSections({ document, scope }: { document: PageDocument; scope: string }) {
  const css = useMemo(() => designCss(document, scope), [document, scope])

  return (
    <>
      {css && <style>{css}</style>}
      {document.sections.map((section) => (
        <Section
          key={section.id}
          index={section.index ?? 0}
          first={section.first}
          withBackground={section.withBackground ?? !!section.background?.image}
          fullwidth={section.fullwidth}
          dividerTop={section.dividerTop}
          dividerBottom={section.dividerBottom}
          className={section.className}
          style={sectionStyle(section)}
        >
          {section.fullwidth
            ? section.modules?.map(renderModule)
            : section.rows.map((row) => (
                <Row key={row.id} index={row.index ?? 0} gutters={row.gutters} equalColumns={row.equalColumns} className={row.className}>
                  {row.columns.map((column, position) => (
                    <Column
                      key={column.id}
                      span={column.span}
                      index={column.index ?? 0}
                      last={column.last ?? position === row.columns.length - 1}
                      className={column.className}
                    >
                      {column.modules.map(renderModule)}
                    </Column>
                  ))}
                </Row>
              ))}
        </Section>
      ))}
    </>
  )
}

/** The theme lays out a post and a classic page off classes on <body> (useBodyClass). */
function BodyClasses({ classes }: { classes: string[] }) {
  useBodyClass(classes)
  return null
}

const CLASSIC_BODY = ['et_right_sidebar']

/**
 * A PageDocument, drawn the way every page of the site is (AGENT.md 6.20): the
 * frame its `template` names - the builder's `#main-content > article`, a
 * BetterDocs document, a blog post or a classic WordPress page - around the
 * Divi tree, built from the same components the generated pages used. A
 * default document therefore renders byte-for-byte what its generated
 * component rendered (scripts/render-pages.ts is the gate).
 *
 * `className` is for pages created in the Szerkesztő, which add their own
 * `page-<slug>` beside the shared `page-builder` design.
 */
export default function PageRenderer({ document: raw, className }: { document: PageDocument; className?: string }) {
  const document = useMemo(() => normalizeDocument(raw), [raw])
  const template = document.template ?? 'builder'
  const scope = document.scope ?? 'page-builder'
  const rootClass = [scope, className].filter(Boolean).join(' ')

  useEffect(() => runModuleAnimations(), [document])

  if (template === 'docs') {
    return (
      <DocsLayout slug={document.docsSlug ?? ''} className={rootClass || undefined}>
        {document.protected && <DocsProtectedNote />}
        {document.body?.map(renderModule)}
        {!document.protected && <PageSections document={document} scope={scope} />}
      </DocsLayout>
    )
  }

  if (template === 'post' && document.post) {
    return (
      <div id="main-content" className={rootClass}>
        <BodyClasses classes={document.post.bodyClasses} />
        <div className="container">
          <div id="content-area" className="clearfix">
            <div id="left-area">
              <article id={document.post.articleId} className={document.articleClass}>
                <PostHeader slug={document.post.slug} date={document.post.date} />
                <div className="entry-content">
                  <div className="et-l et-l--post">
                    <div className="et_builder_inner_content et_pb_gutters3">
                      <PageSections document={document} scope={scope} />
                    </div>
                  </div>
                  <SharedCounts />
                </div>
                <div className="et_post_meta_wrapper" />
              </article>
            </div>
            <Sidebar />
          </div>
        </div>
      </div>
    )
  }

  if (template === 'classic') {
    return (
      <div id="main-content" className={rootClass}>
        <BodyClasses classes={CLASSIC_BODY} />
        <div className="container">
          <div id="content-area" className="clearfix">
            <div id="left-area">
              <article className={document.articleClass}>
                <h1 className="entry-title main_title">{document.heading}</h1>
                <div className="entry-content">
                  <RichContent nodes={document.content} />
                </div>
              </article>
            </div>
            <Sidebar />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="main-content" className={rootClass}>
      <article className={document.articleClass ?? 'page type-page status-publish hentry'}>
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <PageSections document={document} scope={scope} />
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
