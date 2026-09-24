import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../../lib/hirkezelo/api.ts'
import type { ApiUser, AuthorDashboard, ReviewerDashboard } from '../../lib/hirkezelo/api.ts'
import { useUsers } from '../../lib/hirkezelo/useUsers.ts'
import { canSubmit } from '../../../shared/pnw/permissions.ts'
import { statusCssClass, statusLabel } from '../../../shared/pnw/statuses.ts'
import PostsTable from './PostsTable.tsx'

/** Ported from PNW_Frontend_Dashboard_Trait::render_dashboard(). */
export default function Dashboard({ user }: { user: ApiUser }) {
  const [data, setData] = useState<AuthorDashboard | ReviewerDashboard | null>(null)
  const authors = useUsers()

  useEffect(() => {
    let cancelled = false
    api.dashboard().then((result) => {
      if (!cancelled) setData(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="pnw-section">
      <div className="pnw-section-heading">
        <div>
          <div className="pnw-kicker">Állapot</div>
          <h3>Áttekintés</h3>
        </div>
      </div>

      {!data ? (
        <div className="pnw-empty-inline">Betöltés…</div>
      ) : data.view === 'author' ? (
        <AuthorView data={data} user={user} authors={authors} />
      ) : (
        <ReviewerView data={data} user={user} authors={authors} />
      )}
    </section>
  )
}

function StatCard({ count, label, status }: { count: number; label: string; status: string }) {
  return (
    <div className="pnw-stat">
      <span className={`pnw-status-dot pnw-status-${statusCssClass(status)}`} />
      <strong>{count}</strong>
      <span>{label}</span>
    </div>
  )
}

function AuthorView({
  data,
  user,
  authors,
}: {
  data: AuthorDashboard
  user: ApiUser
  authors: Map<string, ApiUser>
}) {
  return (
    <>
      <div className="pnw-stats">
        {Object.entries(data.counts).map(([status, count]) => (
          <StatCard key={status} count={count} label={statusLabel(status)} status={status} />
        ))}
      </div>
      <div className="pnw-table-card">
        <div className="pnw-card-heading">
          <h4>Saját híreim</h4>
          {/* Without pnw_submit_news this account cannot write news at all -
              an account may hold only, say, "Fiókok kezelése" now that there
              are no roles (AGENT.md 6.16). */}
          {canSubmit(user) && (
            <Link className="pnw-button" to="/hirkezelo/?pnw_view=new">
              + Új hír
            </Link>
          )}
        </div>
        <PostsTable posts={data.posts} reviewer={false} user={user} authors={authors} />
      </div>
    </>
  )
}

function ReviewerView({
  data,
  user,
  authors,
}: {
  data: ReviewerDashboard
  user: ApiUser
  authors: Map<string, ApiUser>
}) {
  return (
    <>
      <div className="pnw-stats">
        <StatCard count={data.pendingCount} label="Jóváhagyásra vár" status="pending" />
        <StatCard count={data.returnedCount} label="Javításra visszaküldve" status="pnw_revision" />
        <StatCard count={data.scheduledCount} label="Időzített" status="future" />
        <StatCard count={data.publishedTodayCount} label="Ma publikálva" status="publish" />
      </div>

      {canSubmit(user) && (
        <div className="pnw-table-card">
          <div className="pnw-card-heading">
            <div>
              <h4>Saját piszkozatok és javítások</h4>
              <p>A még be nem küldött vagy javításra visszaküldött hírek.</p>
            </div>
            <Link className="pnw-button" to="/hirkezelo/?pnw_view=new">
              + Új hír
            </Link>
          </div>
          <PostsTable posts={data.ownWorking} reviewer={false} user={user} authors={authors} />
        </div>
      )}

      <div className="pnw-table-card">
        <div className="pnw-card-heading">
          <div>
            <h4>Jóváhagyási sor</h4>
            <p>Legrégebbi beküldés elöl.</p>
          </div>
        </div>
        <PostsTable posts={data.pending} reviewer user={user} authors={authors} />
      </div>

      {data.scheduled.length > 0 && (
        <div className="pnw-table-card">
          <div className="pnw-card-heading">
            <div>
              <h4>Következő időzített hírek</h4>
              <p>A rendszer automatikusan publikálja őket a megadott időpontban.</p>
            </div>
          </div>
          <PostsTable posts={data.scheduled} reviewer user={user} authors={authors} />
        </div>
      )}

      <div className="pnw-table-card">
        <div className="pnw-card-heading">
          <h4>Legutóbbi döntések</h4>
        </div>
        <PostsTable posts={data.recent} reviewer user={user} authors={authors} />
      </div>
    </>
  )
}
