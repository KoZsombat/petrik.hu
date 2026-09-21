import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Button from '../components/divi/Button.tsx'
import Image from '../components/divi/Image.tsx'
import PostFeed from '../components/divi/PostFeed.tsx'
import Text from '../components/divi/Text.tsx'
import './TechnikusiKepzesek.css'

export default function TechnikusiKepzesek() {
  return (
    <div id="main-content" className="page-technikusi-kepzesek">
      <article className="post-2599 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="4_4" index={0} last>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>Szakképzés</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>Érettségi utáni technikusi képzéseink</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={1} dividerTop dividerBottom>
                <Row index={1}>
                  <Column span="4_4" index={1} last>
                    <Text index={2} align="left">
                      <p>Az érettségi utáni technikusi képzéseinket olyan diákok számára ajánljuk, akik:</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={2}>
                  <Column span="4_4" index={2} last>
                    <Text index={3} align="left">
                      <ul>
                        <li>még nem biztosak abban, hogy továbbtanulnának-e egyetemen/főiskolán, de mindenképp szeretnének valamilyen piacképes szaktudást szerezni;</li>
                        <li>meg akarják alapozni szaktudásukat a szakirányú továbbtanuláshoz;</li>
                        <li>2 év alatt, magas pályakezdő béreket biztosító szakmát szeretnének szerezni;</li>
                        <li>olyan szakmában helyezkednének el, ahol folyamatos a továbbképzés lehetősége;</li>
                        <li>tanulmányaik során nappali tagozaton akár a minimálbérrel megegyező, államilag garantált ösztöndíjban kívánnak részesülni;</li>
                        <li>a tanulás mellett munkába állnának – nekik esti tagozatos képzéseinket ajánljuk;</li>
                        <li>gyakorlatorientált képzések iránt érdeklődnek.</li>
                      </ul>
                    </Text>
                  </Column>
                </Row>
                <Row index={3}>
                  <Column span="1_2" index={3}>
                    <Text index={4} align="left">
                      <p>A BMSZC Petrik Lajos Két Tanítási Nyelvű Technikum, amely az ország egyik legrégebbi és legmagasabban jegyzett technikuma, mindezt kínálja a technikusi képzéseink iránt érdeklődők számára.</p>
                    </Text>
                  </Column>
                  <Column span="1_2" index={4} last>
                    <Text index={5} align="left">
                      <p>Iskolánk a belvárostól nem messze, az 5, 7, 7E, 8E, 30, 30A, 110, 112, 230 133E jelzésű buszok útvonalán található. A Keleti pályaudvar és a Zugló vasútállomás is 7-10 percre van az iskolától, így az agglomeráció felől is könnyen, 1 átszállással vagy 10 percnyi sétával megközelíthető.</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={2}>
                <Row index={4}>
                  <Column span="4_4" index={5} last>
                    <Text index={6} align="left">
                      Képzési kínálatunk
                    </Text>
                  </Column>
                </Row>
                <Row index={5}>
                  <Column span="1_3" index={6}>
                    <Image src="/media/wp-content/uploads/2020/08/vegyesz-agazat.jpg" width={1920} height={1281} srcSet="/media/wp-content/uploads/2020/08/vegyesz-agazat.jpg 1920w, /media/wp-content/uploads/2020/08/vegyesz-agazat-1280x854.jpg 1280w, /media/wp-content/uploads/2020/08/vegyesz-agazat-980x654.jpg 980w, /media/wp-content/uploads/2020/08/vegyesz-agazat-480x320.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 1920px, 100vw" index={0} />
                    <Text index={7} align="left">
                      <h3 style={{ color: "#0c71c3" }}>Vegyipar</h3>
                      {' '}
                      <p style={{ color: "#ffdaa4", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Open Sans', Arial, sans-serif" }}><span style={{ color: "#72c3b6" }}>A JÖVŐ A TE KEZEDBEN</span></p>
                      {' '}
                      <p>A jövő gyógyszeripari vagy vegyipari szakembereként szeretnél hozzájárulni ahhoz, hogy az emberiség leküzdhesse az őt sújtó betegségeket, járványokat vagy egyre környezetbarátabb technológiákkal tegye kényelmesebbé a mindennapi életet? Vegyész képzésünk több mint 140 éves múltra tekint vissza. Büszkék vagyunk hagyományainkra, történelmünkre.</p>
                    </Text>
                    <Button index={0} to="/vegyipar_agazat" align="right" icon="T">Tudj meg róla többet</Button>
                  </Column>
                  <Column span="1_3" index={7}>
                    <Image src="/media/wp-content/uploads/2020/08/kornyezetvedelem-agazat.jpg" srcSet="/media/wp-content/uploads/2020/08/kornyezetvedelem-agazat-scaled.jpg 2560w, /media/wp-content/uploads/2020/08/kornyezetvedelem-agazat-1280x855.jpg 1280w, /media/wp-content/uploads/2020/08/kornyezetvedelem-agazat-980x654.jpg 980w, /media/wp-content/uploads/2020/08/kornyezetvedelem-agazat-480x320.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 2560px, 100vw" index={1} />
                    <Text index={8} align="left">
                      <h3 style={{ color: "#0c71c3" }}>Környezetvédelem és vízügy</h3>
                      {' '}
                      <p style={{ color: "#ffdaa4", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Open Sans', Arial, sans-serif" }}><span style={{ color: "#72c3b6" }}>a jÖVŐRŐL TE GondoskodSZ</span></p>
                      {' '}
                      <p>Környezetvédelmi technikusi képzéseink iránt évek óta nagy az érdeklődés. Ha törődsz a környezeteddel, de szeretnél többet tenni a megóvásáért, akkor a környezetvédelmi szakirány az, ami neked való. A környezetvédelem hivatás és tudomány is egyben. Gyakorlati tudásalapú képzésünk garancia arra, hogy a jövő környezetvédelmi szakemberévé válhass.</p>
                    </Text>
                    <Button index={1} to="/kornyezetvedelem_es_vizugy_agazat" align="right" icon="T">Tudj meg róla többet</Button>
                  </Column>
                  <Column span="1_3" index={8} last>
                    <Image src="/media/wp-content/uploads/2020/08/informatika-agazat.jpg" width={1920} height={1280} srcSet="/media/wp-content/uploads/2020/08/informatika-agazat.jpg 1920w, /media/wp-content/uploads/2020/08/informatika-agazat-1280x853.jpg 1280w, /media/wp-content/uploads/2020/08/informatika-agazat-980x653.jpg 980w, /media/wp-content/uploads/2020/08/informatika-agazat-480x320.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 1920px, 100vw" loading="lazy" index={2} />
                    <Text index={9} align="left">
                      <h3 style={{ color: "#0c71c3" }}>Informatika és távközlés</h3>
                      {' '}
                      <p style={{ color: "#ffdaa4", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Open Sans', Arial, sans-serif" }}><span style={{ color: "#72c3b6" }}>A jövő egy kattintásra tőled</span></p>
                      {' '}
                      <p>Informatikus technikusi képzéseink iránt évek óta hatalmas az érdeklődés. Informatikai szakirányunk képzései a jövő munkaerő-piacára készítik fel a tanulóinkat: gyakorlatorientált környezetben az elméleti, gyakorlati tantárgyakat az idegen nyelv tanulásával ötvözve olyan projektalapú oktatásban részesülhetsz, mely hidat képez a munka világa és az iskola között.</p>
                    </Text>
                    <Button index={2} to="/informatika_es_tavkozles_agazat" align="right" icon="T">Tudj meg róla többet</Button>
                  </Column>
                </Row>
              </Section>
              <Section index={3} dividerTop dividerBottom>
                <Row index={6}>
                  <Column span="4_4" index={9} last>
                    <Text index={10} align="left">
                      <p>Szakképzéshez kapcsolódó hírek</p>
                    </Text>
                    <PostFeed
                      index={0}
                      columns={3}
                      align="left"
                      className="et_pb_with_border"
                      hasOlder
                      items={[
                      { slug: "2026-tavaszi-vizsgaidoszak-technikusi-vizsgaidopontok", date: "2026 ápr 28" },
                      { slug: "megnyilt-a-jelentkezesi-lehetoseg-osszel-indulo-kepzeseinkre", date: "2025 aug 13" },
                      { slug: "oszi-szakmai-vizsga-idopontok-2023", date: "2023 szept 28" },
                      { slug: "technikusi-beiratkozas-julius-3", date: "2023 jún 27" },
                      { slug: "technikusi-beiratkozas", date: "2023 ápr 21" },
                      { slug: "e-jelentkezes-2023-24", date: "2023 ápr 21" },
                      ]}
                    />
                  </Column>
                </Row>
              </Section>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
