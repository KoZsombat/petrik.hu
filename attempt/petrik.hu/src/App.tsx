import { Route, Routes } from 'react-router-dom'
import ArchiveView from './components/ArchiveView.tsx'
import Layout from './components/Layout.tsx'
import { archives } from './data/archives.ts'
import { docsRoutes } from './routes/docsRoutes.tsx'
import AdatkezelesiTajekoztato from './pages/AdatkezelesiTajekoztato.tsx'
import DocTaxonomy from './pages/DocTaxonomy.tsx'
import Dokumentumtar from './pages/Dokumentumtar.tsx'
import KutatokEjszakaja from './pages/KutatokEjszakaja.tsx'
import NotFound from './pages/NotFound.tsx'
import Search from './pages/Search.tsx'
import AboutUs from './pages/AboutUs.tsx'
import Adatvedelem from './pages/Adatvedelem.tsx'
import Allas from './pages/Allas.tsx'
import Bemutatkozas from './pages/Bemutatkozas.tsx'
import Ebed from './pages/Ebed.tsx'
import Egeszsegugy from './pages/Egeszsegugy.tsx'
import Elerhetoseg from './pages/Elerhetoseg.tsx'
import ErettsegiVizsga from './pages/ErettsegiVizsga.tsx'
import HomePage from './pages/HomePage.tsx'
import InMemoriam from './pages/InMemoriam.tsx'
import InformatikaAgazat from './pages/InformatikaAgazat.tsx'
import KollegiumiLehetosegek from './pages/KollegiumiLehetosegek.tsx'
import KornyezetvedelemAgazat from './pages/KornyezetvedelemAgazat.tsx'
import Kozoktatas from './pages/Kozoktatas.tsx'
import KozossegiSzolgalat from './pages/KozossegiSzolgalat.tsx'
import LanguagecertVizsgak from './pages/LanguagecertVizsgak.tsx'
import NyariGyakorlatok from './pages/NyariGyakorlatok.tsx'
import Nyolcadikos from './pages/Nyolcadikos.tsx'
import OrokosOkoiskola from './pages/OrokosOkoiskola.tsx'
import Projekt from './pages/Projekt.tsx'
import SzakmaiVizsga from './pages/SzakmaiVizsga.tsx'
import TanariKar from './pages/TanariKar.tsx'
import TechnikusiKepzesek from './pages/TechnikusiKepzesek.tsx'
import VegyiparAgazat from './pages/VegyiparAgazat.tsx'

/**
 * Route table for the ported site. The original WordPress URLs are kept,
 * trailing slash included, so existing links keep resolving.
 *
 * Pages are listed explicitly rather than resolved from a slug, so a page
 * component that is never wired up shows up as an unused file rather than
 * silently falling through to the 404.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about-us/" element={<AboutUs />} />
        <Route path="/adatvedelem/" element={<Adatvedelem />} />
        <Route path="/allas/" element={<Allas />} />
        <Route path="/bemutatkozas/" element={<Bemutatkozas />} />
        <Route path="/ebed/" element={<Ebed />} />
        <Route path="/egeszsegugy/" element={<Egeszsegugy />} />
        <Route path="/elerhetoseg/" element={<Elerhetoseg />} />
        <Route path="/erettsegi-vizsga/" element={<ErettsegiVizsga />} />
        <Route path="/in-memoriam/" element={<InMemoriam />} />
        <Route path="/informatika_es_tavkozles_agazat/" element={<InformatikaAgazat />} />
        <Route path="/kollegiumi-lehetosegek/" element={<KollegiumiLehetosegek />} />
        <Route path="/kornyezetvedelem_es_vizugy_agazat/" element={<KornyezetvedelemAgazat />} />
        <Route path="/kozoktatas/" element={<Kozoktatas />} />
        <Route path="/kozossegi-szolgalat/" element={<KozossegiSzolgalat />} />
        <Route path="/languagecert-vizsgak/" element={<LanguagecertVizsgak />} />
        <Route path="/nyari-gyakorlatok/" element={<NyariGyakorlatok />} />
        <Route path="/nyolcadikos/" element={<Nyolcadikos />} />
        <Route path="/orokos-okoiskola/" element={<OrokosOkoiskola />} />
        <Route path="/projekt/" element={<Projekt />} />
        <Route path="/szakmai-vizsga/" element={<SzakmaiVizsga />} />
        <Route path="/tanari-kar/" element={<TanariKar />} />
        <Route path="/technikusi-kepzesek/" element={<TechnikusiKepzesek />} />
        <Route path="/vegyipar_agazat/" element={<VegyiparAgazat />} />
        <Route path="/adatkezelesi-tajekoztato/" element={<AdatkezelesiTajekoztato />} />
        <Route path="/kereses/" element={<Search />} />

        {/* The document library. The docs pages themselves are generated and
            wired up in src/routes/docsRoutes.tsx. */}
        <Route path="/dokumentumtar/" element={<Dokumentumtar />} />
        <Route path="/dokumentum-kategoria/:slug/" element={<DocTaxonomy kind="category" />} />
        <Route path="/dokumentum-cimke/:slug/" element={<DocTaxonomy kind="tag" />} />
        {docsRoutes}

        {/* The one blog post that is part of this port. Every other post shows
            as a card that says it is not in the snapshot. */}
        <Route path="/kutatok-ejszakaja-a-petrikben/" element={<KutatokEjszakaja />} />

        {/* The 64 category, date and author archives. These are mapped from the
            data rather than listed: one component renders all of them, so the
            "an unwired page shows up as an unused file" argument that keeps the
            rest of this table explicit does not apply. */}
        {Object.values(archives).map((archive) => (
          <Route key={archive.route} path={archive.route} element={<ArchiveView />} />
        ))}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
