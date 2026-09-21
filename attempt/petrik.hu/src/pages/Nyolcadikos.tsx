import { Link } from 'react-router-dom'
import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Blurb from '../components/divi/Blurb.tsx'
import Button from '../components/divi/Button.tsx'
import PostFeed from '../components/divi/PostFeed.tsx'
import PricingTables from '../components/divi/PricingTables.tsx'
import Text from '../components/divi/Text.tsx'
import './Nyolcadikos.css'

export default function Nyolcadikos() {
  return (
    <div id="main-content" className="page-nyolcadikos">
      <article className="post-1111 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="4_4" index={0} last>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>Nyolcadikosoknak</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>A továbbtanulás kapujában</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={1}>
                <Row index={1}>
                  <Column span="4_4" index={1} last>
                    <Text index={2} align="left">
                      <p><strong>Piacképes, 21. századi képzés a Petrikben</strong></p>
                    </Text>
                    <Text index={3} align="left">
                      <p style={{ textAlign: "justify" }}>Napjainkban az a fiatal pályakezdő, aki naprakész, piacképes és gyakorlat-orientált szaktudással hagyja ott az iskolapadot és lép ki a munkaerőpiacra, szinte behozhatatlan előnyre tehet szert. A BMSZC Petrik Lajos Két Tanítási Nyelvű Technikum egy olyan szakképző intézmény, ahol a hozzánk járó diákok négy piacképes szakmában szerezhetik meg modern, gyakorlati tudás alapú szakképesítésüket.</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={2}>
                  <Column span="1_3" index={2}>
                    <Text index={4} align="left">
                      <p><strong>Mi a Petrik?</strong></p>
                    </Text>
                    <Text index={5} align="left">
                      <p style={{ textAlign: "justify" }}>A Petrik Lajos Két Tanítási Nyelvű Technikum Budapest egyik legrégibb középfokú szakképző intézményeként 2019-ben ünnepelte fennállásának 140. évfordulóját. Névadónk, Petrik Lajos az iskola egykori híres tanára és későbbi igazgatója. Az általa képviselt sokoldalúság, értékközpontú és diákcentrikus világnézet az irányadó gondolkodás, amelyre iskolánk hagyományai épülnek, továbbá meghatározza jelenünket és jövőnket is. Petrikes diáknak lenni egyet jelent a szakma iránti elköteleződéssel, a világra nyitott, újító gondolkodással, ami az elődeinket is jellemezte.</p>
                    </Text>
                  </Column>
                  <Column span="1_3" index={3}>
                    <Text index={6} align="left">
                      <p><strong>Mit kínál a Petrik?</strong></p>
                    </Text>
                    <Text index={7} align="left">
                      <p style={{ textAlign: "justify" }}>A hagyományos vegyipari képzés mellett környezetvédelem és vízügy, valamint informatika és távközlés ágazatokban nyújt képzést az iskola az ide jelentkező nyolcadikos vagy az érettségi után szakképesítést szerezni kívánó diákok számára. A 2020/2021-es tanévtől bevezetett szakképzési struktúra alapján a tanulmányaikat a Petrikben elkezdő kilencedikes diákok 5 év (két tanítási nyelvű osztályok esetében 6 év) elteltével az érettségi bizonyítvány mellé technikusi oklevelet is kapnak. Az érettségi utáni szakképzésben pedig a vegyész technikusi, a környezetvédelmi technikusi, az informatikai rendszer- és alkalmazás-üzemeltető technikus vagy a szoftverfejlesztő és –tesztelő szakma választható iskolánkban.</p>
                    </Text>
                  </Column>
                  <Column span="1_3" index={4} last>
                    <Text index={8} align="left">
                      <p><strong>Miben nyújt többet a Petrik? </strong></p>
                    </Text>
                    <Text index={9} align="left">
                      <p style={{ textAlign: "justify" }}>A korszerű, jól felszerelt laboratóriumokban, szaktantermekben folyó képzés mellett számunkra fontos, hogy diákjaink érdeklődését és tudását nem csak a szakma, hanem a világ iránt is folyamatosan szélesítsük, és kihívások elé állítsuk őket. Ez a cél vezérel minket, amikor rendszeresen részt veszünk országos és nemzetközi versenyeken, szakmai projektekben. Jelenleg 9 európai uniós ország középiskolájával és cégével van együttműködésünk Erasmus+ projektek révén, ezzel lehetőséget biztosítva diákjainknak külföldi szakmai gyakorlatra is. Emellett eTwinning iskolaként minden évben részt veszünk a Kódolás Hetén, a Biztonságos Internet Napon és a Digitális Témahéten, de rendszeresen szervezünk programokat a Pénz7 vagy a Fenntarthatósági Témahét keretében is.</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={3}>
                  <Column span="4_4" index={5} last>
                    <Text index={10} align="left">
                      Felvételire jelentkezés
                    </Text>
                    <Text index={11} align="left">
                      <p>A jelentkezési lapokat az általános iskolában kell kitölteni, és ezt az általános iskola küldi el a középiskoláknak.</p>
                      {' '}
                      <p>A 0091, 0092, 0093, 0094 kódszámú tanulmányi területekre a felvétel a tanulmányi pontok, a központi írásbeli vizsgán és a helyi szóbeli beszélgetésen szerzett összesített pontok alapján, azonos feltételekkel történik.</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={4}>
                  <Column span="4_4" index={6} last>
                    <Text index={12} align="left">
                      <p>Választható tanulmányi területek, ágazatok (éves szinten 5 induló osztály)</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={5}>
                  <Column span="1_4" index={7} className="et_pb_with_border">
                    <Text index={13} align="center">
                      <p>0091<br />Vegyipari ágazat</p>
                    </Text>
                    <Text index={14} align="center">
                      <p>Két tanítási nyelvű vegyész technikus (28 fő)</p>
                    </Text>
                    <Text index={15} align="center">
                      <p><strong>Okleveles technikus képzés (ELTE)</strong></p>
                    </Text>
                    <Text index={16} align="center">
                      <p><strong>5+1 éves két tanítási nyelvű vegyészképzés</strong></p>
                    </Text>
                    <Text index={17} align="left">
                      <ul>
                        <li>28 fő</li>
                        <li>emelt szintű angol nyelvoktatás,</li>
                        <li>matematika, kémia, szakmai kémia tantárgyak angol nyelven történő oktatása,</li>
                        <li>kapcsolódó természettudományos tantárgyak,</li>
                        <li>laboratóriumi gyakorlatok,</li>
                        <li>tehetséggondozás</li>
                      </ul>
                    </Text>
                    <Text index={18} align="left">
                      <p>vegyész technikus végzettség</p>
                      {' '}
                      <p>Szakmairányok: általános laboráns, termelési folyamatirányító</p>
                    </Text>
                  </Column>
                  <Column span="1_4" index={8} className="et_pb_with_border">
                    <Text index={19} align="center">
                      <p>0092<br />Vegyipari ágazat</p>
                    </Text>
                    <Text index={20} align="center">
                      <p>Vegyész technikus (32 fő)</p>
                    </Text>
                    <Text index={21} align="center" />
                    <Text index={22} align="center">
                      <p><strong>5 éves vegyészképzés</strong></p>
                    </Text>
                    <Text index={23} align="left">
                      <ul>
                        <li>32 fő</li>
                        <li>magas szintű kémiaoktatás,</li>
                        <li>a vegyészet mellett fókuszban a kapcsolódó természettudományok,</li>
                        <li>laboratóriumi gyakorlatok,</li>
                        <li>angol és német választható idegen nyelv,</li>
                        <li>tehetséggondozás</li>
                      </ul>
                    </Text>
                    <Text index={24} align="left">
                      <p>vegyész technikus végzettség</p>
                      {' '}
                      <p>Szakmairányok: általános laboráns, termelési folyamatirányító</p>
                    </Text>
                  </Column>
                  <Column span="1_4" index={9} className="et_pb_with_border">
                    <Text index={25} align="center">
                      <p>0093<br />Környezetvédelem és vízügyi ágazat</p>
                    </Text>
                    <Text index={26} align="center">
                      <p>Környezetvédelmi technikus (32 fő)</p>
                    </Text>
                    <Text index={27} align="center">
                      <p><strong>Okleveles technikus (Óbudai Egyetem)</strong></p>
                    </Text>
                    <Text index={28} align="center">
                      <p><strong>5 éves környezetvédelmi képzés</strong></p>
                    </Text>
                    <Text index={29} align="left">
                      <ul>
                        <li>32 fő</li>
                        <li>emelt szintű biológiaoktatás,</li>
                        <li>a környezetvédelem mellett fókuszban a kapcsolódó természettudományok,</li>
                        <li>környezetvédelmi gyakorlatok,</li>
                        <li>angol és német választható idegen nyelv,</li>
                        <li>tehetséggondozás</li>
                      </ul>
                    </Text>
                    <Text index={30} align="left">
                      <p>környezetvédelmi technikus végzettség</p>
                      {' '}
                      <p>Szakmairány: környezetvédelem</p>
                    </Text>
                  </Column>
                  <Column span="1_4" index={10} last className="et_pb_with_border">
                    <Text index={31} align="center">
                      <p>0094<br />Informatika és távközlés ágazat</p>
                    </Text>
                    <Text index={32} align="center">
                      <p>Szoftverfejlesztő és -tesztelő (okleveles technikus – ÓE)</p>
                      {' '}
                      <p>Informatikai rendszer- és alkalmazás-üzemeltető technikus&nbsp; (okleveles technikus – BME)</p>
                      {' '}
                      <p>(Összesen 64 fő)</p>
                    </Text>
                    <Text index={33} align="left">
                      <ul>
                        <li>32 fő okleveles szoftverfejlesztő és -tesztelő</li>
                        <li>16 fő okleveles rendszerüzemeltető</li>
                        <li>választható mindkét szakma</li>
                        <li>emelt szintű angol nyelvoktatás,</li>
                        <li>emelt szintű informatikaoktatás,</li>
                        <li>fókuszban a webprogramozás, szoftverfejlesztés és rendszergazdai, hálózati ismeretek oktatása,</li>
                        <li>tehetséggondozás</li>
                      </ul>
                    </Text>
                    <Text index={34} align="left">
                      <p>szoftverfejlesztő és -tesztelő</p>
                      {' '}
                      <p>informatikai rendszer- és alkalmazás-üzemeltető</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={6}>
                  <Column span="4_4" index={11} last>
                    <Text index={35} align="left">
                      <p>Tanulmányi pontok</p>
                    </Text>
                    <Text index={36} align="left">
                      <p>Az általános iskolából hozott eredmények: az általános iskola 7. osztály év végi, 8. osztály félévi osztályzatai magyar nyelv és irodalom, történelem, idegen nyelv, matematika, fizika, kémia, földrajz, biológia és informatika tantárgyakból.</p>
                      {' '}
                      <p>A felvételi vizsga egy&nbsp;<strong>Központi, egységes írásbeli</strong>ből<strong>&nbsp;</strong>és egy&nbsp;<strong>Szóbeli</strong> <strong>beszélgetés</strong>ből<strong>&nbsp;</strong>áll.</p>
                    </Text>
                    <PricingTables
                      index={0}
                      tables={[
                      {
                        title: "Központi, egységes írásbeli vizsga",
                        sum: "2026. január 24. 10 óra",
                        items: ["Pótnap: 2026. február 03. 14 óra"],
                      },
                      {
                        title: "Szóbeli vizsga",
                        sum: "2026. március 11.",
                        items: ["2026. március 11. napon a honlapon feltüntetett beosztás alapján."],
                      },
                      ]}
                    />
                    <Text index={37} align="left">
                      <p>Az egységes, központi írásbeli vizsgára külön jelentkezési lapon kell jelentkezni a felvételizőnek abba az iskolába, amelyikben a felvételit meg kívánja írni. A jelentkezési lapok benyújtási határideje <strong>2025. december 01</strong><strong>.</strong></p>
                    </Text>
                  </Column>
                </Row>
                <Row index={7}>
                  <Column span="4_4" index={12} last>
                    <Text index={38} align="left">
                      <p>Beiskolázási tájékoztató</p>
                    </Text>
                    <Button index={0} to="/media/wp-content/uploads/2025/09/petrik-beiskolazasi-ismerteto-2026-27-iskolai-1.pdf" align="center">Nyolcadikosok beiskolázási ismertetője</Button>
                  </Column>
                </Row>
                <Row index={8}>
                  <Column span="4_4" index={13} last>
                    <Text index={39} align="left">
                      <p>A felvételi vizsga tartalma</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={9}>
                  <Column span="1_2" index={14}>
                    <Text index={40} align="left">
                      <p><strong>Központi írásbeli vizsga</strong> minden szakon: matematika és anyanyelv</p>
                      {' '}
                      <p>A diszfunkciós zavarokkal küzdő tanulóknak – szakvéleménnyel alátámasztott kérelemre – több időt biztosítunk a központi írásbeli megírásakor.</p>
                    </Text>
                  </Column>
                  <Column span="1_2" index={15} last>
                    <Text index={41} align="left">
                      <p><strong>Szóbeli rész </strong>egy rövid, kötetlen általános beszélgetésből, majd azt követő szakmai kérdésekből áll. Kérjük a diákokat, hozzák magukkal a KRÉTA-kivonatot, bármelyik tantárgyból egy füzetet és &nbsp;– ha van – a versenyeredményeiket igazoló okleveleiket.</p>
                      {' '}
                      <p>Szóbeli témakörökről bővebben <Link to="/felveteli-informavio-nyolcadikosoknak-szobeli-temakorok/">itt</Link>.</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={10}>
                  <Column span="4_4" index={16} last>
                    <Text index={42} align="left">
                      <p>Szóbelire azokat az informatikus felvételizőket hívjuk be, akik a hozott- és az írásbeli felvételin szerzett pontokból összesen legalább 60 pontot értek el!</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={11}>
                  <Column span="4_4" index={17} last>
                    <Text index={43} align="left">
                      <p>A vizsgázó teljesítményének értékelése</p>
                    </Text>
                    <Text index={44} align="left">
                      <p>Az általános iskolából hozott tanulmányi pontok és a felvételi vizsgán elért eredmények alapján történik.</p>
                      {' '}
                      <p>Az általános iskolából hozott eredmények: az általános iskola 7. osztály év végi, 8. osztály félévi osztályzatai magyar nyelv és irodalom, történelem, idegen nyelv, matematika, fizika, kémia, földrajz, biológia és informatika tantárgyakból. A hozott pontokat az egyes tantárgyakból szerzett érdemjegyekből átváltott pontok összege hatátozza meg: a jeles 2 pont, a jó 1 pont, míg az elégtelen, az elégséges és a közepes 0 pontot ér. Ha mind a 10-10 tantárgyból jeles érdemjegyet kap a tanuló, akkor összesen maximum 40 pont szerezhető.</p>
                      {' '}
                      <p>Felvételi vizsga pontjai: írásbelin összesen 100 pont, a szóbelin 30 pont szerezhető.</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={12}>
                  <Column span="4_4" index={18} last>
                    <Text index={45} align="left">
                      <p>A felvételi döntés alapja</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={13}>
                  <Column span="1_2" index={19}>
                    <Text index={46} align="left">
                      <p><strong>Hozott pont: (40 pont)<br /></strong></p>
                      {' '}
                      <ul>
                        <ul>
                        <li>általános iskolai tanulmányi eredmény (tanulmányi pontok): 40 pont</li>
                      </ul>
                      </ul>
                      {' '}
                      <p><strong>&nbsp;</strong></p>
                    </Text>
                  </Column>
                  <Column span="1_2" index={20} last>
                    <Text index={47} align="left">
                      <p><strong>Szerzett pont: (130 pont)<br /></strong></p>
                      {' '}
                      <ul>
                        <li>központi, egységes írásbeli vizsga eredménye: 50-50 pont</li>
                        <li>szóbeli beszélgetés eredménye: 30 pont</li>
                      </ul>
                    </Text>
                  </Column>
                </Row>
                <Row index={14}>
                  <Column span="4_4" index={21} last>
                    <Text index={48} align="left">
                      <p><strong>Összesen</strong><strong>&nbsp;</strong>szerezhető <strong>170 pont, </strong>amely a hozott pontokból és a szerzett pontókból adódik össze.</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={2} dividerTop dividerBottom>
                <Row index={15}>
                  <Column span="4_4" index={22} last>
                    <Text index={49} align="left">
                      <p>A nyolcadikos felvételihez kapcsolódó hírek</p>
                    </Text>
                    <PostFeed
                      index={0}
                      columns={3}
                      align="left"
                      className="et_pb_with_border"
                      hasOlder
                      items={[
                      { slug: "beiratkozasi-informaciok-leendo-kilencedikesek-szamara-2026-junius-25-26", date: "2026 máj 12" },
                      { slug: "csibetabor-2026", date: "2026 máj 08" },
                      { slug: "vegleges-felveteli-jegyzek-a-2026-2027-tanevre", date: "2026 ápr 27" },
                      { slug: "kozepfoku-felveteli-2026-marcius-25-en-indul-a-sorrendmodositas", date: "2026 márc 24" },
                      { slug: "ideiglenes-felveteli-lista-2026", date: "2026 márc 16" },
                      { slug: "szobeli-felveteli-beosztas-2026-marcius", date: "2026 márc 03" },
                      ]}
                    />
                  </Column>
                </Row>
              </Section>
              <Section index={3}>
                <Row index={16}>
                  <Column span="1_3" index={23}>
                    <Text index={50} align="left">
                      <h1>Iskolai adatok</h1>
                    </Text>
                    <Blurb index={0} align="left" position="left" icon="">
                      <p><strong>OM azonosíró:</strong> 203058</p>
                    </Blurb>
                    <Blurb index={1} align="left" position="left" icon="">
                      <p><strong>Iskola neve:</strong> Budapesti Műszaki SZC Petrik Lajos Két Tanítási Nyelvű Technikum</p>
                    </Blurb>
                    <Blurb index={2} align="left" position="left" icon="">
                      <p><strong>Iskola címe:</strong>&nbsp;1146 Budapest Thököly út 48-54.&nbsp;</p>
                    </Blurb>
                    <Blurb index={3} align="left" position="left" icon="">
                      <p><strong>Feladatellátási hely kódja:</strong>&nbsp;009</p>
                    </Blurb>
                    <Text index={51} align="left">
                      <p><strong>Technikai kód</strong>: 520 413</p>
                    </Text>
                  </Column>
                  <Column span="2_3" index={24} last>
                    <Text index={52} align="left">
                      <h1><strong>Jelentkezési laphoz szükséges adatok</strong></h1>
                    </Text>
                    <Blurb index={4} align="left" position="left" icon="">
                      <p>Intézménytípus:<strong> technikum</strong></p>
                    </Blurb>
                    <Blurb index={5} align="left" position="left" icon="">
                      <p><strong>0091 vegyész technikus </strong>(5+1 éves két tanítási nyelvű vegyészképzés)</p>
                    </Blurb>
                    <Blurb index={6} align="left" position="left" icon="">
                      <p><strong>0092 vegyész technikus </strong>(5 éves vegyészképzés)</p>
                    </Blurb>
                    <Blurb index={7} align="left" position="left" icon="">
                      <p><strong>0093 környezetvédelmi technikus </strong>(5 éves környezetvédelmi képzés)</p>
                    </Blurb>
                    <Blurb index={8} align="left" position="left" icon="">
                      <p><strong>0094 informatika és távközlés </strong>(5 éves informatikaképzés)</p>
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
