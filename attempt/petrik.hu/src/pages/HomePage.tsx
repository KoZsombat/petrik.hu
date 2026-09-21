import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Blurb from '../components/divi/Blurb.tsx'
import Button from '../components/divi/Button.tsx'
import FullwidthHeader from '../components/divi/FullwidthHeader.tsx'
import Gallery from '../components/divi/Gallery.tsx'
import HeroSlider from '../components/divi/HeroSlider.tsx'
import Image from '../components/divi/Image.tsx'
import NumberCounter from '../components/divi/NumberCounter.tsx'
import PostFeed from '../components/divi/PostFeed.tsx'
import Text from '../components/divi/Text.tsx'
import VideoEmbed from '../components/divi/VideoEmbed.tsx'
import './HomePage.css'

export default function HomePage() {
  return (
    <div id="main-content" className="page-home">
      <article className="post-2 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first fullwidth>
                <HeroSlider
                  index={0}
                  intervalMs={7000}
                  headerOffset="116px"
                  slides={[
                  { image: "/media/wp-content/uploads/2020/08/kezdooldal_nyito_kep-scaled.jpg" },
                  { image: "/media/wp-content/uploads/2024/05/MG_6097-scaled.jpg" },
                  ]}
                />
              </Section>
              <Section index={1} dividerTop dividerBottom>
                <Row index={0}>
                  <Column span="4_4" index={0} last>
                    <Text index={0} align="left">
                      <p>Kiemelt híreink</p>
                    </Text>
                    <PostFeed
                      index={0}
                      columns={3}
                      align="left"
                      className="et_pb_with_border"
                      items={[
                      { slug: "szeptember-21-ei-nyilt-nap-a-petrikben", date: "2026 szept 11" },
                      { slug: "nyolcadikos-felveteli-elokeszito-foglalkozasok-a-2026-2027-tanevben", date: "2026 szept 08" },
                      { slug: "informaciok-az-indulo-esti-kepzesekrol-2026", date: "2026 aug 26" },
                      ]}
                    />
                  </Column>
                </Row>
                <Row index={1}>
                  <Column span="4_4" index={1} last>
                    <Text index={1} align="left">
                      Legfrissebb híreink
                    </Text>
                    <PostFeed
                      index={1}
                      columns={3}
                      align="left"
                      className="et_pb_with_border"
                      items={[
                      { slug: "kutatok-ejszakaja-a-petrikben", date: "2026 szept 15" },
                      { slug: "kodok-szuperhosok-es-urutazas-jon-az-idei-kodolas-hete-a-petrikben", date: "2026 szept 09" },
                      { slug: "palyazati-kiiras-bufe-uzemeltetesere", date: "2026 júl 28" },
                      { slug: "ujabb-orszagos-elismeres-a-dthpetrik-nek-innovativ-projekt-dijat-nyert-a-petrik-motion-pictures", date: "2026 jún 16" },
                      { slug: "europai-elismerest-nyert-a-lunaverzum-projekt", date: "2026 jún 04" },
                      { slug: "ceglatogatason-a-10-e-osztaly-betekintes-az-it-vilagaba", date: "2026 máj 14" },
                      { slug: "ceglatogatas-az-aimotive-kft-nel", date: "2026 máj 07" },
                      { slug: "etkezzes-igenybevetelenek-feltetelei-a-2026-2027-tanevben", date: "2026 ápr 27" },
                      { slug: "elmenybeszamolo-a-iii-civil-reggelirol-egyutt-ero-studio", date: "2026 ápr 19" },
                      { slug: "egy-nap-europai-parlamenti-kepviselokent-a-12-d-latogatasa-az-europa-elmenykozpontban", date: "2026 ápr 14" },
                      { slug: "petrik-motion-pictures-a-zaronap-amikor-minden-eletre-kelt", date: "2026 ápr 03" },
                      { slug: "petrik-motion-pictures-lenduletben-a-digitalis-temahet", date: "2026 márc 27" },
                      ]}
                    />
                  </Column>
                </Row>
              </Section>
              <Section index={2}>
                <Row index={2}>
                  <Column span="4_4" index={2} last>
                    <Text index={2} align="left">
                      Képzési kínálatunk
                    </Text>
                  </Column>
                </Row>
                <Row index={3}>
                  <Column span="1_3" index={3}>
                    <Image src="/media/wp-content/uploads/2020/08/vegyesz-agazat.jpg" width={1920} height={1281} srcSet="/media/wp-content/uploads/2020/08/vegyesz-agazat.jpg 1920w, /media/wp-content/uploads/2020/08/vegyesz-agazat-1280x854.jpg 1280w, /media/wp-content/uploads/2020/08/vegyesz-agazat-980x654.jpg 980w, /media/wp-content/uploads/2020/08/vegyesz-agazat-480x320.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 1920px, 100vw" loading="lazy" index={0} />
                    <Text index={3} align="left">
                      <h3 style={{ color: "#0c71c3" }}>Vegyipar</h3>
                      {' '}
                      <p style={{ color: "#ffdaa4", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Open Sans', Arial, sans-serif" }}><span style={{ color: "#72c3b6" }}>A JÖVŐ A TE KEZEDBEN</span></p>
                      {' '}
                      <p>A jövő gyógyszeripari vagy vegyipari szakembereként szeretnél hozzájárulni ahhoz, hogy az emberiség leküzdhesse az őt sújtó betegségeket, járványokat vagy egyre környezetbarátabb technológiákkal tegye kényelmesebbé a mindennapi életet? Több mint 140 éves hagyományokra visszatekintő vegyészeti képzésünk, amelynek része a két tanítási nyelvű képzés is, csak rád vár!</p>
                    </Text>
                    <Button index={0} to="/vegyipar_agazat" align="right" icon="T">Tudj meg róla többet</Button>
                  </Column>
                  <Column span="1_3" index={4}>
                    <Image src="/media/wp-content/uploads/2020/08/kornyezetvedelem-agazat.jpg" srcSet="/media/wp-content/uploads/2020/08/kornyezetvedelem-agazat-scaled.jpg 2560w, /media/wp-content/uploads/2020/08/kornyezetvedelem-agazat-1280x855.jpg 1280w, /media/wp-content/uploads/2020/08/kornyezetvedelem-agazat-980x654.jpg 980w, /media/wp-content/uploads/2020/08/kornyezetvedelem-agazat-480x320.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 2560px, 100vw" index={1} />
                    <Text index={4} align="left">
                      <h3 style={{ color: "#0c71c3" }}>Környezetvédelem és vízügy</h3>
                      {' '}
                      <p style={{ color: "#ffdaa4", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Open Sans', Arial, sans-serif" }}><span style={{ color: "#72c3b6" }}>a jÖVŐRŐL TE GondoskodSZ</span></p>
                      {' '}
                      <p>Ha törődsz a környezeteddel, de szeretnél többet tenni a megóvásáért, akkor a környezetvédelmi szakirány az, ami neked való. A környezetvédelem hivatás és tudomány is egyben. Gyakorlati tudásalapú képzésünk garancia arra, hogy a jövő környezetvédelmi szakemberévé válhass.</p>
                    </Text>
                    <Button index={1} to="/kornyezetvedelem_es_vizugy_agazat" align="right" icon="T">Tudj meg róla többet</Button>
                  </Column>
                  <Column span="1_3" index={5} last>
                    <Image src="/media/wp-content/uploads/2020/08/informatika-agazat.jpg" width={1920} height={1280} srcSet="/media/wp-content/uploads/2020/08/informatika-agazat.jpg 1920w, /media/wp-content/uploads/2020/08/informatika-agazat-1280x853.jpg 1280w, /media/wp-content/uploads/2020/08/informatika-agazat-980x653.jpg 980w, /media/wp-content/uploads/2020/08/informatika-agazat-480x320.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 1920px, 100vw" loading="lazy" index={2} />
                    <Text index={5} align="left">
                      <h3 style={{ color: "#0c71c3" }}>Informatika és távközlés</h3>
                      {' '}
                      <p style={{ color: "#ffdaa4", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Open Sans', Arial, sans-serif" }}><span style={{ color: "#72c3b6" }}>A jövő egy kattintásra tőled</span></p>
                      {' '}
                      <p>Informatikai szakirányunk képzései a jövő munkaerő-piacára készítik fel a tanulóinkat: gyakorlatorientált környezetben az elméleti, gyakorlati tantárgyakat az idegen nyelv tanulásával ötvözve olyan projektalapú oktatásban részesülhetsz, mely hidat képez a munka világa és az iskola között.</p>
                    </Text>
                    <Button index={2} to="/informatika_es_tavkozles_agazat" align="right" icon="T">Tudj meg róla többet</Button>
                  </Column>
                </Row>
              </Section>
              <Section index={3}>
                <Row index={4}>
                  <Column span="4_4" index={6} last>
                    <Text index={6} align="left">
                      Miért jelentkezz hozzánk?
                    </Text>
                  </Column>
                </Row>
                <Row index={5}>
                  <Column span="1_2" index={7}>
                    <Blurb index={0} align="left" position="left" title="Több mint 140 éves iskola" icon="Z">
                      <p>Hagyományaink nagy múltra tekintenek vissza</p>
                    </Blurb>
                    <Blurb index={1} align="left" position="left" title="Izgalmas projektek és programok a 21. századi készségek fejlesztéséért" icon="Z">
                      <p>Híd az iskola és a munka világa között</p>
                    </Blurb>
                    <Blurb index={2} align="left" position="left" title="A szakképzést nemzetközi szintre emeljük" icon="Z">
                      <p>Erasmus és eTwinning projektek részese lehetsz</p>
                    </Blurb>
                    <Blurb index={3} align="left" position="left" title="Dinamikus együttműködés a pedagógusok és a tanulók között" icon="Z">
                      <p>Itt számít, mit gondolsz!</p>
                    </Blurb>
                    <Blurb index={4} align="left" position="left" title="Pezsdítő sportélet" icon="Z">
                      <p>Sokféle sportprogramon, vagy szakkörön kamatoztathatod az eddig elsajtátított tudásod, vagy léphetsz a következő szintre</p>
                    </Blurb>
                    <Blurb index={5} align="left" position="left" title="Hogy egy igazi közösség tagjává válhass" icon="Z" />
                  </Column>
                  <Column span="1_2" index={8} last>
                    <Image src="/media/wp-content/uploads/2020/08/siker-scaled.jpg" width={2369} height={2560} srcSet="/media/wp-content/uploads/2020/08/siker-scaled.jpg 2369w, /media/wp-content/uploads/2020/08/siker-scaled-1280x1383.jpg 1280w, /media/wp-content/uploads/2020/08/siker-scaled-980x1059.jpg 980w, /media/wp-content/uploads/2020/08/siker-scaled-480x519.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 2369px, 100vw" loading="lazy" index={3} />
                  </Column>
                </Row>
              </Section>
              <Section index={4} dividerTop dividerBottom>
                <Row index={6}>
                  <Column span="4_4" index={9} last>
                    <Text index={7} align="left">
                      <p>Partnerek, Projektek, Szakmai programok</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={7}>
                  <Column span="1_6" index={10}>
                    <Image src="/media/wp-content/uploads/2021/10/mupa_partneriskola_logo_2021.jpg" width={1600} height={818} srcSet="/media/wp-content/uploads/2021/10/mupa_partneriskola_logo_2021.jpg 1600w, /media/wp-content/uploads/2021/10/mupa_partneriskola_logo_2021-1280x654.jpg 1280w, /media/wp-content/uploads/2021/10/mupa_partneriskola_logo_2021-980x501.jpg 980w, /media/wp-content/uploads/2021/10/mupa_partneriskola_logo_2021-480x245.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 1600px, 100vw" loading="lazy" href="/penz7-a-petrikben/" index={4} />
                  </Column>
                  <Column span="1_6" index={11}>
                    <Image src="/media/wp-content/uploads/2022/09/LanguageCert_partnerintezmeny_logo_v2-scaled.jpg" width={2560} height={1507} srcSet="/media/wp-content/uploads/2022/09/LanguageCert_partnerintezmeny_logo_v2-scaled.jpg 2560w, /media/wp-content/uploads/2022/09/LanguageCert_partnerintezmeny_logo_v2-scaled-1280x754.jpg 1280w, /media/wp-content/uploads/2022/09/LanguageCert_partnerintezmeny_logo_v2-scaled-980x577.jpg 980w, /media/wp-content/uploads/2022/09/LanguageCert_partnerintezmeny_logo_v2-scaled-480x283.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 2560px, 100vw" loading="lazy" href="https://languagecert.hu/" index={5} />
                  </Column>
                  <Column span="1_6" index={12}>
                    <Image src="/media/wp-content/uploads/2020/10/tempus_kozalapitvany.png" width={123} height={73} srcSet="/media/wp-content/uploads/2020/10/tempus_kozalapitvany.png 123w, /media/wp-content/uploads/2020/10/tempus_kozalapitvany-20x12.png 20w" sizes="(max-width: 123px) 100vw, 123px" loading="lazy" href="https://tka.hu/" index={6} />
                  </Column>
                  <Column span="1_6" index={13}>
                    <Image src="/media/wp-content/uploads/2020/10/logo-erasmus-plus.png" width={1758} height={358} srcSet="/media/wp-content/uploads/2020/10/logo-erasmus-plus.png 1758w, /media/wp-content/uploads/2020/10/logo-erasmus-plus-1280x261.png 1280w, /media/wp-content/uploads/2020/10/logo-erasmus-plus-980x200.png 980w, /media/wp-content/uploads/2020/10/logo-erasmus-plus-480x98.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 1758px, 100vw" loading="lazy" href="https://tka.hu/" index={7} />
                  </Column>
                  <Column span="1_6" index={14} />
                  <Column span="1_6" index={15} last />
                </Row>
                <Row index={8}>
                  <Column span="1_6" index={16}>
                    <Image src="/media/wp-content/uploads/2021/03/penz7.png" width={1033} height={1294} srcSet="/media/wp-content/uploads/2021/03/penz7.png 1033w, /media/wp-content/uploads/2021/03/penz7-980x1228.png 980w, /media/wp-content/uploads/2021/03/penz7-480x601.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) 1033px, 100vw" loading="lazy" href="/penz7-a-petrikben/" index={10} />
                  </Column>
                  <Column span="1_6" index={17}>
                    <Image src="/media/wp-content/uploads/2020/08/etwinning_school.png" width={349} height={381} srcSet="/media/wp-content/uploads/2020/08/etwinning_school.png 349w, /media/wp-content/uploads/2020/08/etwinning_school-275x300.png 275w, /media/wp-content/uploads/2020/08/etwinning_school-18x20.png 18w" sizes="(max-width: 349px) 100vw, 349px" loading="lazy" href="https://www.etwinning.net/hu/" index={11} />
                  </Column>
                  <Column span="1_6" index={18}>
                    <Image src="/media/wp-content/uploads/2023/10/6x_badge_DTH2023.png" width={300} height={300} srcSet="/media/wp-content/uploads/2023/10/6x_badge_DTH2023.png 300w, /media/wp-content/uploads/2023/10/6x_badge_DTH2023-150x150.png 150w, /media/wp-content/uploads/2023/10/6x_badge_DTH2023-20x20.png 20w" sizes="(max-width: 300px) 100vw, 300px" loading="lazy" href="/kategoria/egyeb/projekt/dthpetrik2023/" index={12} />
                  </Column>
                  <Column span="1_6" index={19}>
                    <Image src="/media/wp-content/uploads/2023/10/MicrosoftTeams-image-24.png" width={600} height={600} srcSet="/media/wp-content/uploads/2023/10/MicrosoftTeams-image-24.png 600w, /media/wp-content/uploads/2023/10/MicrosoftTeams-image-24-480x480.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" loading="lazy" href="https://codeweek.eu/" index={13} />
                  </Column>
                  <Column span="1_6" index={20}>
                    <Image src="/media/wp-content/uploads/2023/12/Partneriskola1733x1733_szines.png" width={1733} height={1733} srcSet="/media/wp-content/uploads/2023/12/Partneriskola1733x1733_szines.png 1733w, /media/wp-content/uploads/2023/12/Partneriskola1733x1733_szines-1280x1280.png 1280w, /media/wp-content/uploads/2023/12/Partneriskola1733x1733_szines-980x980.png 980w, /media/wp-content/uploads/2023/12/Partneriskola1733x1733_szines-480x480.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 1733px, 100vw" loading="lazy" href="https://www.otpfayalapitvany.hu/web/home" index={14} />
                  </Column>
                  <Column span="1_6" index={21} last>
                    <Gallery
                      index={0}
                      perPage={4}
                      items={[
                      { src: "/media/wp-content/uploads/2024/04/ProSuli_logo_vector_Yettel_RGB_lime-kek-400x284.png", width: 400, height: 284, srcSet: "/media/wp-content/uploads/2024/04/ProSuli_logo_vector_Yettel_RGB_lime-kek.png 479w, /media/wp-content/uploads/2024/04/ProSuli_logo_vector_Yettel_RGB_lime-kek-400x284.png 480w", sizes: "(max-width:479px) 479px, 100vw", loading: "lazy", full: "/media/wp-content/uploads/2024/04/ProSuli_logo_vector_Yettel_RGB_lime-kek.png" },
                      ]}
                    />
                  </Column>
                </Row>
              </Section>
              <Section index={5} dividerTop dividerBottom>
                <Row index={9}>
                  <Column span="4_4" index={22} last>
                    <Text index={8} align="left">
                      Rólunk – Aki Petrikes lesz…
                    </Text>
                  </Column>
                </Row>
                <Row index={10}>
                  <Column span="1_2" index={23}>
                    <Text index={9} align="left">
                      <p>… részévé válik egy több mint 140 éve létező hagyománynak, amit a Petrik neve fémjelez. Aki Petrikes lesz, egy elfogadó, egymást támogató iskolai közösség tagja lesz. Aki Petrikes lesz, olyan szaktudást kap, amellyel könnyedén elhelyezkedhet a munka világában, hiszen a Petrik neve garancia a kiemelkedő szaktudásra. Ha Petrikes leszel, olyan életre szóló élményekkel fogsz gazdagodni, amelyekre mindig vidáman és szeretettel gondolsz majd vissza. Mire vársz még?</p>
                    </Text>
                  </Column>
                  <Column span="1_2" index={24} last>
                    <VideoEmbed index={0} videoId="NnanAwvV8FI" title="Válaszd a Petriket!" />
                  </Column>
                </Row>
                <Row index={11}>
                  <Column span="1_5" index={25}>
                    <NumberCounter index={0} value={1178} title="Diák" />
                  </Column>
                  <Column span="1_5" index={26}>
                    <NumberCounter index={1} value={120} title="Oktató" />
                  </Column>
                  <Column span="1_5" index={27}>
                    <NumberCounter index={2} value={35} title="Tanterem" />
                  </Column>
                  <Column span="1_5" index={28}>
                    <NumberCounter index={3} value={23} title="Labor" />
                  </Column>
                  <Column span="1_5" index={29} last>
                    <NumberCounter index={4} value={1} title="Cél" />
                  </Column>
                </Row>
              </Section>
              <Section index={6} dividerTop dividerBottom>
                <Row index={12}>
                  <Column span="4_4" index={30} last>
                    <Text index={10} align="left">
                      Szakmai partnerek
                    </Text>
                  </Column>
                </Row>
                <Row index={13}>
                  <Column span="1_6" index={31}>
                    <Image src="/media/wp-content/uploads/2020/09/egis.png" width={800} height={600} srcSet="/media/wp-content/uploads/2020/09/egis.png 800w, /media/wp-content/uploads/2020/09/egis-480x360.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 800px, 100vw" loading="lazy" href="https://hu.egis.health/" index={15} />
                  </Column>
                  <Column span="1_6" index={32}>
                    <Image src="/media/wp-content/uploads/2020/09/richter_gedeon.png" width={800} height={600} srcSet="/media/wp-content/uploads/2020/09/richter_gedeon.png 800w, /media/wp-content/uploads/2020/09/richter_gedeon-480x360.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 800px, 100vw" loading="lazy" href="https://www.richter.hu/" index={16} />
                  </Column>
                  <Column span="1_6" index={33}>
                    <Image src="/media/wp-content/uploads/2020/09/teva.png" width={800} height={600} srcSet="/media/wp-content/uploads/2020/09/teva.png 800w, /media/wp-content/uploads/2020/09/teva-480x360.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 800px, 100vw" loading="lazy" href="https://www.teva.hu/" index={17} />
                  </Column>
                  <Column span="1_6" index={34}>
                    <Image src="/media/wp-content/uploads/2020/09/sanofi.png" width={800} height={600} srcSet="/media/wp-content/uploads/2020/09/sanofi.png 800w, /media/wp-content/uploads/2020/09/sanofi-480x360.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 800px, 100vw" loading="lazy" href="https://www.sanofi.hu/" index={18} />
                  </Column>
                  <Column span="1_6" index={35}>
                    <Image src="/media/wp-content/uploads/2020/09/cisco.png" width={800} height={600} srcSet="/media/wp-content/uploads/2020/09/cisco.png 800w, /media/wp-content/uploads/2020/09/cisco-480x360.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 800px, 100vw" loading="lazy" href="https://www.cisco.com/" index={19} />
                  </Column>
                  <Column span="1_6" index={36} last>
                    <Image src="/media/wp-content/uploads/2020/09/microsoft-logo.png" width={800} height={600} srcSet="/media/wp-content/uploads/2020/09/microsoft-logo.png 800w, /media/wp-content/uploads/2020/09/microsoft-logo-480x360.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 800px, 100vw" loading="lazy" href="http://microsoft.com/" index={20} />
                  </Column>
                </Row>
              </Section>
              <Section index={7} fullwidth>
                <FullwidthHeader
                  index={0}
                  heading="Budapesti Műszaki SZC Petrik Lajos Két Tanítási Nyelvű Technikum"
                  align="center"
                  text="Több mint 140 éve az érték a mérték!"
                  buttons={[
                  { label: "Elérhetőség", to: "/elerhetoseg/" },
                  { label: "Petrik alapítvány", to: "/elerhetoseg/" },
                  ]}
                />
              </Section>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
