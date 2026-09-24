/**
 * Ported from PNW_Frontend_Shell_Trait::render_unauthorized() - the original
 * checks for one of three roles, this one for "any permission at all", since
 * there are no roles here (AGENT.md 6.16).
 */
export default function Unauthorized({ onLogout }: { onLogout: () => void }) {
  return (
    <section className="pnw-empty">
      <h2>Nincs hírkezelési jogosultságod</h2>
      <p>
        Ehhez a felülethez legalább egy jogosultság kell. Kérd meg valamelyik fiókkezelőt, hogy állítsa be a
        fiókodon.
      </p>
      <p>
        <button type="button" className="pnw-button pnw-button-secondary" onClick={onLogout}>
          Kijelentkezés
        </button>
      </p>
    </section>
  )
}
