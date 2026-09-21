import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Blurb from '../components/divi/Blurb.tsx'
import PostFeed from '../components/divi/PostFeed.tsx'
import Text from '../components/divi/Text.tsx'
import './Ebed.css'

export default function Ebed() {
  return (
    <div id="main-content" className="page-ebed">
      <article className="post-790 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="1_2" index={0}>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>Étkezés</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>Kedvezményes étkezési lehetőség</p>
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
                      <p>Lehetőségetek van az egy utcára található kollégiumi menzán kedvezményes étkezésre.</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={2} dividerBottom>
                <Row index={2}>
                  <Column span="4_4" index={3} last>
                    <Text index={4} align="left">
                      <p>Étkezéssel kapcsolatos hírek</p>
                    </Text>
                    <PostFeed
                      index={0}
                      columns={3}
                      align="left"
                      items={[
                      { slug: "etkezzes-igenybevetelenek-feltetelei-a-2026-2027-tanevben", date: "ápr 27, 2026", author: { name: "Gál-Berey Csilla", to: "/author/galberey/" } },
                      { slug: "figyelem-valtozas-az-ebedeltetesi-rendben", date: "jan 5, 2024", author: { name: "Tamás Györgyi", to: "/author/gyorgyi-tamas/" } },
                      { slug: "etkezesi-teritesi-dij-2024-januar", date: "dec 11, 2023", author: { name: "Tamás Györgyi", to: "/author/gyorgyi-tamas/" } },
                      ]}
                    />
                  </Column>
                </Row>
              </Section>
              <Section index={4} dividerBottom>
                <Row index={3}>
                  <Column span="4_4" index={4} last>
                    <Text index={5} align="left">
                      <p>Az igényléshez szükséges dokumentumok</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={4}>
                  <Column span="1_2" index={5}>
                    <Blurb index={0} align="left" position="left" icon="">
                      <p>Szülői tájékoztató a 2025-2026 tanévre</p>
                    </Blurb>
                    <Blurb index={1} align="left" position="left" icon="">
                      <p>Kedvezményes étkezéssel kapcsolatos tájékoztató</p>
                    </Blurb>
                    <Blurb index={2} align="left" position="left" icon="">
                      <p>Adatlap Diétás étkezés igényléséhez</p>
                    </Blurb>
                    <Blurb index={3} align="left" position="left" icon="">
                      <p>Igénylőlap 2025-26 tanévre</p>
                    </Blurb>
                  </Column>
                  <Column span="1_2" index={6} last>
                    <Blurb index={4} align="left" position="left" icon="">
                      <p>8 számű melléklet</p>
                    </Blurb>
                    <Blurb index={5} align="left" position="left" icon="">
                      <p>9 számű melléklet</p>
                    </Blurb>
                  </Column>
                </Row>
              </Section>
              <Section index={5}>
                <Row index={5}>
                  <Column span="4_4" index={7} last>
                    <Text index={6} align="left">
                      <h1>Elérhetőség</h1>
                    </Text>
                    <Blurb index={6} align="left" position="left" title="Tolnai Ferencné" icon="" />
                    <Blurb index={7} align="left" position="left" title="1134 Budapest, Róbert Károly krt. 49-51." icon="" />
                    <Blurb index={8} align="left" position="left" icon="">
                      <p>tolnai.ferencne@eszgsz.hu&nbsp;</p>
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
