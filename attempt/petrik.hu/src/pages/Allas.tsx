import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import PostFeed from '../components/divi/PostFeed.tsx'
import Text from '../components/divi/Text.tsx'
import './Allas.css'

export default function Allas() {
  return (
    <div id="main-content" className="page-allas">
      <article className="post-1086 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="1_2" index={0}>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>Állásajánlatok</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>Találd meg a jövőt a frissen szerzett szakértelmeddel.</p>
                    </Text>
                  </Column>
                  <Column span="1_2" index={1} last />
                </Row>
              </Section>
              <Section index={1} dividerTop dividerBottom>
                <Row index={1}>
                  <Column span="4_4" index={2} last>
                    <PostFeed
                      index={0}
                      columns={3}
                      align="left"
                      className="et_pb_with_border"
                      hasOlder
                      items={[
                      { slug: "allsalehetoseg-kornyezetvedelmi-technikusoknak", date: "2025 aug 12" },
                      { slug: "allaslehetoseg-kornyezetvedelmi-technikusoknak", date: "2025 aug 12" },
                      { slug: "allaslehetoseg-technikus-jellegu-feladatok-ellatasara", date: "2025 máj 18" },
                      { slug: "takarioi-allaslehetoseg", date: "2025 febr 02" },
                      { slug: "nyari-munkalehetoseg-12-evfolyamos-diakoknak", date: "2024 jún 04" },
                      { slug: "nemzeti-szakertoi-es-kutato-kozpont-vegyesz-technikus", date: "2023 aug 10" },
                      { slug: "nemzeti-nepegeszsegugyi-kozpont-laboratoriumi-technikust", date: "2023 júl 11" },
                      { slug: "magyar-lakk-laborans", date: "2023 jún 20" },
                      { slug: "torley-pezsgopinceszet-kft-laborans", date: "2023 jún 07" },
                      { slug: "ge-aviation-hungary-kft-vegyipari-operator", date: "2023 máj 05" },
                      { slug: "microsoft-net-frameworkon-alapulu-fejlesztok-magicsoftware", date: "2023 máj 03" },
                      { slug: "brilliance-tisztitoszer-gyarto-kft-vegyesz-technikus", date: "2023 ápr 26" },
                      { slug: "richter-gedeon-nyrt-vegyesz-technikus", date: "2023 ápr 26" },
                      { slug: "kti-kozlekedestudomanyi-intezet-nonprofit-kft-laborans", date: "2023 ápr 26" },
                      { slug: "cf-pharma-kft-gyogyszerhatoanyag-gyarto-2023-aprilis", date: "2023 ápr 13" },
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
