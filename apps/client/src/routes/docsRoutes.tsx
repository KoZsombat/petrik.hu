/**
 * Routes for the document library.
 *
 * These sit apart from App.tsx only to keep that file readable: there are 27
 * documents, each with a component of its own, and listing them inline would
 * bury the rest of the site. The guarantee is the same one App.tsx makes - a
 * component that is never wired up shows up as an unused file, and
 * scripts/check-routes.ts turns that into a check rather than a habit.
 */
import { Route } from 'react-router-dom'
import Doc6360 from '../pages/docs/Doc6360.tsx'
import DocAkadalymentesitesiNyilatkozat from '../pages/docs/DocAkadalymentesitesiNyilatkozat.tsx'
import DocAlapitoOkirat from '../pages/docs/DocAlapitoOkirat.tsx'
import DocAnalitikaGyakorlat from '../pages/docs/DocAnalitikaGyakorlat.tsx'
import DocDualisKepzesTajekoztato from '../pages/docs/DocDualisKepzesTajekoztato.tsx'
import DocEljarasrendAzEgeszsegugyiValsaghelyzetKezelesere from '../pages/docs/DocEljarasrendAzEgeszsegugyiValsaghelyzetKezelesere.tsx'
import DocEljarasrendek from '../pages/docs/DocEljarasrendek.tsx'
import DocGepeszetiEsAutomatizalasiMeresek from '../pages/docs/DocGepeszetiEsAutomatizalasiMeresek.tsx'
import DocGeptermiHazirend from '../pages/docs/DocGeptermiHazirend.tsx'
import DocHazirend from '../pages/docs/DocHazirend.tsx'
import DocJavitovizsga3 from '../pages/docs/DocJavitovizsga3.tsx'
import DocKemiaiEsFizikaiKemiai from '../pages/docs/DocKemiaiEsFizikaiKemiai.tsx'
import DocLaboratoriumiMuveletek from '../pages/docs/DocLaboratoriumiMuveletek.tsx'
import DocMunkaterv from '../pages/docs/DocMunkaterv.tsx'
import DocMuszakiIsmeretek from '../pages/docs/DocMuszakiIsmeretek.tsx'
import DocNemzetkoziesitesiStrategia from '../pages/docs/DocNemzetkoziesitesiStrategia.tsx'
import DocPetrikAlapitvany from '../pages/docs/DocPetrikAlapitvany.tsx'
import DocShimadzuLcsolution125 from '../pages/docs/DocShimadzuLcsolution125.tsx'
import DocStatisztika from '../pages/docs/DocStatisztika.tsx'
import DocSzakmaiProgram from '../pages/docs/DocSzakmaiProgram.tsx'
import DocSzervezetiEsMukodesiSzabalyzat from '../pages/docs/DocSzervezetiEsMukodesiSzabalyzat.tsx'
import DocTagintezmenyVezetoiPalyazatok from '../pages/docs/DocTagintezmenyVezetoiPalyazatok.tsx'
import DocTelepulesiIsmeretek from '../pages/docs/DocTelepulesiIsmeretek.tsx'
import DocTesztoldal from '../pages/docs/DocTesztoldal.tsx'
import DocTuzvedelmiSzabalyzat from '../pages/docs/DocTuzvedelmiSzabalyzat.tsx'
import DocUvMini12402 from '../pages/docs/DocUvMini12402.tsx'
import DocVegyipariMuveletek from '../pages/docs/DocVegyipariMuveletek.tsx'

