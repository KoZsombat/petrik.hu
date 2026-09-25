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
