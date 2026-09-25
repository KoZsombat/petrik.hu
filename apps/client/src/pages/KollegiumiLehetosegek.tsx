import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Text from '../components/divi/Text.tsx'
import './KollegiumiLehetosegek.css'

export default function KollegiumiLehetosegek() {
  return (
    <div id="main-content" className="page-kollegiumi-lehetosegek">
      <article className="post-6266 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="4_4" index={0} last>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>BMSZC Bolyai János Kollégiuma</span></h1>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={1} dividerTop dividerBottom>
                <Row index={1}>
                  <Column span="4_4" index={1} last>
                    <Text index={1} align="left">
                      <p><strong>Felvételt nyert tanulóinknak lehetőségük van igénybe venni a BMSZC Bolyai János Kollégium szolgáltatásait.</strong></p>
                      {' '}
                      <p>&nbsp;</p>
                      {' '}
                      <p>A kollégium elérhetősége:&nbsp;</p>
                      {' '}
                      <p>1134 Budapest, Angyalföldi út 2.</p>
                      {' '}
                      <p>Kollégiumvezető: +36-70/502-15-63</p>
                      {' '}
                      <p>Tanári és ügyeleti szobák: +36-70/502-15-65 vagy 66</p>
                      {' '}
                      <p>Porta: +36-70/502-13-58</p>
                      {' '}
                      <p>Email: <a href="mailto:bolyai@bolyai-szakkozep.hu">bolyai@bolyai-szakkozep.hu</a></p>
                      {' '}
                      <p>Webhely: <a href="https://bolyai.bmszc.hu/p/bolyai-kollegium" target="_blank" rel="noreferrer">https://bolyai.bmszc.hu/p/bolyai-kollegium</a></p>
                      {' '}
                      <p>&nbsp;</p>
                      {' '}
                      <p>Működési rend:&nbsp;</p>
                      {' '}
                      <p>24 órás pedagógiai ügyelet: 06:00-14:00, 14:00-22:00, 22:00-06:00</p>
                      {' '}
                      <p>&nbsp;</p>
                      {' '}
                      <p>Étkezési elérhetőség:</p>
                      {' '}
                      <p>Vassné Stevlik Teréz</p>
                      {' '}
                      <p>Tel.: +36-20/852-85-97</p>
                      {' '}
                      <p>Email: ebedlemondas.obudal@gmail.com</p>
                      {' '}
                      <p>kollégiummal kapcsolatos tudnivalókat <a href="/media/wp-content/uploads/2024/04/BMSZC_Bolyai_Janos_Kollegium.pdf">itt</a> találják.</p>
                    </Text>
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
