import type { PageModule, TextAlign } from '../../../shared/pnw/page-types.ts'
import type { Align } from '../../../shared/pnw/types.ts'
import { youtubeId } from '../pagebuilder/video.ts'
import MediaPicker from './MediaPicker.tsx'
import RichTextField from './RichTextField.tsx'
import { Field, Select, TargetField, TextInput } from './fields.tsx'

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

/** The fields of one builder-page module (AGENT.md 6.19), per kind. */
export default function ModuleEditor({ module, onChange }: { module: PageModule; onChange: (next: PageModule) => void }) {
  const id = `szk-${module.id}`

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
            <MediaPicker id={`${id}-src`} value={module.src} onChange={(src) => onChange({ ...module, src })} />
          </Field>
          <Field label="Helyettesítő szöveg (alt)" htmlFor={`${id}-alt`}>
            <TextInput id={`${id}-alt`} value={module.alt ?? ''} onChange={(alt) => onChange(clean({ ...module, alt: alt || undefined }))} />
          </Field>
          <TargetField
            id={`${id}-href`}
            label="Link a képen"
            value={module.href ? (module.href.startsWith('/') ? { to: module.href } : { href: module.href }) : {}}
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
              <Select
                id={`${id}-align`}
                value={module.align ?? 'left'}
                options={ALIGNS}
                onChange={(align) => onChange({ ...module, align })}
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
            <Field label="Ikon (ETmodules karakter)" htmlFor={`${id}-icon`} hint="Pl. „”. Kép helyett jelenik meg.">
              <TextInput
                id={`${id}-icon`}
                value={module.icon ?? ''}
                onChange={(icon) => onChange(clean({ ...module, icon: icon.slice(0, 4) || undefined }))}
              />
            </Field>
          </div>
          <TargetField
            id={`${id}-title-href`}
            label="Link a címen"
            value={module.titleHref ? (module.titleHref.startsWith('/') ? { to: module.titleHref } : { href: module.titleHref }) : {}}
            onChange={(target) => onChange(clean({ ...module, titleHref: target.to ?? target.href }))}
          />
          <Field label="Kép (nem kötelező)" htmlFor={`${id}-image`}>
            <MediaPicker
              id={`${id}-image`}
              value={module.image?.src ?? ''}
              onChange={(src) => onChange(clean({ ...module, image: src ? { src, alt: module.image?.alt } : undefined }))}
            />
          </Field>
          <RichTextField id={`${id}-content`} value={module.content} onChange={(content) => onChange({ ...module, content })} />
        </>
      )

    case 'divider':
      return <p className="szk-muted">Vízszintes elválasztó vonal - nincs beállítása.</p>

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
          <RichTextField id={`${id}-content`} value={module.content} onChange={(content) => onChange({ ...module, content })} />
        </>
      )
  }
}
