import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Button from '../components/divi/Button.tsx'
import Image from '../components/divi/Image.tsx'
import PostFeed from '../components/divi/PostFeed.tsx'
import Text from '../components/divi/Text.tsx'
import './Kozoktatas.css'

export default function Kozoktatas() {
  return (
    <div id="main-content" className="page-kozoktatas">
      <article className="post-1559 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="4_4" index={0} last>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>Közoktatás</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>Általános műveltség és az erős szakmai alapok építése</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={1} dividerTop dividerBottom>
                <Row index={1}>
                  <Column span="4_4" index={1} last>
                    <Text index={2} align="left">
                      <p>Közoktatáshoz kapcsolódó hírek</p>
                    </Text>
                    <PostFeed
                      index={0}
                      columns={3}
                      align="left"
                      className="et_pb_with_border"
                      hasOlder
                      items={[
                      { slug: "erettsegi-vizsgak-2024-osz", date: "2024 okt 24" },
                      { slug: "csibetabor-tajekoztato-2022", date: "2022 aug 23" },
                      { slug: "erettsegi-jelentkezes-idopontok-technikus-tanuloknak", date: "2022 jan 18" },
                      { slug: "tajekoztato-vegzosoknek-es-szuleiknek-a-szalagavato-napjarol", date: "2022 jan 03" },
                      { slug: "oszi-szakmai-vizsga-idopontok-2021", date: "2021 szept 18" },
                      { slug: "tanevnyito", date: "2021 aug 26" },
                      { slug: "a-petrik-alapitvany-tanulmanyi-osztondijaba-reszesulo-tanuloink", date: "2021 máj 31" },
                      { slug: "vizsgazoi-eszrevetel-kozep-es-emelt-szintu-erettsegi-dolgozatokhoz", date: "2021 máj 31" },
                      { slug: "tajekoztato-a-2021-evi-tavaszi-emelt-szintu-erettsegi-vizsgak-lebonyolitasarol", date: "2021 máj 03" },
                      { slug: "erettsegi-jelentkezes-technikus-tanuloknak", date: "2021 jan 31" },
                      ]}
                    />
                  </Column>
                </Row>
              </Section>
              <Section index={2}>
                <Row index={2}>
                  <Column span="4_4" index={2} last>
                    <Text index={3} align="left">
                      Képzési kínálatunk
                    </Text>
                  </Column>
                </Row>
                <Row index={3}>
                  <Column span="1_3" index={3}>
                    <Image src="/media/wp-content/uploads/2020/08/vegyesz-agazat.jpg" width={1920} height={1281} srcSet="/media/wp-content/uploads/2020/08/vegyesz-agazat.jpg 1920w, /media/wp-content/uploads/2020/08/vegyesz-agazat-1280x854.jpg 1280w, /media/wp-content/uploads/2020/08/vegyesz-agazat-980x654.jpg 980w, /media/wp-content/uploads/2020/08/vegyesz-agazat-480x320.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 1920px, 100vw" loading="lazy" index={0} />
                    <Text index={4} align="left">
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
                    <Text index={5} align="left">
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
                    <Text index={6} align="left">
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
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
