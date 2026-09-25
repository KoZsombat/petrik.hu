import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Blurb from '../components/divi/Blurb.tsx'
import Text from '../components/divi/Text.tsx'
import './Adatvedelem.css'

export default function Adatvedelem() {
  return (
    <div id="main-content" className="page-adatvedelem">
      <article className="post-5103 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="1_2" index={0}>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>Adatvédelem</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>A természetes személyeket a személyes adataik kezelésével kapcsolatos Általános adatvédelem&nbsp;</p>
                    </Text>
                  </Column>
                  <Column span="1_2" index={1} last />
                </Row>
              </Section>
              <Section index={1}>
                <Row index={1}>
                  <Column span="4_4" index={2} last>
                    <Text index={2} align="left">
                      <p>Adatvédelmi tisztviselő:</p>
                    </Text>
                    <Text index={3} align="left">
                      <p>Csőke Ádám<br />Címe: 1149 Budapest, Várna u. 23.<br />E-mail címe: gdpr@petrik.hu</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={2} dividerBottom>
                <Row index={2}>
                  <Column span="4_4" index={3} last>
                    <Text index={4} align="left">
                      <p>Adatvédelmi dokumentumok</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={3}>
                  <Column span="1_2" index={4}>
                    <Text index={5} align="left">
                      <p>Alap dokumentumok</p>
                    </Text>
                    <Blurb index={0} align="left" position="left" icon="">
                      <p>Adatkezelési tevékenységek Nyilvántartás</p>
                    </Blurb>
                    <Blurb index={1} align="left" position="left" icon="">
                      <p>Általános adatkezelési tájékoztató</p>
                    </Blurb>
                    <Blurb index={2} align="left" position="left" icon="">
                      <p>Intézményi adatkezelési szabályzat</p>
                    </Blurb>
                    <Blurb index={3} align="left" position="left" icon="">
                      <p>Iratkezelési szabályzat</p>
                    </Blurb>
                    <Blurb index={4} align="left" position="left" icon="">
                      <p>Kamera szabályzat</p>
                    </Blurb>
                  </Column>
                  <Column span="1_2" index={5} last>
                    <Text index={6} align="left">
                      <p>Sablon dokumentumok</p>
                    </Text>
                    <Blurb index={5} align="left" position="left" icon="">
                      <p>Adatkezelési tájékoztató hozzájárulás alapján ……………-hoz</p>
                    </Blurb>
                    <Blurb index={6} align="left" position="left" icon="">
                      <p>ADATKEZELÉSI HOZZÁJÁRULÁS hozzájárulás alapján kezelt adatokhoz törvényes képviselő</p>
                    </Blurb>
                    <Blurb index={7} align="left" position="left" icon="">
                      <p>ADATKEZELÉSI HOZZÁJÁRULÁS hozzájárulás alapján kezelt adatokhoz</p>
                    </Blurb>
                    <Blurb index={8} align="left" position="left" icon="">
                      <p>Tájékoztatás nem hozzájárulás alapján kezelt adatok esetében törvényes képviselő részére</p>
                    </Blurb>
                    <Blurb index={9} align="left" position="left" icon="">
                      <p>Tájékoztatás nem hozzájárulás alapján kezelt adatok esetében</p>
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
