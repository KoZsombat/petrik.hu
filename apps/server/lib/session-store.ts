/**
 * express-session store backed by the same SQLite file as everything else
 * (data/db.ts, table `sessions`). Without one, express-session keeps sessions
 * in a process-local map: every restart or deploy logs everyone out, and the
 * map only ever grows. The base Store.createSession() turns the stored cookie
 * back into a Cookie instance (expires string -> Date), so this only has to
 * round-trip JSON.
 */
import session from 'express-session'
import { db } from '../data/db.ts'

type SessionData = session.SessionData

/** A cookie without maxAge still needs a row lifetime; the site's own cookie has 30 days. */
const FALLBACK_TTL_MS = 30 * 24 * 60 * 60 * 1000

const selectStatement = db.prepare('SELECT sess FROM sessions WHERE sid = ? AND expire > ?')
const upsertStatement = db.prepare(`
  INSERT INTO sessions (sid, sess, expire) VALUES (?, ?, ?)
  ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expire = excluded.expire
`)
const deleteStatement = db.prepare('DELETE FROM sessions WHERE sid = ?')
const touchStatement = db.prepare('UPDATE sessions SET expire = ? WHERE sid = ?')
const pruneStatement = db.prepare('DELETE FROM sessions WHERE expire <= ?')

/** Rows that outlived their cookie are dead weight; clear them on every boot. */
pruneStatement.run(Date.now())

function expiryOf(sess: SessionData): number {
  const expires = sess.cookie?.expires
  if (expires instanceof Date && Number.isFinite(expires.getTime())) return expires.getTime()
  return Date.now() + FALLBACK_TTL_MS
}

export class SqliteSessionStore extends session.Store {
  get(sid: string, callback: (err?: unknown, session?: SessionData | null) => void): void {
    try {
      const row = selectStatement.get(sid, Date.now()) as { sess: string } | undefined
      callback(undefined, row ? (JSON.parse(row.sess) as SessionData) : null)
    } catch (error) {
      callback(error)
    }
  }

  set(sid: string, sess: SessionData, callback?: (err?: unknown) => void): void {
    try {
      upsertStatement.run(sid, JSON.stringify(sess), expiryOf(sess))
      callback?.()
    } catch (error) {
      callback?.(error)
    }
  }

  destroy(sid: string, callback?: (err?: unknown) => void): void {
    try {
      deleteStatement.run(sid)
      callback?.()
    } catch (error) {
      callback?.(error)
    }
  }

  touch(sid: string, sess: SessionData, callback?: (err?: unknown) => void): void {
    try {
      touchStatement.run(expiryOf(sess), sid)
      callback?.()
    } catch (error) {
      callback?.(error)
    }
  }
}
