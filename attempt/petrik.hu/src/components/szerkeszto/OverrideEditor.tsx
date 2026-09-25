import { useEffect, useState } from 'react'
import type { DragEvent } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../../lib/hirkezelo/api.ts'
import { ApiError } from '../../lib/hirkezelo/api.ts'
import { emptyOverrides, overrideKey } from '../../../shared/pnw/page-types.ts'
import type {
  BlurbOverride,
  ButtonOverride,
  ImageOverride,
  InventoryModule,
  InventorySection,
  ModuleOverride,
  PageInventory,
  PageOverrides,
  TextOverride,
} from '../../../shared/pnw/page-types.ts'
import MediaPicker from './MediaPicker.tsx'
import RichTextField from './RichTextField.tsx'
import SectionsEditor from './SectionsEditor.tsx'
import { Field, TargetField, TextInput } from './fields.tsx'
import { SAVE_ERRORS, mirroredTitle } from './messages.ts'
import { move } from './tree.ts'
import { useInventory } from './useInventory.ts'
import { useUnsavedGuard } from './useUnsavedGuard.ts'

const KIND_LABEL: Record<InventoryModule['kind'], string> = {
  text: 'Szöveg',
  image: 'Kép',
  button: 'Gomb',
  blurb: 'Kiemelés',
}

/** Nothing saved that would change the page - such a layer is deleted rather than stored. */
function isEmpty(overrides: PageOverrides): boolean {
  return (
    Object.keys(overrides.modules).length === 0 &&
    overrides.hiddenSections.length === 0 &&
    !overrides.sectionOrder &&
    overrides.extraSections.length === 0 &&
    !overrides.title &&
    !overrides.description &&
    !overrides.hidden
  )
}

/** The section order the page shows now: the saved one, or the generated one; unknown indices dropped, missing ones appended. */
function currentOrder(sections: InventorySection[], saved?: number[]): number[] {
  const natural = sections.map((section) => section.index)
  if (!saved) return natural
  const known = saved.filter((index) => natural.includes(index))
  return [...known, ...natural.filter((index) => !known.includes(index))]
}

/**
 * A mirrored page (AGENT.md 6.19): its generated TSX stays untouched, and
 * this edits the override layer over it - replacement content per module
 * (keyed by the Divi index the component already passes), hidden and
 * reordered sections, sections appended below, the <head> title and
 * description, and "Rejtés" (served as the 404).
 *
 * Each module shows the text the page has *today* next to its override, so a
 * page regenerated with a different module order (which would move the
 * overrides onto other modules) is visible here at a glance.
 */
