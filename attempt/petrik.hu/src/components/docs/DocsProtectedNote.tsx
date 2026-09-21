/**
 * Stands in for the two documents the original kept behind a password.
 *
 * Their pages are a WordPress login form posting to wp-login.php, which cannot
 * work without the backend, and their titles already carry WordPress's own
 * "Védett:" prefix. The frame around them is still rendered so the links to
 * them from every docs sidebar and from the archive keep working.
 */
export default function DocsProtectedNote() {
  return (
    <div className="docs-protected-note">
      <p>Ez a dokumentum jelszóval védett volt az eredeti oldalon, ezért a tartalma nem része a mentésnek.</p>
    </div>
  )
}
