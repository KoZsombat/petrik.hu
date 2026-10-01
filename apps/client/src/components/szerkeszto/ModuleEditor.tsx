import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Align } from '../../../../../shared/pnw/types.ts'
import type { FeedItem, GalleryItem, PageImage, PageModule, Slide, TextAlign } from '../../../../../shared/pnw/page-types.ts'
import { archives } from '../../data/archives.ts'
import { posts } from '../../data/posts.ts'
import { youtubeId } from '../pagebuilder/video.ts'
import DesignPanel from './DesignPanel.tsx'
import MediaPicker from './MediaPicker.tsx'
import RichTextField from './RichTextField.tsx'
import { Checkbox, Field, NumberInput, Repeater, Select, TargetField, Textarea, TextInput } from './fields.tsx'

const TEXT_ALIGNS = [
  ['left', 'Balra'],
  ['center', 'Középre'],
  ['right', 'Jobbra'],
  ['justified', 'Sorkizárt'],
] as const satisfies readonly (readonly [TextAlign, string])[]

const ALIGNS = [
  ['left', 'Balra'],
  ['center', 'Középre'],
  ['right', 'Jobbra'],
] as const satisfies readonly (readonly [Align, string])[]

/** Drops the keys whose value is undefined, so a cleared field really disappears from the saved JSON. */
function clean<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T
}

/** The target of a link as the form's TargetField models it. */
function targetOf(href: string | undefined) {
  return href ? (href.startsWith('/') && !href.startsWith('//') ? { to: href } : { href }) : {}
}

/**
 * Replacing a picture drops everything that described the old file - its
 * responsive candidates, its intrinsic size and the lazy-loading decision
 * made for that size (an image with no size must not be lazy, AGENT.md 4.22).
 */
function withSrc(image: PageImage | undefined, src: string): PageImage {
  return clean({ src, alt: image?.alt })
}

function ImageFields({
  id,
  label,
  image,
  onChange,
  optional = false,
}: {
  id: string
  label: string
  image: PageImage | undefined
  onChange: (next: PageImage | undefined) => void
  optional?: boolean
}) {
  return (
    <>
      <Field label={label} htmlFor={`${id}-src`}>
        <MediaPicker
          id={`${id}-src`}
          value={image?.src ?? ''}
          onChange={(src) => onChange(src ? withSrc(image, src) : optional ? undefined : image)}
        />
      </Field>
      {image && (
        <Field label="Helyettesítő szöveg (alt)" htmlFor={`${id}-alt`}>
          <TextInput id={`${id}-alt`} value={image.alt ?? ''} onChange={(alt) => onChange(clean({ ...image, alt: alt || undefined }))} />
        </Field>
      )}
    </>
  )
}

/** Post slugs the feed may list: every captured post, offered through a datalist. */
const POST_LIST_ID = 'szk-post-slugs'