export default function OverrideEditor({ route }: { route: string }) {
  const inventory = useInventory()
  const page: PageInventory | undefined = inventory?.[route]
  const [draft, setDraft] = useState<PageOverrides | null>(null)
  const [modifiedAt, setModifiedAt] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)

  useUnsavedGuard(dirty)

  useEffect(() => {
    let cancelled = false
    api
      .getOverrides(route)
      .then(({ overrides, modifiedAt }) => {
        if (cancelled) return
        setDraft(overrides ?? emptyOverrides(route))
        setModifiedAt(modifiedAt)
      })
      .catch(() => {
        if (!cancelled) setNotice({ kind: 'error', text: 'A mentett módosítások nem tölthetők be.' })
      })
    return () => {
      cancelled = true
    }
  }, [route])

  function update(updater: (current: PageOverrides) => PageOverrides): void {
    setDraft((current) => (current ? updater(current) : current))
    setDirty(true)
  }

  function setModule(key: string, value: ModuleOverride | undefined): void {
    update((current) => {
      const modules = { ...current.modules }
      if (value) modules[key] = value
      else delete modules[key]
      return { ...current, modules }
    })
  }

  function setOrder(order: number[]): void {
    if (!page) return
    const natural = page.sections.map((section) => section.index)
    update((current) => {
      const next = { ...current }
      // Back in the generated order means no reordering at all - the page leaves flex layout (divi-layout.css).
      if (order.join(',') === natural.join(',')) delete next.sectionOrder
      else next.sectionOrder = order
      return next
    })
  }

  function toggleSection(index: number): void {
    update((current) => ({
      ...current,
      hiddenSections: current.hiddenSections.includes(index)
        ? current.hiddenSections.filter((entry) => entry !== index)
        : [...current.hiddenSections, index],
    }))
  }

  async function save(): Promise<void> {
    if (!draft) return
    setBusy(true)
    setNotice(null)
    try {
      if (isEmpty(draft)) {
        await api.clearOverrides(route)
        setModifiedAt(null)
      } else {
        const saved = await api.saveOverrides(draft)
        setDraft(saved.overrides)
        setModifiedAt(saved.modifiedAt)
      }
      setDirty(false)
      setNotice({ kind: 'success', text: 'Mentve - frissítsd az oldalt a változás megtekintéséhez.' })
    } catch (error) {
      const code = error instanceof ApiError ? error.code : ''
      setNotice({ kind: 'error', text: SAVE_ERRORS[code] ?? 'A mentés nem sikerült.' })
    } finally {
      setBusy(false)
    }
  }

  async function resetAll(): Promise<void> {
    if (!window.confirm('Minden módosítás elvész ezen az oldalon, és az eredeti tartalom áll vissza. Folytatod?')) return
    setBusy(true)
    try {
      await api.clearOverrides(route)
      setDraft(emptyOverrides(route))
      setModifiedAt(null)
      setDirty(false)
      setNotice({ kind: 'success', text: 'Az eredeti oldal visszaállt.' })
    } catch {
      setNotice({ kind: 'error', text: 'A visszaállítás nem sikerült.' })
    } finally {
      setBusy(false)
    }
  }

  if (!inventory || !draft) {
    return (
      <section className="pnw-section">
        {notice ? <div className={`pnw-notice pnw-notice-${notice.kind}`}>{notice.text}</div> : 'Betöltés…'}
      </section>
    )
  }

  if (!page) {
    return (
      <section className="pnw-section">
        <div className="pnw-notice pnw-notice-error">
          A(z) <code>{route}</code> oldalnak nincs szerkeszthető tartalma (nem Divi-oldal, vagy nem szerepel a
          mentésben).
        </div>
        <p>
          <Link to="/szerkeszto/">← Az oldalak listája</Link>
        </p>
      </section>
    )
  }

  const order = currentOrder(page.sections, draft.sectionOrder)
  const byIndex = new Map(page.sections.map((section) => [section.index, section]))
  const loose = page.modules.filter((module) => !byIndex.has(module.section))

  function onDrop(event: DragEvent, target: number): void {
    event.preventDefault()
    if (dragging === null || dragging === target) return
    const next = order.filter((index) => index !== dragging)
    next.splice(next.indexOf(target), 0, dragging)
    setOrder(next)
    setDragging(null)
  }

  const renderModule = (module: InventoryModule) => {
    const key = overrideKey(module.kind, module.index)
    return (
      <ModuleRow
        key={key}
        module={module}
        override={draft.modules[key]}
        open={openKey === key}
        onToggle={() => setOpenKey(openKey === key ? null : key)}
        onChange={(value) => setModule(key, value)}
      />
    )
  }

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <div className="pnw-kicker">Eredeti oldal · {page.component}</div>
          <h3>{mirroredTitle(route)}</h3>
          <p>
            <a href={route} target="_blank" rel="noreferrer">
              {route}
            </a>{' '}
            · {modifiedAt ? `utoljára mentve ${new Date(modifiedAt).toLocaleString('hu-HU')}` : 'nincs módosítva'}
          </p>
        </div>
        <Link className="pnw-button pnw-button-secondary" to="/szerkeszto/">
          ← Az oldalak listája
        </Link>
      </div>

      {notice && <div className={`pnw-notice pnw-notice-${notice.kind}`}>{notice.text}</div>}

      <div className="pnw-form szk-form">
        <h4 className="szk-subheading">Az oldal adatai</h4>
        <div className="szk-inline-fields">
          <Field label="Cím a böngészőfülön" htmlFor="szk-ov-title" hint={`Eredeti: ${mirroredTitle(route)}`}>
            <TextInput
              id="szk-ov-title"
              value={draft.title ?? ''}
              placeholder={mirroredTitle(route)}
              onChange={(title) =>
                update((current) => {
                  const next = { ...current }
                  if (title.trim()) next.title = title
                  else delete next.title
                  return next
                })
              }
            />
          </Field>
          <Field label="Rövid leírás (meta description)" htmlFor="szk-ov-description">
            <TextInput
              id="szk-ov-description"
              value={draft.description ?? ''}
              onChange={(description) =>
                update((current) => {
                  const next = { ...current }
                  if (description.trim()) next.description = description
                  else delete next.description
                  return next
                })
              }
            />
          </Field>
        </div>
        <label className="szk-check">
          <input
            type="checkbox"
            checked={!!draft.hidden}
            onChange={(event) =>
              update((current) => {
                const next = { ...current }
                if (event.target.checked) next.hidden = true
                else delete next.hidden
                return next
              })
            }
          />
          Rejtés - az oldal „nem található” lesz, és kikerül a menüből (az eredeti oldal nem törölhető)
        </label>

        <h4 className="szk-subheading">Szakaszok és modulok</h4>
        <p className="szk-muted">
          A szakaszok húzással vagy a nyilakkal rendezhetők át. Egy modul szerkesztése csak a szövegét, képét vagy
          linkjét cseréli - az elrendezés és a stílus az eredeti marad.
        </p>

        {order.map((index, position) => {
          const section = byIndex.get(index)!
          const hidden = draft.hiddenSections.includes(index)
          return (
            <div
              key={index}
              className={`szk-node szk-section${hidden ? ' szk-section-hidden' : ''}${dragging === index ? ' szk-dragging' : ''}`}
              draggable
              onDragStart={() => setDragging(index)}
              onDragEnd={() => setDragging(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => onDrop(event, index)}
            >
              <header className="szk-node-head">
                <span className="szk-grip" aria-hidden="true">
                  ⋮⋮
                </span>
                <strong>{position + 1}. szakasz</strong>
                <span className="szk-summary">{section.text || '(nincs szöveg)'}</span>
                {hidden && <span className="pnw-badge">Rejtve</span>}
                <span className="szk-tools">
                  <button type="button" aria-label="Szakasz feljebb" onClick={() => setOrder(move(order, position, -1))}>
                    ↑
                  </button>
                  <button type="button" aria-label="Szakasz lejjebb" onClick={() => setOrder(move(order, position, 1))}>
                    ↓
                  </button>
                  <button type="button" onClick={() => toggleSection(index)}>
                    {hidden ? 'Megjelenítés' : 'Elrejtés'}
                  </button>
                </span>
              </header>
              {page.modules.filter((module) => module.section === index).map(renderModule)}
            </div>
          )
        })}

        {loose.length > 0 && (
          <div className="szk-node szk-section">
            <header className="szk-node-head">
              <strong>Szakaszon kívüli modulok</strong>
            </header>
            {loose.map(renderModule)}
          </div>
        )}

        <h4 className="szk-subheading">Az oldal alá fűzött új szakaszok</h4>
        <SectionsEditor
          sections={draft.extraSections}
          allowHero={false}
          onChange={(extraSections) => update((current) => ({ ...current, extraSections }))}
        />

        <div className="pnw-form-actions pnw-form-actions-spread szk-sticky-actions">
          <button type="button" className="pnw-button pnw-button-danger" onClick={resetAll} disabled={busy}>
            Eredeti visszaállítása (az egész oldal)
          </button>
          <button type="button" className="pnw-button" onClick={save} disabled={busy || !dirty}>
            {busy ? 'Mentés…' : dirty ? 'Mentés' : 'Mentve'}
          </button>
        </div>
      </div>
    </section>
  )
}

