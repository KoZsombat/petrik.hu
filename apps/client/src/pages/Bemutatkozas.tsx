import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Blurb from '../components/divi/Blurb.tsx'
import Divider from '../components/divi/Divider.tsx'
import Testimonial from '../components/divi/Testimonial.tsx'
import Text from '../components/divi/Text.tsx'
import VideoEmbed from '../components/divi/VideoEmbed.tsx'
import './Bemutatkozas.css'

export default function Bemutatkozas() {
  return (
    <div id="main-content" className="page-bemutatkozas">
      <article className="post-128 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first dividerBottom className="et_pb_with_border">
                <Row index={0} gutters={4}>
                  <Column span="4_4" index={0} last>
                    <Text index={0} align="left" />
                    <Text index={1} align="left">
                      Több mint 140 éve az érték a mérték
                    </Text>
                    <Divider index={0} />
                  </Column>
                </Row>
                <Row index={1} gutters={4}>
                  <Column span="1_2" index={1}>
                    <Text index={2} align="justified">
                      <p>A Petrik Lajos Szakgimnázium jogelődje, az Állami Középipartanoda, pontosan 140 éve, 1879. december 7-én nyitotta meg kapuit a diákság előtt.</p>
                      {' '}
                      <p>Az Állami Középipartanoda 1879. december 7-én nyitotta meg kapuit hallgatói előtt. Az ipar igényei szerint a gépészet, az építészet és a vegyészet szakirányokban kínáltak képzési lehetőséget. Az iskola első épülete a Főherceg Sándor tér (ma Gutenberg tér) 4. szám alatt működött. 1889-ben, a Hauszmann Alajos által tervezett, a József körút és a Népszínház utca sarkán álló új épületegyüttesbe költözött az iskola. Igazgatójának Hegedűs Károlyt nevezték ki, aki 35 éven keresztül látta el az intézményvezetés feladatait.</p>
                      {' '}
                      <p>1898-tól az iskola új neve Magyar Királyi Állami Felső Ipariskola lett. A négy fő szakirány a gépészet, a vegyipar, a fém- és vasipar, valamint a faipar volt.&nbsp;</p>
                      {' '}
                      <p>A vegyipari szakirány 1940-ben költözött a Thököly út 48. alatt álló iskolaépületbe, amely ma is otthonául szolgál.</p>
                    </Text>
                  </Column>
                  <Column span="1_2" index={2} last>
                    <Testimonial index={0} author="Petrik Lajos" align="justified" portrait="/media/wp-content/uploads/2020/08/petrik_lajos-az_iskola_nevadoja.jpg">
                      <p>Az iskola névadója, Petrik Lajos, 1880-tól tanára, 1905-től 1914-ig pedig igazgatója volt az intézménynek. Életpályáját a tudomány, a képzőművészet, a természet kihívásai iránti nyitottság jellemezte. Egyszerre volt tudós, tanár, keramikus, műgyűjtő és természetjáró.</p>
                    </Testimonial>
                  </Column>
                </Row>
              </Section>
              <Section index={1} dividerTop dividerBottom>
                <Row index={2} gutters={4}>
                  <Column span="4_4" index={3} last>
                    <Text index={3} align="left">
                      Iskolánkról
                    </Text>
                    <Divider index={1} />
                  </Column>
                </Row>
                <Row index={3}>
                  <Column span="4_4" index={4} last>
                    <Text index={4} align="justified">
                      <p>Iskolánk a főváros egyik legrégibb múltra visszatekintő középfokú szakképző intézménye. A BMSZC Petrik Lajos Két Tanítási Nyelvű Technikum jogelődje, az Állami Középipartanoda, 1879. december 7-én nyitotta meg kapuit a diákság előtt.</p>
                      {' '}
                      <p>Az ipar igényei szerint a gépészet, az építészet és a vegyészet szakirányokban kínáltak képzési lehetőséget. A vegyipari szakirány, önálló intézményként, 1940-ben költözött a Thököly út 48. alatt álló iskolaépületbe, amely ma is otthonául szolgál.</p>
                      {' '}
                      <p>A névadónk,&nbsp;<strong>Petrik Lajos</strong> által képviselt sokoldalúság, az értékek befogadása és továbbadása az a cél, amelyre iskolánk múltja, jelene és jövője épül. Ez a&nbsp;<strong>tradíció</strong>&nbsp;jut kifejezésre hagyományainkban, szakmai hitvallásunkban. Az elődök által kijelölt úton haladva célunk a&nbsp;<strong>tanulócentrikus</strong>, és ezen keresztül&nbsp;<strong>partnerközpontú&nbsp;</strong>iskola működtetése. Iskolánk&nbsp;<strong>nyitott</strong>&nbsp;a társadalmi elvárások és a&nbsp;<strong>változó munkaerő-piaci igények</strong>&nbsp;irányába, és folytonos&nbsp;<strong>újítással, megújulással</strong>, fejlesztéssel törekszik e feladatok ellátására. Kölcsönösen együttműködünk szakmai partnereinkkel. Oktató-nevelő munkánk során figyelembe vesszük, és beépítjük programunkba a szülők, a tanulók és a munkáltatók igényeit. A hozzánk járó tanulók az iskola két épületében található&nbsp;<strong>korszerű, jól felszerelt tantermekben, laboratóriumokban, informatikai és ipari modellező műhelyek</strong>ben sajátíthatják el a szakmák elméleti és gyakorlati ismereteit.</p>
                      {' '}
                      <p>Iskolánk mindig nagy gondot fordított arra, hogy tanulóinak képességeit minél szélesebb körben kibontakoztassa, és az elismerten magas színvonalú szakképzése mellett magasabb szintű általános műveltséget is adjon. Iskolánk híres, egykori diákjainak sorában köszönthetjük többek között Nádas Péter világhírű írót, Vajda Mihály filozófust, a Budapesti Iskola egyik alapítóját, Kovács László egykori külügyminisztert, Európai Uniós Biztost, valamint a magyar komoly- és könnyűzene olyan kimagasló alakjait, mint Oberfrank Géza, az Operaház egykori karnagya, Demjén Ferenc, Korda György és Földes László (Hobo).</p>
                      {' '}
                      <p>Kiemelt figyelmet fordítunk a nemzetközi kapcsolatok ápolására, folyamatosan részt veszünk az Erasmus+ programban, jelenleg Dániában, Portugáliában, Lengyelországban, Horvátországban, Spanyolországban, Görögországban, Litvániában, Olaszországban és Cipruson vannak partneriskoláink, partnerintézményeink.</p>
                      {' '}
                      <p>Iskolánk a HVG „Középiskola 2019” című kiadványában a szakgimnáziumok rangsorában az országos 10. helyezést érte el. A kiadvány szerint „A rangsorban élen végzett szakgimnáziumok a szakképzés elitjébe tartoznak […]”.</p>
                      {' '}
                      <p>Iskolánk fenntartója 2015. július 01-je óta a Budapesti Műszaki Szakképzési Centrum.</p>
                      {' '}
                      <p>Az iskola B épületének történetével foglalkozó honlap ezen a linken érhető el: <a href="https://petrikbepulet.webnode.hu/" target="_blank" rel="noreferrer">https://petrikbepulet.webnode.hu/</a></p>
                    </Text>
                    <Text index={5} align="left">
                      <p style={{ textAlign: "right" }}>Iskolavezetés</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={2} dividerTop dividerBottom>
                <Row index={4}>
                  <Column span="1_2" index={5}>
                    <Text index={6} align="left">
                      <p>Az iskola története</p>
                    </Text>
                    <VideoEmbed index={0} videoId="d3YG5QNkXA8" title="Iskolatörténet" />
                  </Column>
                  <Column span="1_2" index={6} last>
                    <Text index={7} align="left">
                      <p>Petrik Lajos</p>
                    </Text>
                    <VideoEmbed index={1} videoId="GHqyCVSEb7M" title="Petrik Lajos" />
                  </Column>
                </Row>
              </Section>
              <Section index={3} withBackground>
                <Row index={5}>
                  <Column span="4_4" index={7} last>
                    <Text index={8} align="left">
                      Díjak és elismerések
                    </Text>
                  </Column>
                </Row>
                <Row index={6}>
                  <Column span="1_2" index={8}>
                    <Blurb index={0} align="left" position="left" title={"Nemzetközi Együttműködési Kultúráért Nívódíj - a 'Játszunk Kémiát!' című Leonardo projektért."}>
                      <p style={{ textAlign: "right" }}>– 2013. május</p>
                    </Blurb>
                    <Blurb index={1} align="left" position="left" title="Digitális Témahét 2018 Innovatív Pedagógus díj Tóth Éva projektvezetőnek a Be Digitally Aware projektért">
                      <p style={{ textAlign: "right" }}>– 2018. május 18.</p>
                    </Blurb>
                    <Blurb index={2} align="left" position="left" title="Digitális Témahét 2019 pedagógus pályázat II. helyezés Tóth Éva projektvezetőnek a WorkIT c. projekttel">
                      <p style={{ textAlign: "right" }}>– 2019. június 8.</p>
                    </Blurb>
                    <Blurb index={3} align="left" position="left" title="Digitális Témahét 2019 Oracle Academy Program „Kódolj STEM projektet!” különdíj a WorkIt c. projektért szakképző intézményi kategóriában">
                      <p style={{ textAlign: "right" }}>–&nbsp;2019. június 8.</p>
                    </Blurb>
                  </Column>
                  <Column span="1_2" index={9} last>
                    <Blurb index={4} align="left" position="left" title={"#petrikcodeweek intézményi különdíj a Kódolás Hete versenyben, DPMK - 2019/10 •\tSzakképzési Díj 2020 elnyerése Innováció Kategóriában a Digitális Témahét a Petrikben: WorkIt c projektért -"}>
                      <p style={{ textAlign: "right" }}>– 2020. március 12.</p>
                    </Blurb>
                    <Blurb index={5} align="left" position="left" title="Richter Gedeon Alapítvány által létrehozott a Magyar Kémiaoktatásért Díj">
                      <p style={{ textAlign: "right" }}>2020 – Dr. Dóbéné Cserjés Edit<br /> 2016 – Vámos István<br /> 2015 – Dr. Stankovics Éva<br /> 2013 – Baranyiné C Veres Anna<br /> 2005 – Fogarasi József<br /> 2004 – Dr. Lovas Zoltánné<br /> 2003 – Ütő Piroska<br /> 2000 – Kisszékelyi Gyuláné<br /> 1999 – Surányi Istvánné</p>
                    </Blurb>
                    <Blurb index={6} align="left" position="left" title="Digitális Témahét 2020, “Nívódíjas Pedagógus” különdíj Tóth Éva projektvezetőnek a Socially Re-designed c. projektért">
                      <p style={{ textAlign: "right" }}>– 2020. július 1.</p>
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
