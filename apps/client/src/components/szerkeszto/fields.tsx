import type { ReactNode } from 'react'
import { isSafeHref } from '../../../../../shared/pnw/richtext.ts'

/**
 * Small form pieces shared by the Szerkesztő's editors (AGENT.md 6.19), in
 * the Hírkezelő's `.pnw-field` look.
 */
export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="pnw-field szk-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  )
}

export function TextInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return <input id={id} type="text" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
}

export type Target = { to?: string; href?: string }

/** The id of the <datalist> of every known route - rendered once by Szerkeszto.tsx. */
export const ROUTES_LIST_ID = 'szk-routes'

/**
 * A link target: an in-app route (`to`, rendered as a router <Link>) or an
 * external URL (`href`, opened in a new tab) - the same split the Divi
 * Button and the menu use.
 */
export function TargetField({
  id,
  label,
  value,
  onChange,
  allowNone = true,
}: {
  id: string
  label: string
  value: Target
  onChange: (value: Target) => void
  allowNone?: boolean
}) {
  const mode = value.href !== undefined ? 'external' : value.to !== undefined || !allowNone ? 'internal' : 'none'
  const current = mode === 'external' ? value.href ?? '' : value.to ?? ''
  const invalid =
    current !== '' && (mode === 'internal' ? !current.startsWith('/') || current.startsWith('//') : !isSafeHref(current))

  return (
    <Field
      label={label}
      htmlFor={id}
      hint={
        invalid
          ? mode === 'internal'
            ? 'Egy belső oldal útvonala /-rel kezdődik, pl. /nyolcadikos/.'
            : 'Külső link: http(s)://, mailto: vagy tel:.'
          : undefined
      }
    >
      <div className="szk-target">
        <select
          aria-label={`${label} típusa`}
          value={mode}
          onChange={(event) => {
            const next = event.target.value
            if (next === 'none') onChange({})
            else if (next === 'internal') onChange({ to: value.to ?? '/' })
            else onChange({ href: value.href ?? 'https://' })
          }}
        >
          {allowNone && <option value="none">Nincs</option>}
          <option value="internal">Oldal a webhelyen</option>
          <option value="external">Külső link</option>
        </select>
        {mode !== 'none' && (
          <input
            id={id}
            type="text"
            list={mode === 'internal' ? ROUTES_LIST_ID : undefined}
            value={current}
            onChange={(event) => {
              const text = event.target.value.trim()
              onChange(mode === 'internal' ? { to: text } : { href: text })
            }}
          />
        )}
      </div>
    </Field>
  )
}

export function Select<T extends string>({
  id,
  value,
  options,
  onChange,
}: {
  id: string
  value: T
  options: readonly (readonly [T, string])[]
  onChange: (value: T) => void
}) {
  return (
    <select id={id} className="szk-select" value={value} onChange={(event) => onChange(event.target.value as T)}>
      {options.map(([option, label]) => (
        <option key={option} value={option}>
          {label}
        </option>
      ))}
    </select>
  )
}

export function NumberInput({
  id,
  value,
  onChange,
  min,
  max,
  step,
}: {
  id: string
  value: number | undefined
  onChange: (value: number | undefined) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <input
      id={id}
      type="number"
      value={value ?? ''}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
    />
  )
}

export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
}) {
  return (
    <label className="szk-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {children}
    </label>
  )
}

export function Textarea({
  id,
  value,
  onChange,
  rows = 3,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  return <textarea id={id} className="szk-textarea" rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
}

/**
 * A list of records the user adds to, removes from and reorders - the slides
 * of a slider, the networks of a social row, the tables of a price list. The
 * records have no ids of their own, so rows are keyed by position, which is
 * safe here: every field is controlled, nothing inside holds state.
 */
export function Repeater<T>({
  items,
  onChange,
  render,
  create,
  addLabel,
  itemLabel,
}: {
  items: T[]
  onChange: (next: T[]) => void
  render: (item: T, update: (next: T) => void, index: number) => ReactNode
  create: () => T
  addLabel: string
  itemLabel: string
}) {
  const swap = (index: number, step: -1 | 1) => {
    const target = index + step
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="szk-repeater">
      {items.map((item, index) => (
        <div className="szk-repeater-item" key={index}>
          <div className="szk-repeater-head">
            <strong>
              {index + 1}. {itemLabel}
            </strong>
            <span className="szk-tools">
              <button type="button" aria-label={`${itemLabel} feljebb`} title="Feljebb" onClick={() => swap(index, -1)}>
                ↑
              </button>
              <button type="button" aria-label={`${itemLabel} lejjebb`} title="Lejjebb" onClick={() => swap(index, 1)}>
                ↓
              </button>
              <button
                type="button"
                className="szk-danger"
                aria-label={`${itemLabel} törlése`}
                title="Törlés"
                onClick={() => onChange(items.filter((_, at) => at !== index))}
              >
                ✕
              </button>
            </span>
          </div>
          {render(item, (next) => onChange(items.map((entry, at) => (at === index ? next : entry))), index)}
        </div>
      ))}
      <button type="button" className="szk-add" onClick={() => onChange([...items, create()])}>
        {addLabel}
      </button>
    </div>
  )
}
