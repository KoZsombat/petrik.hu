import { useEffect, useState } from 'react'
import * as api from '../../lib/hirkezelo/api.ts'
import { ApiError } from '../../lib/hirkezelo/api.ts'
import { primaryMenu, secondaryMenu } from '../../data/site.ts'
import type { MenuNode, SiteMenu } from '../../../../../shared/pnw/page-types.ts'
import { TargetField } from './fields.tsx'
import { SAVE_ERRORS } from './messages.ts'
import { move, remove, replace } from './tree.ts'
import { useUnsavedGuard } from './useUnsavedGuard.ts'

/** A deep copy of the static menus in src/data/site.ts - the starting point until someone saves. */
function staticMenu(): SiteMenu {
  return structuredClone({ primary: primaryMenu, secondary: secondaryMenu })
}

/**
 * The site's two menus (AGENT.md 6.19): the main navigation (two levels, as
 * the theme styles it) and the green top bar's links (one level). Saved as
 * one row; the header and the top bar read it through useSiteMenu() and fall
 * back to src/data/site.ts when there is none - or when the backend is down.
 */
export default function MenuEditor() {
  const [menu, setMenu] = useState<SiteMenu | null>(null)
  const [customized, setCustomized] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  useUnsavedGuard(dirty)

  useEffect(() => {
    let cancelled = false
    api
      .getMenu()
      .then(({ menu }) => {
        if (cancelled) return
        setMenu(menu ?? staticMenu())
        setCustomized(menu !== null)
      })
      .catch(() => {
        if (!cancelled) setNotice({ kind: 'error', text: 'A menü nem tölthető be.' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  function update(next: SiteMenu): void {
    setMenu(next)
    setDirty(true)
  }

  async function save(): Promise<void> {
    if (!menu) return
    setBusy(true)
    setNotice(null)
    try {
      const saved = await api.saveMenu(menu)
      setMenu(saved.menu)
      setCustomized(true)
      setDirty(false)
      setNotice({ kind: 'success', text: 'A menü mentve - az oldal újratöltése után látszik.' })
    } catch (error) {
      const code = error instanceof ApiError ? error.code : ''
      setNotice({ kind: 'error', text: SAVE_ERRORS[code] ?? 'A mentés nem sikerült.' })
    } finally {
      setBusy(false)
    }
  }

  async function reset(): Promise<void> {
    if (!window.confirm('A menü visszaáll a webhely eredeti menüjére. Minden menümódosítás elvész. Folytatod?')) return
    setBusy(true)
    try {
      await api.resetMenu()
      setMenu(staticMenu())
      setCustomized(false)
      setDirty(false)
      setNotice({ kind: 'success', text: 'Az eredeti menü visszaállt.' })
    } catch {
      setNotice({ kind: 'error', text: 'A visszaállítás nem sikerült.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <h3>Menü</h3>
          <p>{customized ? 'A webhely a módosított menüt használja.' : 'A webhely az eredeti menüt használja.'}</p>
        </div>
      </div>

      {notice && <div className={`pnw-notice pnw-notice-${notice.kind}`}>{notice.text}</div>}

      {!menu ? (
        !notice && <p>Betöltés…</p>
      ) : (
        <div className="pnw-form szk-form">
          <h4 className="szk-subheading">Főmenü</h4>
          <p className="szk-muted">
            Egy felső szintű pont lehet link, vagy - ha nem mutat sehova - lenyíló menü az alpontjaival.
          </p>
          <MenuList
            items={menu.primary}
            depth={0}
            idPrefix="primary"
            onChange={(primary) => update({ ...menu, primary })}
          />

          <h4 className="szk-subheading">Felső zöld sáv</h4>
          <MenuList
            items={menu.secondary}
            depth={1}
            idPrefix="secondary"
            onChange={(secondary) => update({ ...menu, secondary })}
          />

          <div className="pnw-form-actions pnw-form-actions-spread szk-sticky-actions">
            <button type="button" className="pnw-button pnw-button-danger" onClick={reset} disabled={busy || !customized}>
              Visszaállítás az eredetire
            </button>
            <button type="button" className="pnw-button" onClick={save} disabled={busy || !dirty}>
              {busy ? 'Mentés…' : dirty ? 'Mentés' : 'Mentve'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

/** `depth` 0 may have children (the main menu's dropdowns); 1 may not. */
function MenuList({
  items,
  depth,
  idPrefix,
  onChange,
}: {
  items: MenuNode[]
  depth: number
  idPrefix: string
  onChange: (items: MenuNode[]) => void
}) {
  return (
    <div className={`szk-menu szk-menu-depth-${depth}`}>
      {items.map((item, index) => (
        <MenuItemRow
          key={index}
          item={item}
          depth={depth}
          id={`${idPrefix}-${index}`}
          onChange={(next) => onChange(replace(items, index, next))}
          onMove={(step) => onChange(move(items, index, step))}
          onRemove={() => onChange(remove(items, index))}
        />
      ))}
      <button
        type="button"
        className="szk-add"
        onClick={() => onChange([...items, { label: 'Új menüpont', to: '/' }])}
      >
        {depth === 0 ? '+ Új főmenüpont' : '+ Alpont hozzáadása'}
      </button>
    </div>
  )
}

function MenuItemRow({
  item,
  depth,
  id,
  onChange,
  onMove,
  onRemove,
}: {
  item: MenuNode
  depth: number
  id: string
  onChange: (next: MenuNode) => void
  onMove: (step: -1 | 1) => void
  onRemove: () => void
}) {
  const canNest = depth === 0

  return (
    <div className="szk-node szk-menu-item">
      <div className="szk-menu-fields">
        <input
          type="text"
          aria-label="A menüpont neve"
          className="szk-menu-label"
          value={item.label}
          onChange={(event) => onChange({ ...item, label: event.target.value })}
        />
        <TargetField
          id={`szk-menu-${id}`}
          label="Hova mutat"
          allowNone={canNest}
          value={{ to: item.to, href: item.href }}
          onChange={(target) => {
            const next: MenuNode = { label: item.label }
            if (target.to !== undefined) next.to = target.to
            if (target.href !== undefined) next.href = target.href
            if (item.children) next.children = item.children
            onChange(next)
          }}
        />
        <span className="szk-tools">
          <button type="button" title="Feljebb" aria-label="Feljebb" onClick={() => onMove(-1)}>
            ↑
          </button>
          <button type="button" title="Lejjebb" aria-label="Lejjebb" onClick={() => onMove(1)}>
            ↓
          </button>
          <button
            type="button"
            className="szk-danger"
            title="Menüpont törlése"
            aria-label="Törlés"
            onClick={() => {
              if (!item.children?.length || window.confirm(`A(z) „${item.label}” pont az alpontjaival együtt törlődik. Folytatod?`)) {
                onRemove()
              }
            }}
          >
            ✕
          </button>
        </span>
      </div>
      {canNest && (
        <MenuList
          items={item.children ?? []}
          depth={1}
          idPrefix={id}
          onChange={(children) => {
            const next = { ...item }
            if (children.length) next.children = children
            else delete next.children
            onChange(next)
          }}
        />
      )}
    </div>
  )
}
