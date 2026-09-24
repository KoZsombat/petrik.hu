/** Ported from PNW_Frontend_Shell_Trait::render_unauthorized(). */
export default function Unauthorized({ onLogout }: { onLogout: () => void }) {
  return (
    <section className="pnw-empty">
      <h2>Nincs hírkezelési jogosultságod</h2>
      <p>Ehhez a felülethez munkaközösség-vezetői vagy vezetői szerepkör szükséges.</p>
      <p>
        <button type="button" className="pnw-button pnw-button-secondary" onClick={onLogout}>
          Kijelentkezés
        </button>
      </p>
    </section>
  )
}
