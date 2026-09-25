import './SharedCounts.css'

/**
 * The share bar under the single post.
 *
 * The original linked out to Facebook and Twitter and called a print dialog.
 * None of that is ported - the share URLs in the mirror are relative paths that
 * would mean nothing to Facebook anyway - so these are anchors without an href:
 * not links, not focusable, and they do nothing.
 *
 * They are rendered rather than dropped because the bar is 41px tall and
 * leaving it out pulled the end of the post up the page.
 */
export default function SharedCounts() {
  const facebook = (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="18.8125"
      height="32"
      viewBox="0 0 602 1024"
      aria-hidden="true"
    >
      <path d="M548 6.857v150.857h-89.714q-49.143 0-66.286 20.571t-17.143 61.714v108h167.429l-22.286 169.143h-145.143v433.714h-174.857v-433.714h-145.714v-169.143h145.714v-124.571q0-106.286 59.429-164.857t158.286-58.571q84 0 130.286 6.857z" />
    </svg>
  )

  return (
    <div className="shared-counts-wrap after_content style-block">
      <a className="shared-counts-button facebook_likes shared-counts-no-count" title="Like on Facebook">
        <span className="shared-counts-icon-label">
          <span className="shared-counts-icon">{facebook}</span>
          <span className="shared-counts-label">Like</span>
        </span>
      </a>
      <a className="shared-counts-button facebook_shares shared-counts-no-count" title="Share on Facebook">
        <span className="shared-counts-icon-label">
          <span className="shared-counts-icon">{facebook}</span>
          <span className="shared-counts-label">Share</span>
        </span>
      </a>
      <a className="shared-counts-button twitter shared-counts-no-count" title="Share on Twitter">
        <span className="shared-counts-icon-label">
          <span className="shared-counts-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M13.8944 10.4695L21.3345 2H19.5716L13.1085 9.35244L7.95022 2H1.99936L9.80147 13.1192L1.99936 22H3.76218L10.5832 14.2338L16.0318 22H21.9827L13.8944 10.4695ZM11.4792 13.2168L10.6875 12.1089L4.39789 3.30146H7.10594L12.1833 10.412L12.9717 11.5199L19.5708 20.7619H16.8628L11.4792 13.2168Z" />
            </svg>
          </span>
          <span className="shared-counts-label">Tweet</span>
        </span>
      </a>
      <a className="shared-counts-button print shared-counts-no-count" title="Print this Page">
        <span className="shared-counts-icon-label">
          <span className="shared-counts-icon">
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              width="29.71875"
              height="32"
              viewBox="0 0 951 1024"
              aria-hidden="true"
            >
              <path d="M219.429 877.714h512v-146.286h-512v146.286zM219.429 512h512v-219.429h-91.429q-22.857 0-38.857-16t-16-38.857v-91.429h-365.714v365.714zM877.714 548.571q0-14.857-10.857-25.714t-25.714-10.857-25.714 10.857-10.857 25.714 10.857 25.714 25.714 10.857 25.714-10.857 10.857-25.714zM950.857 548.571v237.714q0 7.429-5.429 12.857t-12.857 5.429h-128v91.429q0 22.857-16 38.857t-38.857 16h-548.571q-22.857 0-38.857-16t-16-38.857v-91.429h-128q-7.429 0-12.857-5.429t-5.429-12.857v-237.714q0-45.143 32.286-77.429t77.429-32.286h36.571v-310.857q0-22.857 16-38.857t38.857-16h384q22.857 0 50.286 11.429t43.429 27.429l86.857 86.857q16 16 27.429 43.429t11.429 50.286v146.286h36.571q45.143 0 77.429 32.286t32.286 77.429z" />
            </svg>
          </span>
          <span className="shared-counts-label">Print</span>
        </span>
      </a>{' '}
      {/* The mirror leaves a line break after this block, which is a real
          space where the sidebar's text begins. */}
    </div>
  )
}
