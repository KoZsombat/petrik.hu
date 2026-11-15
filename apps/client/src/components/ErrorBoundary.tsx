import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Without one, a render error unmounts the whole tree and the visitor is left
 * with a blank page. This replaces that with the site's own 404-style block
 * and keeps the details in the console. A plain link (a full reload) is the
 * only safe recovery here: the router itself may be what failed.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[petrik] render error', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div id="main-content">
        <div className="container">
          <div id="content-area">
            <article className="et_pb_post">
              <h1 className="entry-title">Váratlan hiba történt</h1>
              <p>
                Az oldal betöltése közben hiba lépett fel. Töltsd újra az oldalt, vagy menj vissza a{' '}
                <a href="/">kezdőlapra</a>.
              </p>
            </article>
          </div>
        </div>
      </div>
    )
  }
}