export const docsRoutes = [
  <Route key="/docs/6360/" path="/docs/6360/" element={<Doc6360 />} />,
  <Route key="/docs/akadalymentesitesi-nyilatkozat/" path="/docs/akadalymentesitesi-nyilatkozat/" element={<DocAkadalymentesitesiNyilatkozat />} />,
  <Route key="/docs/alapito-okirat/" path="/docs/alapito-okirat/" element={<DocAlapitoOkirat />} />,
  <Route key="/docs/analitika-gyakorlat/" path="/docs/analitika-gyakorlat/" element={<DocAnalitikaGyakorlat />} />,
  <Route key="/docs/dualis-kepzes-tajekoztato/" path="/docs/dualis-kepzes-tajekoztato/" element={<DocDualisKepzesTajekoztato />} />,
  <Route key="/docs/eljarasrend-az-egeszsegugyi-valsaghelyzet-kezelesere/" path="/docs/eljarasrend-az-egeszsegugyi-valsaghelyzet-kezelesere/" element={<DocEljarasrendAzEgeszsegugyiValsaghelyzetKezelesere />} />,
  <Route key="/docs/eljarasrendek/" path="/docs/eljarasrendek/" element={<DocEljarasrendek />} />,
  <Route key="/docs/gepeszeti-es-automatizalasi-meresek/" path="/docs/gepeszeti-es-automatizalasi-meresek/" element={<DocGepeszetiEsAutomatizalasiMeresek />} />,
  <Route key="/docs/geptermi-hazirend/" path="/docs/geptermi-hazirend/" element={<DocGeptermiHazirend />} />,
  <Route key="/docs/hazirend/" path="/docs/hazirend/" element={<DocHazirend />} />,
  <Route key="/docs/javitovizsga-3/" path="/docs/javitovizsga-3/" element={<DocJavitovizsga3 />} />,
  <Route key="/docs/kemiai-es-fizikai-kemiai/" path="/docs/kemiai-es-fizikai-kemiai/" element={<DocKemiaiEsFizikaiKemiai />} />,
  <Route key="/docs/laboratoriumi-muveletek/" path="/docs/laboratoriumi-muveletek/" element={<DocLaboratoriumiMuveletek />} />,
  <Route key="/docs/munkaterv/" path="/docs/munkaterv/" element={<DocMunkaterv />} />,
  <Route key="/docs/muszaki-ismeretek/" path="/docs/muszaki-ismeretek/" element={<DocMuszakiIsmeretek />} />,
  <Route key="/docs/nemzetkoziesitesi-strategia/" path="/docs/nemzetkoziesitesi-strategia/" element={<DocNemzetkoziesitesiStrategia />} />,
  <Route key="/docs/petrik-alapitvany/" path="/docs/petrik-alapitvany/" element={<DocPetrikAlapitvany />} />,
  <Route key="/docs/shimadzu-lcsolution-125/" path="/docs/shimadzu-lcsolution-125/" element={<DocShimadzuLcsolution125 />} />,
  <Route key="/docs/statisztika/" path="/docs/statisztika/" element={<DocStatisztika />} />,
  <Route key="/docs/szakmai-program/" path="/docs/szakmai-program/" element={<DocSzakmaiProgram />} />,
  <Route key="/docs/szervezeti-es-mukodesi-szabalyzat/" path="/docs/szervezeti-es-mukodesi-szabalyzat/" element={<DocSzervezetiEsMukodesiSzabalyzat />} />,
  <Route key="/docs/tagintezmeny-vezetoi-palyazatok/" path="/docs/tagintezmeny-vezetoi-palyazatok/" element={<DocTagintezmenyVezetoiPalyazatok />} />,
  <Route key="/docs/telepulesi-ismeretek/" path="/docs/telepulesi-ismeretek/" element={<DocTelepulesiIsmeretek />} />,
  <Route key="/docs/tesztoldal/" path="/docs/tesztoldal/" element={<DocTesztoldal />} />,
  <Route key="/docs/tuzvedelmi-szabalyzat/" path="/docs/tuzvedelmi-szabalyzat/" element={<DocTuzvedelmiSzabalyzat />} />,
  <Route key="/docs/uv-mini-1240-2/" path="/docs/uv-mini-1240-2/" element={<DocUvMini12402 />} />,
  <Route key="/docs/vegyipari-muveletek/" path="/docs/vegyipari-muveletek/" element={<DocVegyipariMuveletek />} />,
]
