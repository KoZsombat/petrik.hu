import { Link } from 'react-router-dom'
import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Image from '../components/divi/Image.tsx'
import SocialFollow from '../components/divi/SocialFollow.tsx'
import TeamMember from '../components/divi/TeamMember.tsx'
import Text from '../components/divi/Text.tsx'
import './Elerhetoseg.css'

export default function Elerhetoseg() {
  return (
    <div id="main-content" className="page-elerhetoseg">
      <article className="post-55 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="1_2" index={0}>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>Elérhetőség</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>Budapesti Műszaki Szakképzési Centrum<br />Petrik Lajos Két Tanítási Nyelvű Technikum</p>
                    </Text>
                  </Column>
                  <Column span="1_2" index={1} last />
                </Row>
              </Section>
              <Section index={1} dividerBottom>
                <Row index={1}>
                  <Column span="4_4" index={2} last>
                    <Text index={2} align="left">
                      Elérhetőség
                    </Text>
                  </Column>
                </Row>
                <Row index={2}>
                  <Column span="1_3" index={3}>
                    <Image src="/media/wp-content/uploads/2020/09/kepAsset-11024px.png" width={1024} height={917} srcSet="/media/wp-content/uploads/2020/09/kepAsset-11024px.png 1024w, /media/wp-content/uploads/2020/09/kepAsset-11024px-980x878.png 980w, /media/wp-content/uploads/2020/09/kepAsset-11024px-480x430.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) 1024px, 100vw" index={0} />
                    <Text index={3} align="left">
                      <p style={{ textAlign: "center", color: "#0c71c3", fontSize: "large" }}><strong>Budapesti Műszaki Szakképzési Centrum</strong></p>
                    </Text>
                    <Text index={4} align="center">
                      <p style={{ textAlign: "center" }}>Levelezési cím<br /><strong>1149 Budapest, Várna utca 23.<br /></strong></p>
                      {' '}
                      <p style={{ textAlign: "center" }}>Web –&nbsp;<a href="http://www.bmszc.hu" target="_blank" rel="noreferrer"><strong>www.bmszc.hu</strong></a></p>
                      {' '}
                      <p style={{ textAlign: "center" }}>OM azonosító –&nbsp;<strong>203058<br /></strong>Adószám <strong>–&nbsp;15831880-2-42</strong></p>
                      {' '}
                      <p style={{ textAlign: "center" }}>Főigazgató –&nbsp;<strong>Csordás Katalin<br /></strong>Kancellár – <strong>Viszkok Mihály</strong></p>
                    </Text>
                  </Column>
                  <Column span="1_3" index={4}>
                    <Image src="/media/wp-content/uploads/2020/09/logo-kerek-kicsi.png" width={607} height={607} srcSet="/media/wp-content/uploads/2020/09/logo-kerek-kicsi.png 607w, /media/wp-content/uploads/2020/09/logo-kerek-kicsi-480x480.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 607px, 100vw" index={1} />
                    <Text index={5} align="left">
                      <p style={{ textAlign: "center", color: "#0c71c3", fontSize: "large" }}><strong>Budapesti Műszaki SZC</strong><br /><strong> Petrik Lajos Két Tanítási Nyelvű Technikum</strong></p>
                    </Text>
                    <Text index={6} align="center">
                      <p style={{ textAlign: "center" }}>Levelezési cím<br /><strong>1146 Budapest, Thököly út 48-54.<br /></strong><br />Web –&nbsp;<Link to="/"><strong>www.petrik.hu</strong></Link><br />E-mail –&nbsp;<a href="mailto:info@petrik.hu"><strong>info@petrik.hu</strong></a></p>
                      {' '}
                      <p>A porta – <strong>+36 70 502 1723<br /></strong>B porta: – <strong>+36 70 502 1724</strong><strong></strong></p>
                      {' '}
                      <p style={{ textAlign: "center" }}>Az iskola OM azonosítója –&nbsp;<strong>203 058</strong><br />Az iskola technikai kódja – <strong>520413</strong></p>
                    </Text>
                  </Column>
                  <Column span="1_3" index={5} last>
                    <Image src="/media/wp-content/uploads/2020/09/logo-kerek-kicsi.png" width={607} height={607} srcSet="/media/wp-content/uploads/2020/09/logo-kerek-kicsi.png 607w, /media/wp-content/uploads/2020/09/logo-kerek-kicsi-480x480.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 607px, 100vw" index={2} />
                    <Text index={7} align="left">
                      <p style={{ textAlign: "center", color: "#0c71c3", fontSize: "large" }}><strong>Petrik Alapítvány</strong></p>
                    </Text>
                    <Text index={8} align="center">
                      <p style={{ textAlign: "center" }}>Levelezési cím<br /> <strong>1146 Budapest, Thököly út 48-54.</strong></p>
                      {' '}
                      <p style={{ textAlign: "center" }}>Adószám –&nbsp;<strong>19674959-1-42<br /> </strong><span style={{ fontSize: "14px" }}>Számlaszám –&nbsp;</span><strong>11714006-20266635</strong></p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={2}>
                <Row index={3}>
                  <Column span="4_4" index={6} last>
                    <Text index={9} align="left">
                      Az iskola vezetői
                    </Text>
                  </Column>
                </Row>
                <Row index={4}>
                  <Column span="1_5" index={7}>
                    <TeamMember index={0} name="Gál-Berey Csilla" headingLevel={4} position="Igazgató" image={{ src: "/media/wp-content/uploads/2021/10/gal_berey_csilla_2021.jpg", alt: "Gál-Berey Csilla", width: 675, height: 985, srcSet: "/media/wp-content/uploads/2021/10/gal_berey_csilla_2021.jpg 675w, /media/wp-content/uploads/2021/10/gal_berey_csilla_2021-480x700.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 675px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={10} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1719<br />galberey@petrik.hu</p>
                      {' '}
                      <p style={{ textAlign: "center" }}><em>fogadó óra: Időpont egyeztetés szerint, a titkarsag@petrik.hu címen.</em></p>
                    </Text>
                  </Column>
                  <Column span="1_5" index={8}>
                    <TeamMember index={1} name="Penksza Károlyné" headingLevel={4} position="Általános igazgatóhelyettes" image={{ src: "/media/wp-content/uploads/2020/09/penksza_karolyne.jpg", alt: "Penksza Károlyné", width: 672, height: 976, srcSet: "/media/wp-content/uploads/2020/09/penksza_karolyne.jpg 672w, /media/wp-content/uploads/2020/09/penksza_karolyne-480x697.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 672px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={11} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1792<br />asztalos@petrik.hu</p>
                    </Text>
                  </Column>
                  <Column span="1_5" index={9}>
                    <TeamMember index={2} name="Bátki Ottilia" headingLevel={4} position="Szakmai igazgatóhelyettes" image={{ src: "/media/wp-content/uploads/2021/10/batki_ottilia_2021.jpg", alt: "Bátki Ottilia", width: 672, height: 988, srcSet: "/media/wp-content/uploads/2021/10/batki_ottilia_2021.jpg 672w, /media/wp-content/uploads/2021/10/batki_ottilia_2021-480x706.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 672px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={12} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1791<br />batki.ottilia@petrik.hu</p>
                    </Text>
                  </Column>
                  <Column span="1_5" index={10}>
                    <TeamMember index={3} name="Sárközi-Paulik Brigitta" headingLevel={4} position="igazgatóhelyettes" image={{ src: "/media/wp-content/uploads/2020/09/sarkozi_paulik_brigitta.jpg", alt: "Sárközi-Paulik Brigitta", width: 658, height: 988, srcSet: "/media/wp-content/uploads/2020/09/sarkozi_paulik_brigitta.jpg 658w, /media/wp-content/uploads/2020/09/sarkozi_paulik_brigitta-200x300.jpg 200w", sizes: "(max-width: 658px) 100vw, 658px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={13} align="left">
                      <p>+36 70 506 9336</p>
                      {' '}
                      <p>paulik@petrik.hu</p>
                    </Text>
                  </Column>
                  <Column span="1_5" index={11} last>
                    <TeamMember index={4} name="Szolnok Ádám" headingLevel={4} position="Szervezésért és kommunikációért felelős igazgatóhelyettes" image={{ src: "/media/wp-content/uploads/2020/09/szolnok_adam.jpg", alt: "Szolnok Ádám", width: 652, height: 979, srcSet: "/media/wp-content/uploads/2020/09/szolnok_adam.jpg 652w, /media/wp-content/uploads/2020/09/szolnok_adam-200x300.jpg 200w", sizes: "(max-width: 652px) 100vw, 652px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={14} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1765<br />szolnok@petrik.hu</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={5}>
                  <Column span="4_4" index={12} last>
                    <Text index={15} align="left">
                      Tanügyigazgatási ügyintézők
                    </Text>
                    <Text index={16} align="left">
                      <p>Tanulói ügyintézés céljából a Diákcentrum hétköznap 9:00-14:00 között érhető el.</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={6} className="et_pb_with_border">
                  <Column span="1_5" index={13}>
                    <TeamMember index={5} name="Lévai Viktória" headingLevel={4} position="Igazgatói titkárság" image={{ src: "/media/wp-content/uploads/2021/03/levia_viktoria.png", alt: "Lévai Viktória", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2021/03/levia_viktoria.png 600w, /media/wp-content/uploads/2021/03/levia_viktoria-480x720.png 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={17} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1708<br /> titkarsag@petrik.hu</p>
                    </Text>
                  </Column>
                  <Column span="1_5" index={14}>
                    <TeamMember index={6} name="Jókuthy Claudia" headingLevel={4} position="Gazdasági ügyintéző" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Jókuthy Claudia", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={18} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1717<br /> gazdasagi@petrik.hu</p>
                    </Text>
                  </Column>
                  <Column span="1_5" index={15} />
                  <Column span="1_5" index={16}>
                    <TeamMember index={7} name="Aranyos Emese" headingLevel={4} position="Diákcentrum ügyintéző" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Aranyos Emese", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                      {' '}
                      <p>Felvételivel/beiratkozással kapcsolatos ügyintézés.</p>
                    </TeamMember>
                    <Text index={19} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1736<br />aranyos.emese@petrik.hu</p>
                    </Text>
                  </Column>
                  <Column span="1_5" index={17} last>
                    <TeamMember index={8} name="Horváthné Szirai Szilvia" headingLevel={4} position="Diákcentrum ügyintéző" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Horváthné Szirai Szilvia", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                      {' '}
                      <p>Érettségivel/beiratkozással kapcsolatos ügyintézés.</p>
                    </TeamMember>
                    <Text index={20} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1716<br />horvathne.szirai.szilvia@petrik.hu</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={7}>
                  <Column span="4_4" index={18} last>
                    <Text index={21} align="left">
                      Egészségügyi munkatársak
                    </Text>
                  </Column>
                </Row>
                <Row index={8} className="et_pb_with_border">
                  <Column span="1_5" index={19}>
                    <TeamMember index={9} name="Dr Tóth-Vajna Zsombor" headingLevel={4} position="Iskolaorvos" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Dr Tóth-Vajna Zsombor", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={22} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1728<br />orvosi@petrik.hu</p>
                      {' '}
                      <p style={{ textAlign: "center" }}><em>rendelési idő: Hétfő és Szerda 9:30-14:00</em></p>
                    </Text>
                  </Column>
                  <Column span="1_5" index={20}>
                    <TeamMember index={10} name="Pezenhoffer Tímea" headingLevel={4} position="Védőnő" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Pezenhoffer Tímea", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={23} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1728<br /><a href="mailto:orvosi@petrik.hu">orvosi@petrik.hu</a><br /><a href="mailto:petrikorvosi@gmail.com">petrikorvosi@gmail.com</a></p>
                      {' '}
                      <p style={{ textAlign: "center" }}><em>Rendelési idő: Hétfőtől Csütörtökig 9:30-14:00</em></p>
                    </Text>
                  </Column>
                  <Column span="1_5" index={21}>
                    <TeamMember index={11} name="Petrács Zsuzsanna" headingLevel={4} position="Fejlesztő pedagógus" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Petrács Zsuzsanna", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={24} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1724<br />petracs.zsuzsanna@petrik.hu</p>
                    </Text>
                  </Column>
                  <Column span="1_5" index={22}>
                    <TeamMember index={12} name="Pál Bottyán László" headingLevel={4} position="Iskolapszichológus" image={{ src: "/media/wp-content/uploads/2020/09/pal_bottyan_pszichologus.jpg", alt: "Pál Bottyán László", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/pal_bottyan_pszichologus.jpg 600w, /media/wp-content/uploads/2020/09/pal_bottyan_pszichologus-480x720.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={25} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1813<br />lelkiero@yahoo.com</p>
                      {' '}
                      <p style={{ textAlign: "center" }}><em>Fogadó nap diákoknak: Tanítási időben egyeztetés alapján. (B044)</em></p>
                      {' '}
                      <p style={{ textAlign: "center" }}><em>Fogadó nap szülőknek: előzetes telefonos egyeztetés alapján</em></p>
                    </Text>
                  </Column>
                  <Column span="1_5" index={23} last>
                    <TeamMember index={13} name="Ujházy Veronika" headingLevel={4} position="Szociális segitő" image={{ src: "/media/wp-content/uploads/2026/02/Veronika-uj-kep_-uj-nev.png", alt: "Ujházy Veronika", width: 823, height: 700, srcSet: "/media/wp-content/uploads/2026/02/Veronika-uj-kep_-uj-nev.png 823w, /media/wp-content/uploads/2026/02/Veronika-uj-kep_-uj-nev-480x408.png 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 823px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={26} align="left">
                      <p style={{ textAlign: "center" }}>Telefon: +36 70 502 2719<br />borbely.veronika@petrik.hu</p>
                      {' '}
                      <p style={{ textAlign: "center" }}><em>Fogadó óra</em><br /><em>H: 9:00-12:00</em></p>
                      {' '}
                      <p style={{ textAlign: "center" }}><em></em></p>
                      {' '}
                      <p style={{ textAlign: "center" }}><em>Telefonon munkanapokon<br />10:00-18:00</em></p>
                    </Text>
                  </Column>
                </Row>
                <Row index={9}>
                  <Column span="4_4" index={24} last>
                    <Text index={27} align="left">
                      Tanári és tanulói segítők
                    </Text>
                  </Column>
                </Row>
                <Row index={10} className="et_pb_with_border">
                  <Column span="1_5" index={25}>
                    <TeamMember index={14} name="Kulcsár Anikó" headingLevel={4} position="Szabadidő-szervező" image={{ src: "/media/wp-content/uploads/2020/11/kulcsar_aniko.jpg", alt: "Kulcsár Anikó", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/11/kulcsar_aniko.jpg 600w, /media/wp-content/uploads/2020/11/kulcsar_aniko-480x720.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={28} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1739<br />kulcsara@petrik.hu</p>
                    </Text>
                  </Column>
                  <Column span="1_5" index={26}>
                    <TeamMember index={15} name="Sütő Éva" headingLevel={4} position="Könyvtáros" image={{ src: "/media/wp-content/uploads/2020/09/suto_eva.jpg", alt: "Sütő Éva", width: 652, height: 979, srcSet: "/media/wp-content/uploads/2020/09/suto_eva.jpg 652w, /media/wp-content/uploads/2020/09/suto_eva-200x300.jpg 200w", sizes: "(max-width: 652px) 100vw, 652px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={29} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1726<br />esuto@petrik.hu</p>
                    </Text>
                  </Column>
                  <Column span="1_5" index={27}>
                    <Text index={30} align="left">
                      <p style={{ textAlign: "center" }}><em><strong>Könytári nyitva tartás:</strong></em></p>
                      <em>
                        <p>hétfő<br />9:00 – 16:00&nbsp;&nbsp;</p>
                        <p>kedd<br />9:00 – 14:00</p>
                        <p>szerda<br />8:30 – 14:30</p>
                        <p>csütörtök<br />9:00 – 14:00</p>
                      </em>
                      <p><em>péntek: <br />9:00 – 12:00&nbsp;</em></p>
                    </Text>
                  </Column>
                  <Column span="1_5" index={28} />
                  <Column span="1_5" index={29} last>
                    <TeamMember index={16} name="Komlós Zoltán" headingLevel={4} position="Gondnok" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Komlós Zoltán", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={31} align="left">
                      <p style={{ textAlign: "center" }}>+36 70 502 1808.<br />gondnok@petrik.hu</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={3} className="et_pb_with_border">
                <Row index={11}>
                  <Column span="1_3" index={30}>
                    <Text index={32} align="center" bgLayout="dark">
                      <h2><span style={{ color: "#808080" }}>Levelezési címünk</span></h2>
                      {' '}
                      <p>1146 Budapest, Thököly út 48-54.</p>
                    </Text>
                  </Column>
                  <Column span="1_3" index={31}>
                    <Text index={33} align="center" bgLayout="dark">
                      <h2><span style={{ color: "#808080" }}>Telefon</span></h2>
                      {' '}
                      <p><Link to="/phone:+36705021724">+36 70 502 1724</Link></p>
                    </Text>
                  </Column>
                  <Column span="1_3" index={32} last>
                    <Text index={34} align="center" bgLayout="dark">
                      <h2><span style={{ color: "#808080" }}>E-mail</span></h2>
                      {' '}
                      <p><a href="mailto:info@petrik.hu">info@petrik.hu</a></p>
                    </Text>
                  </Column>
                </Row>
                <Row index={12}>
                  <Column span="4_4" index={33} last>
                    <SocialFollow
                      index={0}
                      align="center"
                      networks={[
                      { network: "facebook", href: "https://www.facebook.com/BMSZCPetrik/", title: "Kövesse a (z) Facebook elemet", label: "Követés" },
                      { network: "instagram", href: "https://www.instagram.com/petrikinsta/", title: "Kövesse a (z) Instagram elemet", label: "Követés" },
                      { network: "youtube", href: "#", title: "Kövesse a (z) Youtube elemet", label: "Követés" },
                      { network: "rss", href: "#", title: "Kövesse a (z) RSS elemet", label: "Követés" },
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