function ModuleRow({
  module,
  override,
  open,
  onToggle,
  onChange,
}: {
  module: InventoryModule
  override: ModuleOverride | undefined
  open: boolean
  onToggle: () => void
  onChange: (value: ModuleOverride | undefined) => void
}) {
  const id = `szk-ov-${module.kind}-${module.index}`
  const original =
    module.kind === 'text' || module.kind === 'blurb'
      ? `${module.kind === 'blurb' && module.title ? `${module.title} - ` : ''}${module.text}`
      : module.kind === 'image'
        ? module.src
        : `${module.label} → ${module.to ?? module.href ?? ''}`

  return (
    <div className={`szk-module${open ? ' szk-module-open' : ''}`}>
      <header className="szk-node-head">
        <button type="button" className="szk-module-title" onClick={onToggle}>
          <span className="pnw-badge">
            {KIND_LABEL[module.kind]} #{module.index}
          </span>
          {override && <span className="pnw-badge pnw-badge-publish">Módosítva</span>}
          {module.kind === 'image' && <img className="szk-thumb" src={override && 'src' in override && override.src ? override.src : module.src} alt="" />}
          <span className="szk-summary">{original || '(üres)'}</span>
        </button>
        {override && (
          <button type="button" className="szk-link" onClick={() => onChange(undefined)}>
            Eredeti visszaállítása
          </button>
        )}
      </header>
      {open && (
        <div className="szk-module-body">
          <ModuleOverrideFields id={id} module={module} override={override} onChange={onChange} />
          <p className="szk-original">
            <strong>Most az oldalon (eredeti):</strong> {original || '(üres)'}
          </p>
        </div>
      )}
    </div>
  )
}

