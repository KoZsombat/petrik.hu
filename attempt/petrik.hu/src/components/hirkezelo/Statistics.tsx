import { useEffect, useState } from 'react'
import * as api from '../../lib/hirkezelo/api.ts'
import type { Statistics as StatisticsData } from '../../lib/hirkezelo/api.ts'
import { useUsers } from '../../lib/hirkezelo/useUsers.ts'
import { termMap, useTerms } from '../../lib/terms.ts'

const MONTH_LABEL = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'short' })

function formatDuration(seconds: number): string {
  if (seconds <= 0) return '—'
  if (seconds < 3600) return `${Math.max(1, Math.round(seconds / 60))} perc`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} óra`
  return `${(seconds / 86400).toFixed(1)} nap`
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  return MONTH_LABEL.format(new Date(Date.UTC(year, month - 1, 1)))
}

/** Ported from PNW_Statistics::render(). */
export default function Statistics() {
  const [data, setData] = useState<StatisticsData | null>(null)
  const authors = useUsers()
  const categoryNames = termMap(useTerms())

  useEffect(() => {
    api.statistics().then(setData)
  }, [])

  if (!data) {
    return (
      <section className="pnw-section pnw-statistics">
        <div className="pnw-empty-inline">Betöltés…</div>
      </section>
    )
  }

  const maxMonth = Math.max(1, ...data.monthlyChart.map((month) => month.count))

  return (
    <section className="pnw-section pnw-statistics">
      <div className="pnw-section-heading">
        <div>
          <div className="pnw-kicker">Rendszerkép</div>
          <h3>Statisztika</h3>
          <p>Áttekintés a Hírkezelő használatáról és a publikált tartalmakról.</p>
        </div>
      </div>

      <div className="pnw-stats pnw-statistics-cards">
        <MetricCard value={data.liveAll} label="Kint lévő hírek" description="Az összes jelenleg publikus hír" />
        <MetricCard
          value={data.liveManaged}
          label="Hírkezelőből publikált"
          description="A workflow-val létrehozott és jelenleg élő hírek"
        />
        <MetricCard value={data.scheduled} label="Időzített" description="Jóváhagyva, későbbi megjelenésre vár" />
        <MetricCard value={data.pending} label="Jóváhagyásra vár" description="Vezetői döntésre váró hírek" />
        <MetricCard value={data.archived} label="Archívumban" description="Nem publikus, visszaállítható hírek" />
        <MetricCard value={data.monthPublished} label="Ebben a hónapban" description="Hírkezelőből publikált hírek" />
        <MetricCard
          value={formatDuration(data.averageApprovalSeconds)}
          label="Átlagos jóváhagyási idő"
          description="Beküldéstől a jóváhagyásig / időzítésig"
        />
      </div>

      <div className="pnw-statistics-grid">
        <div className="pnw-stat-panel pnw-stat-panel-wide">
          <div className="pnw-card-heading">
            <div>
              <h4>Publikálások az elmúlt 6 hónapban</h4>
              <p>A Hírkezelőből publikált hírek havi alakulása.</p>
            </div>
          </div>
          <div className="pnw-mini-chart">
            {data.monthlyChart.map((month) => (
              <div className="pnw-mini-chart-item" key={month.key}>
                <strong>{month.count}</strong>
                <div className="pnw-mini-chart-track">
                  <span style={{ height: `${Math.max(5, Math.round((month.count / maxMonth) * 100))}%` }} />
                </div>
                <small>{monthLabel(month.key)}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="pnw-stat-panel">
          <div className="pnw-card-heading">
            <div>
              <h4>Legaktívabb beküldők</h4>
              <p>Publikált, időzített vagy archivált workflow-hírek alapján.</p>
            </div>
          </div>
          {data.topAuthors.length === 0 ? (
            <div className="pnw-empty-inline">Még nincs elegendő adat.</div>
          ) : (
            <div className="pnw-stat-list">
              {data.topAuthors.map((row) => (
                <div key={row.key}>
                  <span>{authors.get(row.key)?.displayName ?? 'Ismeretlen felhasználó'}</span>
                  <strong>{row.count}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pnw-stat-panel">
          <div className="pnw-card-heading">
            <div>
              <h4>Leggyakoribb kategóriák</h4>
              <p>Milyen témákban készül a legtöbb workflow-hír.</p>
            </div>
          </div>
          {data.topCategories.length === 0 ? (
            <div className="pnw-empty-inline">Még nincs elegendő adat.</div>
          ) : (
            <div className="pnw-stat-list">
              {data.topCategories.map((row) => (
                <div key={row.key}>
                  <span>{categoryNames.get(row.key)?.name ?? row.key}</span>
                  <strong>{row.count}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function MetricCard({ value, label, description }: { value: number | string; label: string; description: string }) {
  return (
    <div className="pnw-stat pnw-statistics-card">
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{description}</small>
    </div>
  )
}
