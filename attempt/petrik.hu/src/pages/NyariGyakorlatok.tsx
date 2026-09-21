import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Blurb from '../components/divi/Blurb.tsx'
import PostFeed from '../components/divi/PostFeed.tsx'
import Text from '../components/divi/Text.tsx'
import './NyariGyakorlatok.css'

export default function NyariGyakorlatok() {
  return (
    <div id="main-content" className="page-nyari-gyakorlatok">
      <article className="post-1537 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="4_4" index={0} last>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>Nyári gyakorlat</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>Vállalati környezetben, életszerű munkakörülmények között</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={1}>
                <Row index={1}>
                  <Column span="4_4" index={1} last>
                    <Text index={2} align="left">
                      <p>Nyári gyakorlathoz kapcsolodó bejegyzések</p>
                    </Text>
                    <PostFeed
                      index={0}
                      columns={3}
                      align="left"
                      items={[
                      { slug: "nyari-gyakorlat-dokumentumai", date: "febr 8, 2023", author: { name: "Tamás Györgyi", to: "/author/gyorgyi-tamas/" } },
                      ]}
                    />
                  </Column>
                </Row>
                <Row index={2}>
                  <Column span="1_3" index={2}>
                    <Text index={3} align="left">
                      <h1><strong>A nyári gyakorlatok koordinátorának elérhetőség</strong></h1>
                    </Text>
                    <Blurb index={0} align="left" position="left" icon="">
                      <p>Szolnok Ádám</p>
                    </Blurb>
                    <Blurb index={1} align="left" position="left" icon="">
                      <p>A.017 tanári</p>
                    </Blurb>
                    <Blurb index={2} align="left" position="left" icon="">
                      <a href="mailto:szolnok@petrik.hu">szolnok@petrik.hu</a>
                    </Blurb>
                  </Column>
                  <Column span="2_3" index={3} last />
                </Row>
              </Section>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