function toTarget(href: string | undefined) {
  if (!href) return {}
  return href.startsWith('/') ? { to: href } : { href }
}

function ModuleOverrideFields({
  id,
  module,
  override,
  onChange,
}: {
  id: string
  module: InventoryModule
  override: ModuleOverride | undefined
  onChange: (value: ModuleOverride | undefined) => void
}) {
  switch (module.kind) {
    case 'text': {
      if (!module.content && !override) {
        return (
          <p className="pnw-notice pnw-notice-warning">
            Csak olvasható: ez a modul olyan formázást használ ({module.lossy}), amit a szerkesztő nem tud hűen
            visszaadni, ezért inkább nem szerkeszthető, mint hogy mentéskor elrontsa.
          </p>
        )
      }
      const current = (override as TextOverride | undefined)?.content ?? module.content ?? []
      return <RichTextField id={`${id}-content`} value={current} onChange={(content) => onChange({ content })} />
    }

    case 'image': {
      const current = (override as ImageOverride | undefined) ?? {}
      const set = (patch: ImageOverride) => onChange({ ...current, ...patch })
      return (
        <>
          <Field label="Kép" htmlFor={`${id}-src`}>
            <MediaPicker id={`${id}-src`} value={current.src ?? module.src} onChange={(src) => set({ src })} />
          </Field>
          <Field label="Helyettesítő szöveg (alt)" htmlFor={`${id}-alt`}>
            <TextInput id={`${id}-alt`} value={current.alt ?? module.alt} onChange={(alt) => set({ alt })} />
          </Field>
          <TargetField
            id={`${id}-href`}
            label="Link a képen"
            value={toTarget(current.href ?? module.href)}
            onChange={(next) => set({ href: next.to ?? next.href })}
          />
        </>
      )
    }

    case 'button': {
      const current = (override as ButtonOverride | undefined) ?? {}
      const target = current.to || current.href ? { to: current.to, href: current.href } : { to: module.to, href: module.href }
      return (
        <>
          <Field label="Felirat" htmlFor={`${id}-label`}>
            <TextInput
              id={`${id}-label`}
              value={current.label ?? module.label}
              onChange={(label) => onChange({ ...current, label })}
            />
          </Field>
          <TargetField
            id={`${id}-target`}
            label="Hova mutat"
            allowNone={false}
            value={target}
            onChange={(next) => onChange({ label: current.label, to: next.to, href: next.href })}
          />
        </>
      )
    }

    case 'blurb': {
      const current = (override as BlurbOverride | undefined) ?? {}
      return (
        <>
          <Field label="Cím" htmlFor={`${id}-title`}>
            <TextInput
              id={`${id}-title`}
              value={current.title ?? module.title}
              onChange={(title) => onChange({ ...current, title })}
            />
          </Field>
          {module.content || current.content ? (
            <RichTextField
              id={`${id}-content`}
              value={current.content ?? module.content ?? []}
              onChange={(content) => onChange({ ...current, content })}
            />
          ) : (
            <p className="pnw-notice pnw-notice-warning">A leírás csak olvasható ({module.lossy}).</p>
          )}
        </>
      )
    }
  }
}
