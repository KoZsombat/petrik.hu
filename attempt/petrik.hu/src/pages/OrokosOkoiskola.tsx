import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Blurb from '../components/divi/Blurb.tsx'
import PostFeed from '../components/divi/PostFeed.tsx'
import Text from '../components/divi/Text.tsx'
import './OrokosOkoiskola.css'

export default function OrokosOkoiskola() {
  return (
    <div id="main-content" className="page-orokos-okoiskola">
      <article className="post-2063 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="1_2" index={0}>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>Ökoiskola</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>Környezeti nevelés és fenntarthatóság</p>
                    </Text>
                  </Column>
                  <Column span="1_2" index={1} last />
                </Row>
              </Section>
              <Section index={1}>
                <Row index={1}>
                  <Column span="4_4" index={2} last>
                    <Text index={2} align="left">
                      <p>Kedves Petrikesek!&nbsp;</p>
                    </Text>
                    <Text index={3} align="left">
                      <p>Iskolánk elnyerte az Örökös Ökoiskola címet.</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={2} dividerTop dividerBottom>
                <Row index={2}>
                  <Column span="4_4" index={3} last>
                    <Text index={4} align="left">
                      <p>Ökoiskolával kapcsolatos hírek</p>
                    </Text>
                    <PostFeed
                      index={0}
                      columns={3}
                      align="left"
                      items={[
                      { slug: "mozdulj-a-klimaert" },
                      { slug: "fold-napja" },
                      ]}
                    />
                  </Column>
                </Row>
              </Section>
              <Section index={3}>
                <Row index={3}>
                  <Column span="1_3" index={4}>
                    <Text index={5} align="left">
                      <h1>Elérhetőség</h1>
                    </Text>
                    <Blurb index={0} align="left" position="left" title="Dr. Szabó Marianna" icon="" />
                    <Blurb index={1} align="left" position="left" title="B. épület 010" icon="" />
                    <Blurb index={2} align="left" position="left" title="dr.szabo.marianna@petrik.hu" titleHref="mailto:dr.szabo.marianna@petrik.hu" icon="" />
                  </Column>
                  <Column span="2_3" index={5} last>
                    <Text index={6} align="left">
                      <h1>Örökös Ökoiskola adatok</h1>
                    </Text>
                    <Blurb index={3} align="left" position="left" icon="">
                      <p><strong>Intézmény:</strong> Petrik Lajos Technikum</p>
                    </Blurb>
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
