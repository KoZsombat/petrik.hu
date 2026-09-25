import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import * as api from '../../lib/hirkezelo/api.ts'
import type { MediaItem } from '../../lib/hirkezelo/api.ts'

/**
 * Upload to /api/pages/media and pick from what is already there (AGENT.md
 * 6.19). Uploads land in server/uploads beside the Hírkezelő's featured
 * images and are served from /uploads/. A picture already on the site
 * (`/media/...`, from the mirror) can be used by pasting its path.
 */
export function MediaLibrary({ onPick, selected }: { onPick?: (url: string) => void; selected?: string }) {
  const [items, setItems] = useState<MediaItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .listMedia()
      .then(({ items }) => {
        if (!cancelled) setItems(items)
      })
      .catch(() => {
        if (!cancelled) setError('A médiatár nem tölthető be.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function upload(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const { url } = await api.uploadMedia(file)
      const { items } = await api.listMedia()
      setItems(items)
      onPick?.(url)
    } catch {
      setError('A feltöltés nem sikerült - csak kép tölthető fel, legfeljebb 8 MB.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="szk-media">
      <label className="pnw-button pnw-button-secondary pnw-button-small szk-upload">
        {busy ? 'Feltöltés…' : 'Kép feltöltése'}
        <input type="file" accept="image/*" onChange={upload} disabled={busy} hidden />
      </label>
      {error && <div className="pnw-notice pnw-notice-error">{error}</div>}
      {items === null && !error && <p className="szk-muted">Betöltés…</p>}
      {items && items.length === 0 && <p className="szk-muted">Még nincs feltöltött kép.</p>}
      {items && items.length > 0 && (
        <div className="szk-media-grid">
          {items.map((item) => (
            <button
              key={item.url}
              type="button"
              className={`szk-media-item${item.url === selected ? ' szk-media-item-selected' : ''}`}
              onClick={() => onPick?.(item.url)}
              title={item.url}
              disabled={!onPick}
            >
              <img src={item.url} alt="" loading="lazy" />
              <small>{Math.round(item.size / 1024)} KB</small>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** A form field for one image: the path, a thumbnail, and the library to pick or upload from. */
export default function MediaPicker({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (url: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="szk-media-picker">
      <div className="szk-media-current">
        {value ? <img src={value} alt="" /> : <span className="szk-muted">Nincs kép</span>}
        <div className="szk-media-current-fields">
          <input
            id={id}
            type="text"
            value={value}
            placeholder="/uploads/… vagy /media/…"
            onChange={(event) => onChange(event.target.value.trim())}
          />
          <button type="button" className="pnw-button pnw-button-secondary pnw-button-small" onClick={() => setOpen(!open)}>
            {open ? 'Médiatár bezárása' : 'Választás a médiatárból'}
          </button>
        </div>
      </div>
      {open && (
        <MediaLibrary
          selected={value}
          onPick={(url) => {
            onChange(url)
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}
