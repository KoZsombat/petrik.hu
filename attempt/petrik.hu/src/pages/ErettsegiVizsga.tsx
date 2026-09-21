import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import PostFeed from '../components/divi/PostFeed.tsx'
import Text from '../components/divi/Text.tsx'
import './ErettsegiVizsga.css'

export default function ErettsegiVizsga() {
  return (
    <div id="main-content" className="page-erettsegi-vizsga">
      <article className="post-1200 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="4_4" index={0} last>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>Érettségi</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>A felsőoktatás kapujában</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={1} dividerTop dividerBottom>
                <Row index={1}>
                  <Column span="4_4" index={1} last>
                    <PostFeed
                      index={0}
                      columns={3}
                      align="left"
                      className="et_pb_with_border"
                      items={[
                      { slug: "erettsegi-vizsgak-2024-osz", date: "2024 okt 24" },
                      { slug: "erettsegi-jelentkezes-idopontok-technikus-tanuloknak", date: "2022 jan 18" },
                      { slug: "vizsgazoi-eszrevetel-kozep-es-emelt-szintu-erettsegi-dolgozatokhoz", date: "2021 máj 31" },
                      { slug: "tajekoztato-a-2021-evi-tavaszi-emelt-szintu-erettsegi-vizsgak-lebonyolitasarol", date: "2021 máj 03" },
                      { slug: "erettsegi-jelentkezes-technikus-tanuloknak", date: "2021 jan 31" },
                      { slug: "emelt-erettsegi-szobeli-biztonsagi-intezkedesek", date: "2020 nov 12" },
                      { slug: "emelt-es-kozepszintu-erettsegi-dolgozatok-vizsgazoi-eszrevetelek", date: "2020 nov 09" },
                      { slug: "oszi-emelt-szintu-erettsegi-vizsgakozpont-tajekoztato", date: "2020 okt 16" },
                      { slug: "oszi-erettsegi-vizsgaidoszak", date: "2020 szept 17" },
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
