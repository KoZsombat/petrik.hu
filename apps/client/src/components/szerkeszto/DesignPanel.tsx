import { DESIGN_NUMBER_LIMITS } from '../../../../../shared/pnw/page-types.ts'
import type { Design } from '../../../../../shared/pnw/page-types.ts'

/**
 * The design settings of a section, row, column or module (AGENT.md 6.20):
 * colour, background, size, weight, alignment, spacing and border - structured
 * values only, rendered as one generated stylesheet per page
 * (src/lib/designCss.ts). An empty field means "leave it as the page's own
 * design has it".
 */

const NUMBERS: [keyof typeof DESIGN_NUMBER_LIMITS, string, string][] = [
  ['fontSize', 'Betűméret', 'px'],
  ['paddingTop', 'Belső térköz fent', 'px'],
  ['paddingBottom', 'Belső térköz lent', 'px'],
  ['marginTop', 'Külső térköz fent', 'px'],
  ['marginBottom', 'Külső térköz lent', 'px'],
  ['borderWidth', 'Keret vastagsága', 'px'],
]

const WEIGHTS = [
  [400, 'Normál'],
  [600, 'Félkövér'],
  [700, 'Kövér'],
] as const

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string | undefined
  onChange: (value: string | undefined) => void
}) {
  return (
    <div className="pnw-field szk-field">
      <label htmlFor={id}>{label}</label>
      <span className="szk-target">
        <input
          id={id}
          type="color"
          value={value && /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
          onChange={(event) => onChange(event.target.value)}
        />
        {value && <code>{value}</code>}
        <button type="button" className="pnw-button pnw-button-secondary pnw-button-small" onClick={() => onChange(undefined)}>
          Nincs
        </button>
      </span>
    </div>
  )
}

export default function DesignPanel({
  id,
  design,
  onChange,
  text = true,
}: {
  id: string
  design: Design | undefined
  onChange: (next: Design | undefined) => void
  /** False for nodes with no text of their own (a divider, an image): the text settings are left out. */
  text?: boolean
}) {
  const current = design ?? {}

  function set<K extends keyof Design>(key: K, value: Design[K] | undefined): void {
    const next = { ...current }
    if (value === undefined || value === '') delete next[key]
    else next[key] = value
    onChange(Object.keys(next).length ? next : undefined)
  }

  return (
    <fieldset className="szk-design">
      <legend>Megjelenés</legend>
      <div className="szk-design-grid">
        {text && <ColorField id={`${id}-color`} label="Szövegszín" value={current.color} onChange={(value) => set('color', value)} />}
        <ColorField id={`${id}-bg`} label="Háttérszín" value={current.background} onChange={(value) => set('background', value)} />
        <ColorField
          id={`${id}-border`}
          label="Keret színe"
          value={current.borderColor}
          onChange={(value) => set('borderColor', value)}
        />
        {NUMBERS.filter(([key]) => text || key !== 'fontSize').map(([key, label, unit]) => {
          const [min, max] = DESIGN_NUMBER_LIMITS[key]
          return (
            <div className="pnw-field szk-field" key={key}>
              <label htmlFor={`${id}-${key}`}>
                {label} ({unit})
              </label>
              <input
                id={`${id}-${key}`}
                type="number"
                min={min}
                max={max}
                value={current[key] ?? ''}
                onChange={(event) => {
                  const raw = event.target.value
                  set(key, raw === '' ? undefined : Math.max(min, Math.min(max, Math.round(Number(raw)))))
                }}
              />
            </div>
          )
        })}
        {text && (
          <>
            <div className="pnw-field szk-field">
              <label htmlFor={`${id}-weight`}>Betűvastagság</label>
              <select
                id={`${id}-weight`}
                className="szk-select"
                value={current.fontWeight ?? ''}
                onChange={(event) => set('fontWeight', event.target.value ? Number(event.target.value) : undefined)}
              >
                <option value="">Alapértelmezett</option>
                {WEIGHTS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="pnw-field szk-field">
              <label htmlFor={`${id}-align`}>Igazítás</label>
              <select
                id={`${id}-align`}
                className="szk-select"
                value={current.textAlign ?? ''}
                onChange={(event) => set('textAlign', (event.target.value || undefined) as Design['textAlign'])}
              >
                <option value="">Alapértelmezett</option>
                <option value="left">Balra</option>
                <option value="center">Középre</option>
                <option value="right">Jobbra</option>
                <option value="justify">Sorkizárt</option>
              </select>
            </div>
          </>
        )}
      </div>
      {design && (
        <button type="button" className="szk-link" onClick={() => onChange(undefined)}>
          Minden beállítás törlése
        </button>
      )}
    </fieldset>
  )
}
