import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Blurb from '../components/divi/Blurb.tsx'
import Image from '../components/divi/Image.tsx'
import Text from '../components/divi/Text.tsx'
import VideoEmbed from '../components/divi/VideoEmbed.tsx'
import './VegyiparAgazat.css'

export default function VegyiparAgazat() {
  return (
    <div id="main-content" className="page-vegyipar-agazat">
      <article className="post-1581 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="4_4" index={0} last>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>Vegyipar</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>Kisérlet, mintavétel, mérés, számítások és még sok-sok más.</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={1}>
                <Row index={1}>
                  <Column span="1_2" index={1}>
                    <Text index={2} align="left">
                      <p>A vegyésztechnikus képzést neked ajánjluk, ha</p>
                    </Text>
                    <Blurb index={0} align="left" position="left" title="érdekel a kémia, a laboratóriumi vagy a vegyipari munka," icon="Z" />
                    <Blurb index={1} align="left" position="left" title="probléma megoldásra képes szakemberré szeretnél válni," icon="Z" />
                    <Blurb index={2} align="left" position="left" title="jól felszerelt iskolai szaklaborokban sajátítanád el az alapokat," icon="Z" />
                    <Blurb index={3} align="left" position="left" title="digitális szemléletű, projekt alapú feladatokat oldanál meg," icon="Z" />
                    <Blurb index={4} align="left" position="left" title="gyakorlathoz kapcsolnád az ismereteket, akár valódi munkakörnyezetben," icon="Z" />
                    <Blurb index={5} align="left" position="left" title="két tanítási nyelvű képzésben szaknyelvi kompetenciáddal angol vagy nemzetközi környezetben is helyt szeretnél állni." icon="Z" />
                  </Column>
                  <Column span="1_2" index={2} last>
                    <Image src="/media/wp-content/uploads/2021/05/vegyesztechnikus-scaled.jpg" width={1706} height={2560} srcSet="/media/wp-content/uploads/2021/05/vegyesztechnikus-scaled.jpg 1706w, /media/wp-content/uploads/2021/05/vegyesztechnikus-1280x1921.jpg 1280w, /media/wp-content/uploads/2021/05/vegyesztechnikus-980x1471.jpg 980w, /media/wp-content/uploads/2021/05/vegyesztechnikus-480x720.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 1706px, 100vw" index={0} />
                  </Column>
                </Row>
                <Row index={2}>
                  <Column span="4_4" index={3} last>
                    <Text index={3} align="left">
                      <p>A technikumban az érettségire való készülés mellett szakmai tárgyakat is tanultok. Az első két évben vegyipari alapozásra kerül sor: a tanulók laboratóriumi munka és elméleti órák megismerkednek a vegyipari alapjaival. A szakasz ágazati alapvizsgával zárul. A tizenegyedik évfolyamon kezdődik a célirányos vegyésztechnikus képzés specifikus gyakorlatok és szakmai elmélet formájában szerves és szervetlen kémiát, általános kémiát, analitikát és biotechnológiát tanultok.</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={2} dividerTop>
                <Row index={3}>
                  <Column span="4_4" index={4} last>
                    <Text index={4} align="left">
                      <p>A vegyésztechnikus képzés során iskolákban két szakmairányt tudsz választani.</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={4}>
                  <Column span="1_2" index={5}>
                    <Image src="/media/wp-content/uploads/2020/08/vegyesz-agazat.jpg" width={1920} height={1281} srcSet="/media/wp-content/uploads/2020/08/vegyesz-agazat.jpg 1920w, /media/wp-content/uploads/2020/08/vegyesz-agazat-1280x854.jpg 1280w, /media/wp-content/uploads/2020/08/vegyesz-agazat-980x654.jpg 980w, /media/wp-content/uploads/2020/08/vegyesz-agazat-480x320.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 1920px, 100vw" loading="lazy" index={1} />
                    <Text index={5} align="left">
                      <p>5 0711 24 08 –Általános laboráns</p>
                    </Text>
                    <Text index={6} align="left">
                      <p>Ez a neked való szakma, ha fő érdeklődési területed a laboratóriumi munka: mintát vennél, előkészítenéd és mérést végeznél, vagy szívesen állítanál elő vegyi anyagokat.</p>
                      {' '}
                      <p>Technikusi tanulmányaid elvégzése után vegyipari üzemi-, minőségellenőrző, minőségbiztosító és kutató laboratóriumokban tudsz majd elhelyezkedni vagy a megszerzett tudásod szakirányú továbbtanulás esetén a felsőoktatási tanulmányaidban hasznosíthatod.</p>
                    </Text>
                  </Column>
                  <Column span="1_2" index={6} last>
                    <Image src="/media/wp-content/uploads/2020/10/vegyipar_termelesi_folyamatiranyito-scaled.jpg" width={2560} height={1709} srcSet="/media/wp-content/uploads/2020/10/vegyipar_termelesi_folyamatiranyito-scaled.jpg 2560w, /media/wp-content/uploads/2020/10/vegyipar_termelesi_folyamatiranyito-1280x855.jpg 1280w, /media/wp-content/uploads/2020/10/vegyipar_termelesi_folyamatiranyito-980x654.jpg 980w, /media/wp-content/uploads/2020/10/vegyipar_termelesi_folyamatiranyito-480x320.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 2560px, 100vw" loading="lazy" index={2} />
                    <Text index={7} align="left">
                      <p>5 0711 24 08 – Termelési folyamatirányító</p>
                    </Text>
                    <Text index={8} align="left">
                      <p>Ez a neked való szakma, ha érdekel a nagyüzemek működtetése: ipari folyamatokat hajtanál végre, irányítanál, ellenőriznél vagy készülékeket, berendezéseket üzemeltetnél.</p>
                      {' '}
                      <p>Technikusi tanulmányaid elvégzése után gyógyszer- vagy vegyi anyag gyártásban, kőolajiparban technikusként vagy mérnökasszisztensként helyezkedhetsz el vagy a megszerzett tudásod szakirányú továbbtanulás esetén a felsőoktatási tanulmányaidban hasznosíthatod.</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={3} dividerTop>
                <Row index={5}>
                  <Column span="4_4" index={7} last>
                    <Text index={9} align="left">
                      <p>Szakmai képzésések, ráépülések</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={6}>
                  <Column span="1_3" index={8}>
                    <Image src="/media/wp-content/uploads/2020/08/vegyesz-agazat.jpg" width={1920} height={1281} srcSet="/media/wp-content/uploads/2020/08/vegyesz-agazat.jpg 1920w, /media/wp-content/uploads/2020/08/vegyesz-agazat-1280x854.jpg 1280w, /media/wp-content/uploads/2020/08/vegyesz-agazat-980x654.jpg 980w, /media/wp-content/uploads/2020/08/vegyesz-agazat-480x320.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 1920px, 100vw" loading="lazy" index={3} />
                    <Text index={10} align="left">
                      <p>07115002 – Műszeres analitikus szakképesítés</p>
                    </Text>
                    <Text index={11} align="left">
                      <p>Szakmai előfeltétel: vegyész technikus végzettség</p>
                    </Text>
                    <Text index={12} align="left">
                      <p>A műszeres analitikus önállóan vagy magasabban képzett szakember irányításával kutató, vizsgáló vagy üzemi laboratóriumokban vegyipari, gyógyszeripari, élelmiszeripari, kőolajipari, környezetvédelmi folyamatokkal kapcsolatos műszeres analitikai vizsgálatokat végez. Korszerű műszeres analitikai módszereket alkalmaz informatikai háttérrel, vezérlő és adatfeldolgozó szoftverek alkalmazásával. Részt vesz módszer és folyamat validálásában, új analitikai módszerek kidolgozásában, valamint külső és belső auditokon. A vizsgálatokhoz kapcsolódó mintavételi, minta-előkészítési tevékenységet végez. Felel a műszerek üzemkész állapotban tartásáról és karbantartásukról. Munkáját a gazdaságossági elvek, minőségbiztosítási, tűz-munka-, környezetvédelmi és egyéb vonatkozó előírások betartásával végzi. A munkaköréhez kapcsolódó adminisztrációs feladatokat a minőségügyi előírások szerint dokumentálja az informatikai háttér használatával.</p>
                    </Text>
                    <Text index={13} align="left">
                      <p>A képesítő vizsga megszervezéséhez szükséges feltételek és a képesítő vizsga vizsgatevékenységeinek részletes leírása:</p>
                      {' '}
                      <p><strong>Írásbeli vizsga: Műszeres analitikai ismeretek (30%)</strong></p>
                      {' '}
                      <p><strong>Projektfeladat: Portfólió készítése és bemutatása (70%)</strong></p>
                      {' '}
                      <p>A vizsgázó a portfólióban mutatja be eddigi tevékenységét, a szakmához kötődő jövőképét, valamint a műszeres analitikus szakma tanulása során az elektroanalitikai, spektrometriai, kormatográfiás műszeres analitikai gyakorlatokon elért tanulási eredményeit, amelyhez hozzátartozik a saját tanulási eredményére és munkatevékenységére vonatkozó reflexió.</p>
                      {' '}
                      <p>A portfólió kötelező elemei:</p>
                      {' '}
                      <ul>
                        <li>A vizsgázó bemutatkozása</li>
                        <li>Műszeres analitikai területek bemutatása: Két szabadon választott analitikai területről laboratóriumi vizsgálatok bemutatása.</li>
                        <li>Egy szabadon választott analitikai területről záródolgozat készítése.</li>
                        <li>Reflexió</li>
                      </ul>
                    </Text>
                  </Column>
                  <Column span="1_3" index={9}>
                    <Image src="/media/wp-content/uploads/2020/10/vegyipar_termelesi_folyamatiranyito-scaled.jpg" width={2560} height={1709} srcSet="/media/wp-content/uploads/2020/10/vegyipar_termelesi_folyamatiranyito-scaled.jpg 2560w, /media/wp-content/uploads/2020/10/vegyipar_termelesi_folyamatiranyito-1280x855.jpg 1280w, /media/wp-content/uploads/2020/10/vegyipar_termelesi_folyamatiranyito-980x654.jpg 980w, /media/wp-content/uploads/2020/10/vegyipar_termelesi_folyamatiranyito-480x320.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 2560px, 100vw" loading="lazy" index={4} />
                    <Text index={14} align="left">
                      <p>07115003 – Gyógyszeripari szaktechnikus szakképesítés&nbsp;</p>
                    </Text>
                    <Text index={15} align="left">
                      <p>Szakmai előfeltétel: vegyész technikus végzettség</p>
                    </Text>
                    <Text index={16} align="left">
                      <p>A gyógyszeripari szaktechnikus önállóan vagy gyógyszerész illetve vegyész, vegyészmérnök irányításával részt vesz a gyógyszer-, gyógyszeralapanyag- és segédanyaggyártás folyamatában. Fermentálási folyamatokat tud végezni. Részt vesz a gyógyszeripari gyártási folyamatok részleges vagy teljes irányításában, készülékek, berendezések üzemeltetésében, tisztításában. Közreműködik gyártástechnológiák léptéknövelési folyamatainak megvalósításában, kísérleti gyártásokban. Gyógyszerkiszerelő és -csomagoló gépeket tud kezelni. Minőségellenőrző vizsgálatokat végez, elvégzi a gyártásközi és késztermékek minőségének és kémiai összetételének ellenőrzését, gyógyszerformák vizsgálatát szabványok és előírások alapján. Műszeres analitikai és egyéb műszeres vizsgálatokat végez. Speciális gyógyszerészeti, laboratóriumi vizsgálatokban, mikrobiológiai vizsgálatokban vesz részt. Laboratóriumban kémiai szintéziseket hajt végre. Rész vesz az eszközök kvalifikálásában és eljárások validálási folyamataiban. Részt vesz kutatási folyamatokban, gyógyszerfejlesztésben, és azok dokumentálásában elsősorban informatikai háttér alkalmazásával, ehhez a munkához folyamatosan továbbképzi magát. Munkáját a gazdaságossági elvek, a technológiai, higiéniai, minőségbiztosítási, tűz-, munka-, környezetvédelmi és egyéb vonatkozó előírások betartásával végzi. A munkaköréhez kapcsolódó adminisztrációs feladatokat a minőségügyi előírások szerint dokumentálja az informatikai háttér használatával.</p>
                    </Text>
                    <Text index={17} align="left">
                      <p>A képesítő vizsga megszervezéséhez szükséges feltételek és a képesítő vizsga vizsgatevékenységeinek részletes leírása:</p>
                      {' '}
                      <p><strong>Írásbeli vizsga: </strong>: <strong>Gyógyszeripari ismeretek (30%)</strong></p>
                      {' '}
                      <p><strong>Projektfeladat: Gyógyszeripari gyakorlat (70%)</strong></p>
                      {' '}
                      <p>A projekt feladat gyakorlati vizsgafeladatból és szóbeli beszélgetésből áll. A vizsgázó a gyakorlati feladatát a vizsgán készíti el, a gyakorlati vizsgafeladat befejezését követően szóban megvédi azt a feladathoz kapcsolódó kérdések kifejtésével.</p>
                    </Text>
                  </Column>
                  <Column span="1_3" index={10} last>
                    <Image src="/media/wp-content/uploads/2020/10/vegyipari-szakmunkas-scaled.jpg" width={2560} height={1709} srcSet="/media/wp-content/uploads/2020/10/vegyipari-szakmunkas-scaled.jpg 2560w, /media/wp-content/uploads/2020/10/vegyipari-szakmunkas-1280x855.jpg 1280w, /media/wp-content/uploads/2020/10/vegyipari-szakmunkas-980x654.jpg 980w, /media/wp-content/uploads/2020/10/vegyipari-szakmunkas-480x320.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 2560px, 100vw" loading="lazy" index={5} />
                    <Text index={18} align="left">
                      <p>07115003 – Drog- és toxikológiai szaktechnikus</p>
                    </Text>
                    <Text index={19} align="left">
                      <p>Szakmai előfeltétel: vegyész technikus végzettség</p>
                    </Text>
                    <Text index={20} align="left">
                      <p>A drog- és toxikológiai szaktechnikus önállóan, vagy magasabb végzettségű személy irányítása alatt részt vesz a gyógynövények feldolgozásában, gyógynövényekkel, drogokkal kapcsolatos mikro- és makromorfológiai vizsgálatokat, mennyiségi és minőségi elemzéseket végez. Gyógynövényeket és drogokat minősít a gyógyszerkönyv, valamint magyar és külföldi szabványok előírásai alapján. Részt vesz farmakognóziai és toxikológiai kutatásokban. Elvégzi a különböző eredetű minták toxikológiai elemzését, toxicitási vizsgálatokat végez. Munkájához előkészíti a szükséges vegyszereket, anyagokat, eszközöket és műszereket, azokat önállóan használja, működteti. Használja a korszerű informatikai rendszereket, munkája során betartja a vonatkozó higiénés, munka-, tűz-, környezetvédelmi és biztonságtechnikai szabályokat. Munkáját pontosan dokumentálja.</p>
                    </Text>
                    <Text index={21} align="left">
                      <p>A képesítő vizsga megszervezéséhez szükséges feltételek és a képesítő vizsga vizsgatevékenységeinek részletes leírása:</p>
                      {' '}
                      <p><strong>Írásbeli vizsga: </strong>Farmakognóziai és toxikológiai ismeretek<strong> (30%)</strong></p>
                      {' '}
                      <p><strong>Projektfeladat: </strong>Farmakognóziai és toxikológiai gyakorlat<strong> (70%)</strong></p>
                      {' '}
                      <p>A projektfeladat gyakorlati vizsgafeladatból és szóbeli beszélgetésből áll. A vizsgázó a gyakorlati feladatát a vizsgán készíti el, a gyakorlati vizsgafeladat.</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={4} dividerTop>
                <Row index={7}>
                  <Column span="4_4" index={11} last>
                    <Text index={22} align="left">
                      <p>Nézd meg bemutatkozó kisfilmjeinket:</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={8}>
                  <Column span="1_2" index={12}>
                    <VideoEmbed index={0} videoId="7nN7pniBwTQ" title="Bemutatkozik a duális vegyész képzés" />
                    <Text index={23} align="left">
                      <p>Az új szakképzési struktúra bevezetésével 2020-ban elindítottuk az első duális vegyész technikusi osztályunkat. Az első tapasztalatokról a képzésben résztvevő diákjaink és tanáruk mondják el a véleményüket fenti videóban.</p>
                    </Text>
                  </Column>
                  <Column span="1_2" index={13} last>
                    <VideoEmbed index={1} videoId="V0V__iBu84k" title="Training for All Ciprus" />
                    <Text index={24} align="left">
                      <p>Iskolánk folyamatosan részt vesz az Erasmus+ programban, amelynek keretében külföldi szakmai gyakorlatokat szervezünk technikusi képzéseinken részt vevő diákjaink számára. Jelenleg a ciprusi <a href="https://shipcon.eu.com/" target="_blank" rel="noreferrer">ShipCon Ltd.</a> kutató- és képzőközponttal állunk kapcsolatban. Vegyész diákjaink 2019 novemberében vettek részt 30 napos szakmai gyakorlaton Limasszolban.</p>
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
