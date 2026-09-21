import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import PostFeed from '../components/divi/PostFeed.tsx'
import Text from '../components/divi/Text.tsx'
import './SzakmaiVizsga.css'

export default function SzakmaiVizsga() {
  return (
    <div id="main-content" className="page-szakmai-vizsga">
      <article className="post-1208 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="4_4" index={0} last>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>Szakmai vizsga</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>A középiskolai tanulmányok lezárása</p>
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
                      { slug: "2026-tavaszi-vizsgaidoszak-technikusi-vizsgaidopontok", date: "2026 ápr 28" },
                      { slug: "oszi-szakmai-vizsga-idopontok-2023", date: "2023 szept 28" },
                      { slug: "szakmai-vizsga-idopontok-2023-tavasz", date: "2023 márc 01" },
                      { slug: "javito-potlo-szakmai-vizsga-2022-osz", date: "2022 szept 20" },
                      { slug: "szakmai-vizsga-idopontok-2022-tavasz", date: "2022 ápr 01" },
                      { slug: "oszi-szakmai-vizsga-idopontok-2021", date: "2021 szept 18" },
                      { slug: "szakmai-vizsga-idopontok-2021-tavasz", date: "2021 márc 23" },
                      { slug: "oszi-potlo-es-javito-szakmai-vizsgak", date: "2020 szept 19" },
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
