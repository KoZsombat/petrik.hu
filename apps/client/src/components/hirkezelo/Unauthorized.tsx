/**
 * Ported from PNW_Frontend_Shell_Trait::render_unauthorized() - the original
 * checks for one of three roles, this one for "any permission at all", since
 * there are no roles here (AGENT.md 6.16).
 */
export default function Unauthorized({
  onLogout,
  title = 'Nincs hírkezelési jogosultságod',
  text = 'Ehhez a felülethez legalább egy jogosultság kell. Kérd meg valamelyik fiókkezelőt, hogy állítsa be a fiókodon.',
}: {
  onLogout: () => void
  /** The Szerkesztő reuses this screen with its own wording (AGENT.md 6.19). */
  title?: string
  text?: string
}) {
  return (
    <section className="pnw-empty">
      <h2>{title}</h2>
      <p>{text}</p>
      <p>
        <button type="button" className="pnw-button pnw-button-secondary" onClick={onLogout}>
          Kijelentkezés
        </button>
      </p>
    </section>
  )
}
