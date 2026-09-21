import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import PostFeed from '../components/divi/PostFeed.tsx'
import Text from '../components/divi/Text.tsx'
import './InMemoriam.css'

export default function InMemoriam() {
  return (
    <div id="main-content" className="page-in-memoriam">
      <article className="post-1387 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="4_4" index={0} last>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>In memorian</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>Örök emlékezetül</p>
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
                      { slug: "szenasy-jozsefne-emlekere", date: "2024 nov 08" },
                      { slug: "suranyi-istvanne-emlekere", date: "2022 nov 23" },
                      { slug: "somlai-ivanne-gyaszjelentes", date: "2022 márc 21" },
                      { slug: "bonifert-gyorgy-emlekere", date: "2020 szept 28" },
                      { slug: "golopencza-krisztina-emlekere", date: "2020 szept 28" },
                      { slug: "szomoru-szivvel-bucsuzunk-kedves-kolleganktol-bati-ivantol", date: "2020 szept 28" },
                      { slug: "bucsuzunk-mityko-janos-tanar-urtol", date: "2020 szept 28" },
                      { slug: "bucsuzunk-kedves-kolleganktol-kisszekelyi-evatol", date: "2020 szept 28" },
                      { slug: "demeny-istvan-emlekezetere", date: "2020 szept 28" },
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
