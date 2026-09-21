import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * The sidebar search box.
 *
 * WordPress sent this to the server as `?s=`; here it navigates to the search
 * page, which filters the post index in the browser.
 */
export default function SearchWidget() {
  const [term, setTerm] = useState('')
  const navigate = useNavigate()

  return (
    <div id="search-2" className="et_pb_widget widget_search">
      <form
        role="search"
        className="searchform"
        onSubmit={(event) => {
          event.preventDefault()
          navigate(`/kereses/?q=${encodeURIComponent(term.trim())}`)
        }}
      >
        <div>
          <label className="screen-reader-text" htmlFor="s">
            Keresés:
          </label>
          <input
            type="search"
            id="s"
            name="s"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          />
          <input type="submit" id="searchsubmit" value="Keresés" />
        </div>
      </form>
    </div>
  )
}
