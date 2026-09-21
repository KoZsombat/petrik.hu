import { Link } from 'react-router-dom'

/**
 * Stands in for WordPress's 404 template, which the mirror does not contain.
 */
export default function NotFound() {
  return (
    <div id="main-content">
      <div className="container">
        <div id="content-area">
          <article className="et_pb_post">
            <h1 className="entry-title">A keresett oldal nem található</h1>
            <p>
              Ez az oldal nem szerepel a mentésben. Vissza a <Link to="/">kezdőlapra</Link>.
            </p>
          </article>
        </div>
      </div>
    </div>
  )
}