function PostFeedFields({ id, module, onChange }: { id: string; module: Extract<PageModule, { kind: 'post-feed' }>; onChange: (next: PageModule) => void }) {
  const categories = Object.values(archives).filter((archive) => archive.kind === 'category')
  const [category, setCategory] = useState(categories[0]?.route ?? '')
  const [count, setCount] = useState(3)

  function fill(): void {
    const archive = archives[category]
    if (!archive) return
    const items: FeedItem[] = archive.slugs.slice(0, count).map((slug) => clean({ slug, date: posts[slug]?.date }))
    onChange({ ...module, items })
  }

  return (
    <>
      <div className="szk-inline-fields">
        <Field label="Hasábok" htmlFor={`${id}-columns`}>
          <Select
            id={`${id}-columns`}
            value={String(module.columns ?? 3) as '1' | '2' | '3'}
            options={[
              ['1', '1'],
              ['2', '2'],
              ['3', '3'],
            ]}
            onChange={(columns) => onChange({ ...module, columns: Number(columns) as 1 | 2 | 3 })}
          />
        </Field>
        <Field label="Igazítás" htmlFor={`${id}-align`}>
          <Select id={`${id}-align`} value={module.align ?? 'left'} options={ALIGNS} onChange={(align) => onChange({ ...module, align })} />
        </Field>
      </div>
      <Checkbox checked={!!module.hasOlder} onChange={(hasOlder) => onChange(clean({ ...module, hasOlder: hasOlder || undefined }))}>
        „Régebbi bejegyzések” jelzés a lista alatt
      </Checkbox>
      <Checkbox checked={!!module.includeLive} onChange={(includeLive) => onChange(clean({ ...module, includeLive: includeLive || undefined }))}>
        A Hírkezelőben közzétett új hírek is megjelennek elöl
      </Checkbox>

      <fieldset className="szk-design">
        <legend>Feltöltés kategóriából</legend>
        <div className="szk-inline-fields">
          <Field label="Kategória" htmlFor={`${id}-category`}>
            <select id={`${id}-category`} className="szk-select" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((archive) => (
                <option key={archive.route} value={archive.route}>
                  {archive.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Hírek száma" htmlFor={`${id}-count`}>
            <NumberInput id={`${id}-count`} value={count} min={1} max={48} onChange={(value) => setCount(value ?? 3)} />
          </Field>
        </div>
        <button type="button" className="pnw-button pnw-button-secondary pnw-button-small" onClick={fill}>
          A lista cseréje a kategória legfrissebb híreire
        </button>
      </fieldset>

      <datalist id={POST_LIST_ID}>
        {Object.values(posts).map((post) => (
          <option key={post.slug} value={post.slug}>
            {post.title}
          </option>
        ))}
      </datalist>
      <Repeater<FeedItem>
        items={module.items}
        onChange={(items) => onChange({ ...module, items })}
        itemLabel="hír"
        addLabel="+ Hír"
        create={() => ({ slug: '' })}
        render={(item, update) => (
          <div className="szk-inline-fields">
            <Field label="Hír (azonosító)" hint={item.slug && !posts[item.slug] ? 'Ismeretlen hír - nem fog megjelenni.' : posts[item.slug]?.title}>
              <input type="text" list={POST_LIST_ID} value={item.slug} onChange={(event) => update({ ...item, slug: event.target.value.trim() })} />
            </Field>
            <Field label="Dátum a kártyán">
              <input type="text" value={item.date ?? ''} onChange={(event) => update(clean({ ...item, date: event.target.value || undefined }))} />
            </Field>
          </div>
        )}
      />
    </>
  )
}

/** The fields of one module (AGENT.md 6.20), per kind - plus its design settings. */
export default function ModuleEditor({ module, onChange }: { module: PageModule; onChange: (next: PageModule) => void }) {
  const id = `szk-${module.id}`
  const fields = renderFields(module, onChange, id)
  // A divider, an image, a file have no text of their own.
  const textual = !['divider', 'image', 'video', 'file-block', 'gallery', 'hero-slider', 'social-follow'].includes(module.kind)

  return (
    <>
      {fields}
      {module.kind !== 'file-block' && (
        <DesignPanel id={`${id}-design`} design={module.design} text={textual} onChange={(design) => onChange(clean({ ...module, design }))} />
      )}
    </>
  )
}

function renderFields(module: PageModule, onChange: (next: PageModule) => void, id: string): ReactNode {
  switch (module.kind) {
    case 'text':
      return (
        <>
          <div className="szk-inline-fields">
            <Field label="Igazítás" htmlFor={`${id}-align`}>
              <Select
                id={`${id}-align`}
                value={module.align ?? 'left'}
                options={TEXT_ALIGNS}
                onChange={(align) => onChange({ ...module, align })}
              />
            </Field>
            <Field label="Háttér" htmlFor={`${id}-bg`} hint="Sötét háttéren (pl. fejlécképen) a szöveg fehér.">
              <Select
                id={`${id}-bg`}
                value={module.bgLayout ?? 'light'}
                options={[
                  ['light', 'Világos'],
                  ['dark', 'Sötét'],
                ]}
                onChange={(bgLayout) => onChange({ ...module, bgLayout })}
              />
            </Field>
          </div>
          <RichTextField id={`${id}-content`} value={module.content} onChange={(content) => onChange({ ...module, content })} />
        </>
      )

    case 'image':
      return (
        <>
          <Field label="Kép" htmlFor={`${id}-src`}>
            <MediaPicker
              id={`${id}-src`}
              value={module.src}
              onChange={(src) =>
                onChange(clean({ ...module, src, width: undefined, height: undefined, srcSet: undefined, sizes: undefined, loading: undefined }))
              }
            />
          </Field>
          <Field label="Helyettesítő szöveg (alt)" htmlFor={`${id}-alt`}>
            <TextInput id={`${id}-alt`} value={module.alt ?? ''} onChange={(alt) => onChange(clean({ ...module, alt: alt || undefined }))} />
          </Field>
          <TargetField
            id={`${id}-href`}
            label="Link a képen"
            value={targetOf(module.href)}
            onChange={(target) => onChange(clean({ ...module, href: target.to ?? target.href }))}
          />
        </>
      )

    case 'button':
      return (
        <>
          <div className="szk-inline-fields">
            <Field label="Felirat" htmlFor={`${id}-label`}>
              <TextInput id={`${id}-label`} value={module.label} onChange={(label) => onChange({ ...module, label })} />
            </Field>
            <Field label="Igazítás" htmlFor={`${id}-align`}>
              <Select id={`${id}-align`} value={module.align ?? 'left'} options={ALIGNS} onChange={(align) => onChange({ ...module, align })} />
            </Field>
            <Field label="Ikon (ETmodules karakter)" htmlFor={`${id}-icon`} hint="A gomb mellett csúszik be egérrel rámutatva.">
              <TextInput
                id={`${id}-icon`}
                value={module.icon ?? ''}
                onChange={(icon) => onChange(clean({ ...module, icon: icon.slice(0, 4) || undefined }))}
              />
            </Field>
          </div>
          <TargetField
            id={`${id}-target`}
            label="Hova mutat"
            allowNone={false}
            value={{ to: module.to, href: module.href }}
            onChange={(target) => onChange(clean({ ...module, to: target.to, href: target.href }))}
          />
        </>
      )

    case 'blurb':
      return (
        <>
          <div className="szk-inline-fields">
            <Field label="Cím" htmlFor={`${id}-title`}>
              <TextInput
                id={`${id}-title`}
                value={module.title ?? ''}
                onChange={(title) => onChange(clean({ ...module, title: title || undefined }))}
              />
            </Field>
            <Field label="Ikon (ETmodules karakter)" htmlFor={`${id}-icon`} hint="Kép helyett jelenik meg.">
              <TextInput
                id={`${id}-icon`}
                value={module.icon ?? ''}
                onChange={(icon) => onChange(clean({ ...module, icon: icon.slice(0, 4) || undefined }))}
              />
            </Field>
            <Field label="Kép helyzete" htmlFor={`${id}-position`}>
              <Select
                id={`${id}-position`}
                value={module.position ?? 'top'}
                options={[
                  ['top', 'Felül'],
                  ['left', 'Balra'],
                  ['right', 'Jobbra'],
                ]}
                onChange={(position) => onChange({ ...module, position })}
              />
            </Field>
            <Field label="Igazítás" htmlFor={`${id}-align`}>
              <Select id={`${id}-align`} value={module.align ?? 'left'} options={TEXT_ALIGNS} onChange={(align) => onChange({ ...module, align })} />
            </Field>
          </div>
          <TargetField
            id={`${id}-title-href`}
            label="Link a címen"
            value={targetOf(module.titleHref)}
            onChange={(target) => onChange(clean({ ...module, titleHref: target.to ?? target.href }))}
          />
          <ImageFields
            id={`${id}-image`}
            label="Kép (nem kötelező)"
            image={module.image}
            optional
            onChange={(image) => onChange(clean({ ...module, image }))}
          />
          <RichTextField id={`${id}-content`} value={module.content} onChange={(content) => onChange({ ...module, content })} />
        </>
      )

    case 'divider':
      return <p className="szk-muted">Vízszintes elválasztó vonal - a megjelenését lent állíthatod.</p>

    case 'video':
      return (
        <Field
          label="YouTube-link"
          htmlFor={`${id}-url`}
          hint={module.url && !youtubeId(module.url) ? 'Ebből a linkből nem olvasható ki YouTube-videó.' : undefined}
        >
          <TextInput
            id={`${id}-url`}
            value={module.url}
            placeholder="https://www.youtube.com/watch?v=…"
            onChange={(url) => onChange({ ...module, url: url.trim() })}
          />
        </Field>
      )

    case 'toggle':
      return (
        <>
          <Field label="Cím" htmlFor={`${id}-title`}>
            <TextInput id={`${id}-title`} value={module.title} onChange={(title) => onChange({ ...module, title })} />
          </Field>
          <Checkbox checked={!!module.defaultOpen} onChange={(defaultOpen) => onChange(clean({ ...module, defaultOpen: defaultOpen || undefined }))}>
            Alapból nyitva
          </Checkbox>
          <RichTextField id={`${id}-content`} value={module.content} onChange={(content) => onChange({ ...module, content })} />
        </>
      )

    case 'post-feed':
      return <PostFeedFields id={id} module={module} onChange={onChange} />

    case 'team-member':
      return (
        <>
          <div className="szk-inline-fields">
            <Field label="Név" htmlFor={`${id}-name`}>
              <TextInput id={`${id}-name`} value={module.name} onChange={(name) => onChange({ ...module, name })} />
            </Field>
            <Field label="Beosztás" htmlFor={`${id}-position`}>
              <TextInput
                id={`${id}-position`}
                value={module.position ?? ''}
                onChange={(position) => onChange(clean({ ...module, position: position || undefined }))}
              />
            </Field>
            <Field label="Név címsorszintje" htmlFor={`${id}-level`}>
              <Select
                id={`${id}-level`}
                value={String(module.headingLevel ?? 6) as '4' | '6'}
                options={[
                  ['4', 'Címsor 4'],
                  ['6', 'Címsor 6'],
                ]}
                onChange={(level) => onChange({ ...module, headingLevel: Number(level) as 4 | 6 })}
              />
            </Field>
            <Field label="Igazítás" htmlFor={`${id}-align`}>
              <Select id={`${id}-align`} value={module.align ?? 'center'} options={ALIGNS} onChange={(align) => onChange({ ...module, align })} />
            </Field>
          </div>
          <ImageFields
            id={`${id}-image`}
            label="Fénykép"
            image={module.image}
            optional
            onChange={(image) => onChange(clean({ ...module, image }))}
          />
          <h5 className="szk-subheading">Szöveg a név alatt (nem kötelező)</h5>
          <RichTextField id={`${id}-content`} value={module.content ?? []} onChange={(content) => onChange({ ...module, content: content.length ? content : undefined })} />
        </>
      )

    case 'social-follow':
      return (
        <>
          <Field label="Igazítás" htmlFor={`${id}-align`}>
            <Select id={`${id}-align`} value={module.align ?? 'left'} options={ALIGNS} onChange={(align) => onChange({ ...module, align })} />
          </Field>
          <Repeater
            items={module.networks}
            onChange={(networks) => onChange({ ...module, networks })}
            itemLabel="hálózat"
            addLabel="+ Hálózat"
            create={() => ({ network: 'facebook', href: 'https://', title: 'Követés', label: 'Követés' })}
            render={(item, update) => (
              <div className="szk-inline-fields">
                <Field label="Hálózat (ikon)" hint="pl. facebook, instagram, youtube, twitter, linkedin">
                  <input type="text" value={item.network} onChange={(event) => update({ ...item, network: event.target.value.trim() })} />
                </Field>
                <Field label="Link">
                  <input type="text" value={item.href} onChange={(event) => update({ ...item, href: event.target.value.trim() })} />
                </Field>
                <Field label="Súgó (title)">
                  <input type="text" value={item.title} onChange={(event) => update({ ...item, title: event.target.value })} />
                </Field>
                <Field label="Felirat">
                  <input type="text" value={item.label} onChange={(event) => update({ ...item, label: event.target.value })} />
                </Field>
              </div>
            )}
          />
        </>
      )

    case 'number-counter':
      return (
        <div className="szk-inline-fields">
          <Field label="Szám" htmlFor={`${id}-value`}>
            <NumberInput id={`${id}-value`} value={module.value} onChange={(value) => onChange({ ...module, value: value ?? 0 })} />
          </Field>
          <Field label="Utótag (pl. %)" htmlFor={`${id}-suffix`}>
            <TextInput id={`${id}-suffix`} value={module.suffix ?? ''} onChange={(suffix) => onChange(clean({ ...module, suffix: suffix.slice(0, 20) || undefined }))} />
          </Field>
          <Field label="Felirat" htmlFor={`${id}-title`}>
            <TextInput id={`${id}-title`} value={module.title} onChange={(title) => onChange({ ...module, title })} />
          </Field>
        </div>
      )

    case 'testimonial':
      return (
        <>
          <div className="szk-inline-fields">
            <Field label="Szerző" htmlFor={`${id}-author`}>
              <TextInput id={`${id}-author`} value={module.author} onChange={(author) => onChange({ ...module, author })} />
            </Field>
            <Field label="Igazítás" htmlFor={`${id}-align`}>
              <Select id={`${id}-align`} value={module.align ?? 'left'} options={TEXT_ALIGNS} onChange={(align) => onChange({ ...module, align })} />
            </Field>
          </div>
          <Field label="Portré (nem kötelező)" htmlFor={`${id}-portrait`}>
            <MediaPicker
              id={`${id}-portrait`}
              value={module.portrait ?? ''}
              onChange={(portrait) => onChange(clean({ ...module, portrait: portrait || undefined }))}
            />
          </Field>
          <RichTextField id={`${id}-content`} value={module.content} onChange={(content) => onChange({ ...module, content })} />
        </>
      )

    case 'pricing-tables':
      return (
        <Repeater
          items={module.tables}
          onChange={(tables) => onChange({ ...module, tables })}
          itemLabel="táblázat"
          addLabel="+ Táblázat"
          create={() => ({ title: 'Cím', sum: '', items: ['Első sor'] })}
          render={(table, update, at) => (
            <>
              <div className="szk-inline-fields">
                <Field label="Cím" htmlFor={`${id}-t${at}-title`}>
                  <TextInput id={`${id}-t${at}-title`} value={table.title} onChange={(title) => update({ ...table, title })} />
                </Field>
                <Field label="Kiemelt sor (pl. dátum)" htmlFor={`${id}-t${at}-sum`}>
                  <TextInput id={`${id}-t${at}-sum`} value={table.sum ?? ''} onChange={(sum) => update(clean({ ...table, sum: sum || undefined }))} />
                </Field>
              </div>
              <Field label="Sorok (soronként egy)" htmlFor={`${id}-t${at}-items`}>
                <Textarea
                  id={`${id}-t${at}-items`}
                  value={table.items.join('\n')}
                  rows={Math.max(3, table.items.length + 1)}
                  onChange={(value) => update({ ...table, items: value.split('\n') })}
                />
              </Field>
            </>
          )}
        />
      )

    case 'hero-slider':
      return (
        <>
          <div className="szk-inline-fields">
            <Field label="Váltás (ezredmásodperc, 0 = nincs)" htmlFor={`${id}-interval`}>
              <NumberInput
                id={`${id}-interval`}
                value={module.intervalMs}
                min={0}
                max={120000}
                step={500}
                onChange={(intervalMs) => onChange(clean({ ...module, intervalMs }))}
              />
            </Field>
            <Field label="Fejléc alatti eltolás (pl. 116px)" htmlFor={`${id}-offset`} hint="Az átlátszó fejléc mögé futó képnél a dia szövegét ennyivel lejjebb tolja.">
              <TextInput
                id={`${id}-offset`}
                value={module.headerOffset ?? ''}
                onChange={(headerOffset) => onChange(clean({ ...module, headerOffset: headerOffset.trim() || undefined }))}
              />
            </Field>
          </div>
          <Repeater<Slide>
            items={module.slides}
            onChange={(slides) => onChange({ ...module, slides })}
            itemLabel="dia"
            addLabel="+ Dia"
            create={() => ({ image: '/media/wp-content/uploads/2020/09/tanari-kar.jpg' })}
            render={(slide, update, at) => (
              <>
                <Field label="Háttérkép" htmlFor={`${id}-s${at}-image`}>
                  <MediaPicker id={`${id}-s${at}-image`} value={slide.image} onChange={(image) => update({ ...slide, image: image || slide.image })} />
                </Field>
                <div className="szk-inline-fields">
                  <Field label="Cím" htmlFor={`${id}-s${at}-heading`}>
                    <TextInput id={`${id}-s${at}-heading`} value={slide.heading ?? ''} onChange={(heading) => update(clean({ ...slide, heading: heading || undefined }))} />
                  </Field>
                  <Field label="Szöveg" htmlFor={`${id}-s${at}-text`}>
                    <TextInput id={`${id}-s${at}-text`} value={slide.text ?? ''} onChange={(text) => update(clean({ ...slide, text: text || undefined }))} />
                  </Field>
                </div>
              </>
            )}
          />
        </>
      )

    case 'gallery':
      return (
        <>
          <Field label="Egy sorban (kép)" htmlFor={`${id}-perpage`}>
            <NumberInput id={`${id}-perpage`} value={module.perPage} min={1} max={100} onChange={(perPage) => onChange(clean({ ...module, perPage }))} />
          </Field>
          <Repeater<GalleryItem>
            items={module.items}
            onChange={(items) => onChange({ ...module, items })}
            itemLabel="kép"
            addLabel="+ Kép"
            create={() => ({ src: '/media/wp-content/uploads/2020/09/tanari-kar.jpg' })}
            render={(item, update, at) => (
              <>
                <ImageFields id={`${id}-g${at}`} label="Bélyegkép" image={item} onChange={(next) => update(clean({ ...(next ?? item), full: item.full }))} />
                <Field label="Nagy kép (kattintásra; üresen a bélyegkép)" htmlFor={`${id}-g${at}-full`}>
                  <MediaPicker id={`${id}-g${at}-full`} value={item.full ?? ''} onChange={(full) => update(clean({ ...item, full: full || undefined }))} />
                </Field>
              </>
            )}
          />
        </>
      )

    case 'fullwidth-header':
      return (
        <>
          <div className="szk-inline-fields">
            <Field label="Cím" htmlFor={`${id}-heading`}>
              <TextInput id={`${id}-heading`} value={module.heading} onChange={(heading) => onChange({ ...module, heading })} />
            </Field>
            <Field label="Igazítás" htmlFor={`${id}-align`}>
              <Select id={`${id}-align`} value={module.align ?? 'center'} options={ALIGNS} onChange={(align) => onChange({ ...module, align })} />
            </Field>
          </div>
          <Field label="Alcím" htmlFor={`${id}-text`}>
            <TextInput id={`${id}-text`} value={module.text ?? ''} onChange={(text) => onChange(clean({ ...module, text: text || undefined }))} />
          </Field>
          <Repeater
            items={module.buttons ?? []}
            onChange={(buttons) => onChange({ ...module, buttons })}
            itemLabel="gomb"
            addLabel="+ Gomb"
            create={() => ({ label: 'Új gomb', to: '/' })}
            render={(button, update, at) => (
              <>
                <Field label="Felirat" htmlFor={`${id}-b${at}-label`}>
                  <TextInput id={`${id}-b${at}-label`} value={button.label} onChange={(label) => update({ ...button, label })} />
                </Field>
                <TargetField
                  id={`${id}-b${at}-target`}
                  label="Hova mutat"
                  allowNone={false}
                  value={{ to: button.to, href: button.href }}
                  onChange={(target) => update(clean({ ...button, to: target.to, href: target.href }))}
                />
              </>
            )}
          />
        </>
      )

    case 'file-block':
      return (
        <>
          <div className="szk-inline-fields">
            <Field label="Fájl neve (link szövege)" htmlFor={`${id}-label`}>
              <TextInput id={`${id}-label`} value={module.label} onChange={(label) => onChange({ ...module, label })} />
            </Field>
            <Field label="Letöltés gomb felirata" htmlFor={`${id}-button`}>
              <TextInput id={`${id}-button`} value={module.buttonLabel} onChange={(buttonLabel) => onChange({ ...module, buttonLabel })} />
            </Field>
          </div>
          <Field label="Fájl elérési útja" htmlFor={`${id}-href`} hint="Pl. /media/wp-content/uploads/…/dokumentum.pdf">
            <TextInput id={`${id}-href`} value={module.href} onChange={(href) => onChange({ ...module, href: href.trim() })} />
          </Field>
          <Field label="Beágyazott PDF elérési útja" htmlFor={`${id}-embed`}>
            <TextInput id={`${id}-embed`} value={module.embed} onChange={(embed) => onChange({ ...module, embed: embed.trim() })} />
          </Field>
          <Field label="A beágyazás felirata (kisegítő)" htmlFor={`${id}-embed-label`}>
            <TextInput id={`${id}-embed-label`} value={module.embedLabel} onChange={(embedLabel) => onChange({ ...module, embedLabel })} />
          </Field>
        </>
      )
  }
}
