import { Link } from 'react-router-dom'
import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Image from '../components/divi/Image.tsx'
import SocialFollow from '../components/divi/SocialFollow.tsx'
import TeamMember from '../components/divi/TeamMember.tsx'
import Text from '../components/divi/Text.tsx'
import './TanariKar.css'

export default function TanariKar() {
  return (
    <div id="main-content" className="page-tanari-kar">
      <article className="post-910 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="1_2" index={0}>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>Tanári kar</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>Egységben az erő. Több mint 100 oktató tanítja az iskola diákjait közoktatásban, szakképzésben, nappali és esti munkarendben.</p>
                    </Text>
                  </Column>
                  <Column span="1_2" index={1} last />
                </Row>
              </Section>
              <Section index={1} dividerTop>
                <Row index={1} className="et_pb_with_border">
                  <Column span="1_6" index={2}>
                    <TeamMember index={0} name="Babusa Tamás" position="informatika szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Babusa Tamás", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={2} align="left">
                      <p style={{ textAlign: "center" }}>babusa.tamas@petrik.hu</p>
                    </Text>
                    <Text index={3} align="left">
                      <p style={{ textAlign: "center" }}>A.020</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={3}>
                    <TeamMember index={1} name="B. Tóth Katalin" position="angol nyelv" image={{ src: "/media/wp-content/uploads/2020/09/btoth_katalin.jpg", alt: "B. Tóth Katalin", width: 654, height: 982, srcSet: "/media/wp-content/uploads/2020/09/btoth_katalin.jpg 654w, /media/wp-content/uploads/2020/09/btoth_katalin-200x300.jpg 200w", sizes: "(max-width: 654px) 100vw, 654px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={4} align="left">
                      <p style={{ textAlign: "center" }}>btoth@petrik.hu</p>
                    </Text>
                    <Text index={5} align="left">
                      <p style={{ textAlign: "center" }}>A.131</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={4}>
                    <TeamMember index={2} name="Bálint György" position="történelem" image={{ src: "/media/wp-content/uploads/2020/09/balint_gyorgy.jpg", alt: "Bálint György", width: 660, height: 991, srcSet: "/media/wp-content/uploads/2020/09/balint_gyorgy.jpg 660w, /media/wp-content/uploads/2020/09/balint_gyorgy-200x300.jpg 200w", sizes: "(max-width: 660px) 100vw, 660px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={6} align="left">
                      <p style={{ textAlign: "center" }}>balint@petrik.hu</p>
                    </Text>
                    <Text index={7} align="left">
                      <p style={{ textAlign: "center" }}>A.131</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={5}>
                    <TeamMember index={3} name="Balogh Zoltán" position="informatika szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Balogh Zoltán", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={8} align="left">
                      <p style={{ textAlign: "center" }}>baloghz@petrik.hu</p>
                    </Text>
                    <Text index={9} align="left">
                      <p style={{ textAlign: "center" }}>A.020</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={6}>
                    <TeamMember index={4} name="Balogh Botond" position="testnevelés tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Balogh Botond", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={10} align="left">
                      <p style={{ textAlign: "center" }}>balogh.botond@petrik.hu</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={7} last>
                    <TeamMember index={5} name="Barabás Gergő" position="11.A osztályfőnök vegyész szakmai tanár, angol nyelv tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Barabás Gergő", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={11} align="left">
                      <p style={{ textAlign: "center" }}>barabas.gergo@petrik.hu</p>
                    </Text>
                    <Text index={12} align="left">
                      <p style={{ textAlign: "center" }}>B.103</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={2} className="et_pb_with_border">
                  <Column span="1_6" index={8}>
                    <TeamMember index={6} name="Bátki Ottilia" position="szakmai igazgatóhelyettes vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2021/10/batki_ottilia_2021.jpg", alt: "Bátki Ottilia", width: 672, height: 988, srcSet: "/media/wp-content/uploads/2021/10/batki_ottilia_2021.jpg 672w, /media/wp-content/uploads/2021/10/batki_ottilia_2021-480x706.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 672px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={13} align="left">
                      <p style={{ textAlign: "center" }}>batki.ottilia@petrik.hu</p>
                    </Text>
                    <Text index={14} align="left">
                      <p style={{ textAlign: "center" }}>B.103</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={9}>
                    <TeamMember index={7} name="Bende Gyöngyi Zsuzsanna" position="angol nyelv" image={{ src: "/media/wp-content/uploads/2020/09/bende_gyongyi.jpg", alt: "Bende Gyöngyi Zsuzsanna", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/bende_gyongyi.jpg 600w, /media/wp-content/uploads/2020/09/bende_gyongyi-480x720.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={15} align="left">
                      <p style={{ textAlign: "center" }}>bende.gyongyi@petrik.hu</p>
                    </Text>
                    <Text index={16} align="left">
                      <p style={{ textAlign: "center" }}>A.131</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={10}>
                    <TeamMember index={8} name="Benyó Judit" position="vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Benyó Judit", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={17} align="left">
                      <p style={{ textAlign: "center" }}>benyo.judit@petrik.hu</p>
                    </Text>
                    <Text index={18} align="left">
                      <p style={{ textAlign: "center" }}>B.125</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={11}>
                    <TeamMember index={9} name="Béresné Bodó Noémi" position="9.d osztályfőnök munkaközösség-vezető angol nyelv tanár" image={{ src: "/media/wp-content/uploads/2020/09/beresne_bodo_noemi.jpg", alt: "Béresné Bodó Noémi", width: 656, height: 985, srcSet: "/media/wp-content/uploads/2020/09/beresne_bodo_noemi.jpg 656w, /media/wp-content/uploads/2020/09/beresne_bodo_noemi-200x300.jpg 200w", sizes: "(max-width: 656px) 100vw, 656px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={19} align="left">
                      <p style={{ textAlign: "center" }}>noemi@petrik.hu</p>
                    </Text>
                    <Text index={20} align="left">
                      <p style={{ textAlign: "center" }}>A.131</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={12}>
                    <TeamMember index={10} name="Bődi István" position="vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Bődi István", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={21} align="left">
                      <p style={{ textAlign: "center" }}>bodi.istvan@petrik.hu</p>
                    </Text>
                    <Text index={22} align="left" />
                  </Column>
                  <Column span="1_6" index={13} last>
                    <TeamMember index={11} name="Bogdán Marianna" position="informatika szakmai tanár<br />" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Bogdán Marianna", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={23} align="left">
                      <p style={{ textAlign: "center" }}>bogdan.marianna@petrik.hu</p>
                    </Text>
                    <Text index={24} align="left">
                      <p style={{ textAlign: "center" }}>A.021</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={3} className="et_pb_with_border">
                  <Column span="1_6" index={14}>
                    <TeamMember index={12} name="Bozóki Judit" position="11.B osztályfőnök, vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/bozoki_judit.jpg", alt: "Bozóki Judit", width: 656, height: 985, srcSet: "/media/wp-content/uploads/2020/09/bozoki_judit.jpg 656w, /media/wp-content/uploads/2020/09/bozoki_judit-200x300.jpg 200w", sizes: "(max-width: 656px) 100vw, 656px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={25} align="left">
                      <p style={{ textAlign: "center" }}>bozoky@petrik.hu</p>
                    </Text>
                    <Text index={26} align="left">
                      <p style={{ textAlign: "center" }}>A.130</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={15}>
                    <TeamMember index={13} name="Czikkely Imre" position="10. osztályfőnök, informatika szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Czikkely Imre", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={27} align="left">
                      <p style={{ textAlign: "center" }}>czikkely.imre@petrik.hu</p>
                    </Text>
                    <Text index={28} align="left">
                      <p style={{ textAlign: "center" }}>A.017</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={16}>
                    <TeamMember index={14} name="Czinkóczi Tamás" position="12.D osztályfőnök, informatika szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/czinkoczi_tamas.jpg", alt: "Czinkóczi Tamás", width: 656, height: 985, srcSet: "/media/wp-content/uploads/2020/09/czinkoczi_tamas.jpg 656w, /media/wp-content/uploads/2020/09/czinkoczi_tamas-200x300.jpg 200w", sizes: "(max-width: 656px) 100vw, 656px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={29} align="left">
                      <p style={{ textAlign: "center" }}>ctamas@petrik.hu</p>
                    </Text>
                    <Text index={30} align="left">
                      <p style={{ textAlign: "center" }}>A.021</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={17}>
                    <TeamMember index={15} name="Csák Szilárd" position="9.B osztályfőnök történelem" image={{ src: "/media/wp-content/uploads/2020/09/csak_szilard.jpg", alt: "Csák Szilárd", width: 652, height: 979, srcSet: "/media/wp-content/uploads/2020/09/csak_szilard.jpg 652w, /media/wp-content/uploads/2020/09/csak_szilard-200x300.jpg 200w", sizes: "(max-width: 652px) 100vw, 652px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={31} align="left">
                      <p style={{ textAlign: "center" }}>csak@petrik.hu</p>
                    </Text>
                    <Text index={32} align="left">
                      <p style={{ textAlign: "center" }}>A.219</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={18}>
                    <TeamMember index={16} name="Csutak Zsolt" position="angol nyelv" image={{ src: "/media/wp-content/uploads/2020/09/csutak_zsolt.jpg", alt: "Csutak Zsolt", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/csutak_zsolt.jpg 600w, /media/wp-content/uploads/2020/09/csutak_zsolt-480x720.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={33} align="left">
                      <p style={{ textAlign: "center" }}>csutak.zsolt@petrik.hu</p>
                    </Text>
                    <Text index={34} align="left">
                      <p style={{ textAlign: "center" }}>A.131</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={19} last>
                    <TeamMember index={17} name="Darányi Katalin" position="13.A osztályfőnök angol nyelv" image={{ src: "/media/wp-content/uploads/2020/09/daranyi_katalin.jpg", alt: "Darányi Katalin", width: 700, height: 1051, srcSet: "/media/wp-content/uploads/2020/09/daranyi_katalin.jpg 700w, /media/wp-content/uploads/2020/09/daranyi_katalin-200x300.jpg 200w, /media/wp-content/uploads/2020/09/daranyi_katalin-682x1024.jpg 682w", sizes: "(max-width: 700px) 100vw, 700px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={35} align="left">
                      <p style={{ textAlign: "center" }}>dkati@petrik.hu</p>
                    </Text>
                    <Text index={36} align="left">
                      <p style={{ textAlign: "center" }}>A.131</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={4} className="et_pb_with_border">
                  <Column span="1_6" index={20}>
                    <TeamMember index={18} name="De Rose Lynn" position="anyanyelvi lektor" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "De Rose Lynn", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={37} align="left">
                      <p style={{ textAlign: "center" }}>lektor@petrik.hu</p>
                    </Text>
                    <Text index={38} align="left">
                      <p style={{ textAlign: "center" }}>A.131</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={21}>
                    <TeamMember index={19} name="Demkó Erika" position="magyar" image={{ src: "/media/wp-content/uploads/2020/09/demko_erika-1.jpg", alt: "Demkó Erika", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/demko_erika-1.jpg 600w, /media/wp-content/uploads/2020/09/demko_erika-1-480x720.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={39} align="left">
                      <p style={{ textAlign: "center" }}>demko.erika@petrik.hu</p>
                    </Text>
                    <Text index={40} align="left">
                      <p style={{ textAlign: "center" }}>A.219</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={22}>
                    <TeamMember index={20} name="Duschák Zsuzsanna" position="12.A osztályfőnök magyar, angol" image={{ src: "/media/wp-content/uploads/2020/09/duchak_zsuzsanna.jpg", alt: "Duschák Zsuzsanna", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/duchak_zsuzsanna.jpg 600w, /media/wp-content/uploads/2020/09/duchak_zsuzsanna-480x720.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={41} align="left">
                      <p style={{ textAlign: "center" }}>duschak@petrik.hu</p>
                    </Text>
                    <Text index={42} align="left">
                      <p style={{ textAlign: "center" }}>A.219</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={23}>
                    <TeamMember index={21} name="Elekesné Sallai Mónika Angéla" position="2/14.VL osztályfőnök, vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Elekesné Sallai Mónika Angéla", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={43} align="left">
                      <p style={{ textAlign: "center" }}>sallai.monika@petrik.hu</p>
                    </Text>
                    <Text index={44} align="left">
                      <p style={{ textAlign: "center" }}>B.208</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={24}>
                    <TeamMember index={22} name="Fandel Richárd Gábor" position="1/13.VL osztályfőnök, munkaközösség-vezető, vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/fandel_richard.jpg", alt: "Fandel Richárd Gábor", width: 652, height: 979, srcSet: "/media/wp-content/uploads/2020/09/fandel_richard.jpg 652w, /media/wp-content/uploads/2020/09/fandel_richard-200x300.jpg 200w", sizes: "(max-width: 652px) 100vw, 652px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={45} align="left">
                      <p style={{ textAlign: "center" }}>fandel@petrik.hu</p>
                    </Text>
                    <Text index={46} align="center">
                      <p>B.309</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={25} last>
                    <TeamMember index={23} name="Farkas Erika" position="magyar, történelem" image={{ src: "/media/wp-content/uploads/2020/09/farkas_erika.jpg", alt: "Farkas Erika", width: 658, height: 988, srcSet: "/media/wp-content/uploads/2020/09/farkas_erika.jpg 658w, /media/wp-content/uploads/2020/09/farkas_erika-200x300.jpg 200w", sizes: "(max-width: 658px) 100vw, 658px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={47} align="left">
                      <p style={{ textAlign: "center" }}>farkas.erika@petrik.hu</p>
                    </Text>
                    <Text index={48} align="left">
                      <p style={{ textAlign: "center" }}>A.219</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={5} className="et_pb_with_border">
                  <Column span="1_6" index={26}>
                    <TeamMember index={24} name="Ferencei Boglárka" position="média" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Ferencei Boglárka", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={49} align="left">
                      <p style={{ textAlign: "center" }}>ferencei.boglarka@petrik.hu</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={27}>
                    <TeamMember index={25} name="Forgó Zsuzsanna" position="vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Forgó Zsuzsanna", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={50} align="left">
                      <p style={{ textAlign: "center" }}>forgo.zsuzsanna@petrik.hu</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={28}>
                    <TeamMember index={26} name="Fortuna Zsuzsanna" position="vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/fortuna_zsuzsanna.jpg", alt: "Fortuna Zsuzsanna", width: 664, height: 997, srcSet: "/media/wp-content/uploads/2020/09/fortuna_zsuzsanna.jpg 664w, /media/wp-content/uploads/2020/09/fortuna_zsuzsanna-200x300.jpg 200w", sizes: "(max-width: 664px) 100vw, 664px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={51} align="left">
                      <p style={{ textAlign: "center" }}>fortuna@petrik.hu</p>
                    </Text>
                    <Text index={52} align="left">
                      <p style={{ textAlign: "center" }}>A.110</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={29}>
                    <TeamMember index={27} name="Gál-Berey Csilla" position="igazgató" image={{ src: "/media/wp-content/uploads/2021/10/gal_berey_csilla_2021.jpg", alt: "Gál-Berey Csilla", width: 675, height: 985, srcSet: "/media/wp-content/uploads/2021/10/gal_berey_csilla_2021.jpg 675w, /media/wp-content/uploads/2021/10/gal_berey_csilla_2021-480x700.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 675px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                      {' '}
                      <p>matematika</p>
                    </TeamMember>
                    <Text index={53} align="left">
                      <p style={{ textAlign: "center" }}>galberey@petrik.hu</p>
                    </Text>
                    <Text index={54} align="left">
                      <p style={{ textAlign: "center" }}>B.110</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={30}>
                    <TeamMember index={28} name="Gőgh Zsolt" position="környezetvédelmi szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/gogh_zsolt.jpg", alt: "Gőgh Zsolt", width: 656, height: 985, srcSet: "/media/wp-content/uploads/2020/09/gogh_zsolt.jpg 656w, /media/wp-content/uploads/2020/09/gogh_zsolt-200x300.jpg 200w", sizes: "(max-width: 656px) 100vw, 656px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={55} align="left">
                      <p style={{ textAlign: "center" }}>goghzs@petrik.hu</p>
                    </Text>
                    <Text index={56} align="left">
                      <p style={{ textAlign: "center" }}>B.041</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={31} last>
                    <TeamMember index={29} name="Frank Attila" position="vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Frank Attila", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={57} align="left">
                      <p style={{ textAlign: "center" }}>frank.attila@petrik.hu</p>
                    </Text>
                    <Text index={58} align="left">
                      <p style={{ textAlign: "center" }}>B.018</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={6} className="et_pb_with_border">
                  <Column span="1_6" index={32}>
                    <TeamMember index={30} name="Guth Gabriella" position="10.E osztályfőnök, munkaközösség-vezető, angol nyelv tanár" image={{ src: "/media/wp-content/uploads/2020/09/guth_gabriella.jpg", alt: "Guth Gabriella", width: 654, height: 982, srcSet: "/media/wp-content/uploads/2020/09/guth_gabriella.jpg 654w, /media/wp-content/uploads/2020/09/guth_gabriella-200x300.jpg 200w", sizes: "(max-width: 654px) 100vw, 654px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={59} align="left">
                      <p style={{ textAlign: "center" }}>guth@petrik.hu</p>
                    </Text>
                    <Text index={60} align="left">
                      <p style={{ textAlign: "center" }}>A.131</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={33}>
                    <TeamMember index={31} name="Hajagos Máté" position="DÖK segítő tanár, magyar történelem" image={{ src: "/media/wp-content/uploads/2020/11/hajagos_mate.jpg", alt: "Hajagos Máté", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/11/hajagos_mate.jpg 600w, /media/wp-content/uploads/2020/11/hajagos_mate-480x720.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={61} align="left">
                      <p style={{ textAlign: "center" }}>hajagos.mate@petrik.hu</p>
                    </Text>
                    <Text index={62} align="left">
                      <p style={{ textAlign: "center" }}>A.219</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={34}>
                    <TeamMember index={32} name="Halász Gábor" position="munkaközösség-vezető, informatika szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/halasz_gabor.jpg", alt: "Halász Gábor", width: 656, height: 985, srcSet: "/media/wp-content/uploads/2020/09/halasz_gabor.jpg 656w, /media/wp-content/uploads/2020/09/halasz_gabor-200x300.jpg 200w", sizes: "(max-width: 656px) 100vw, 656px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={63} align="left">
                      <p style={{ textAlign: "center" }}>halasz.gabor@petrik.hu</p>
                    </Text>
                    <Text index={64} align="left">
                      <p style={{ textAlign: "center" }}>A.021</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={35}>
                    <TeamMember index={33} name="Hertelendi Gábor" position="rendszergazda, informatika szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Hertelendi Gábor", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={65} align="left">
                      <p style={{ textAlign: "center" }}>hertelendi.gabor@petrik.hu</p>
                    </Text>
                    <Text index={66} align="left">
                      <p style={{ textAlign: "center" }}>A.019</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={36}>
                    <TeamMember index={34} name="Horváth Gyöngyi" position="pénzügyi ismeretek, német nyelv" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Horváth Gyöngyi", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={67} align="left">
                      <p style={{ textAlign: "center" }}>horvathg@petrik.hu</p>
                    </Text>
                    <Text index={68} align="left">
                      <p style={{ textAlign: "center" }}>A.131</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={37} last>
                    <TeamMember index={35} name="Horváth Norbert" position="vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Horváth Norbert", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={69} align="left">
                      <p style={{ textAlign: "center" }}>horvath.norbert@petrik.hu</p>
                    </Text>
                    <Text index={70} align="left">
                      <p style={{ textAlign: "center" }}>B.125</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={7} className="et_pb_with_border">
                  <Column span="1_6" index={38}>
                    <TeamMember index={36} name="Horváth Zoltán" position="vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Horváth Zoltán", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={71} align="left">
                      <p style={{ textAlign: "center" }}>horvath.zoltan.okt@petrik.hu</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={39}>
                    <TeamMember index={37} name="Jabelkó-Tolnai Csilla Anna" position="angol" image={{ src: "/media/wp-content/uploads/2020/09/tolnay_csilla.jpg", alt: "Jabelkó-Tolnai Csilla Anna", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tolnay_csilla.jpg 600w, /media/wp-content/uploads/2020/09/tolnay_csilla-480x720.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={72} align="left">
                      <p style={{ textAlign: "center" }}>tolnai@petrik.hu</p>
                    </Text>
                    <Text index={73} align="left">
                      <p style={{ textAlign: "center" }}>A.131</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={40}>
                    <TeamMember index={38} name="Kállóné Husi Zsuzsanna" position="testnevelés" image={{ src: "/media/wp-content/uploads/2020/09/husi_zsuzsanna.jpg", alt: "Kállóné Husi Zsuzsanna", width: 652, height: 979, srcSet: "/media/wp-content/uploads/2020/09/husi_zsuzsanna.jpg 652w, /media/wp-content/uploads/2020/09/husi_zsuzsanna-200x300.jpg 200w", sizes: "(max-width: 652px) 100vw, 652px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={74} align="left">
                      <p style={{ textAlign: "center" }}>husi@petrik.hu</p>
                    </Text>
                    <Text index={75} align="left">
                      <p style={{ textAlign: "center" }}>A.016</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={41}>
                    <TeamMember index={39} name="Karsai Gergő" position="testnevelés" image={{ src: "/media/wp-content/uploads/2020/09/karsai_gergo.jpg", alt: "Karsai Gergő", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/karsai_gergo.jpg 600w, /media/wp-content/uploads/2020/09/karsai_gergo-480x720.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={76} align="left">
                      <p style={{ textAlign: "center" }}>karsai.gergo@petrik.hu</p>
                    </Text>
                    <Text index={77} align="left">
                      <p style={{ textAlign: "center" }}>A.016</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={42}>
                    <TeamMember index={40} name="Kaspareik Péter" position="matematika angol nyelven, matematika, angol nyelv" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Kaspareik Péter", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={78} align="left">
                      <p style={{ textAlign: "center" }}>kasparek.peter@petrik.hu</p>
                    </Text>
                    <Text index={79} align="left">
                      <p style={{ textAlign: "center" }}>A.133</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={43} last>
                    <TeamMember index={41} name="Király Zalán" position="testnevelés" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Király Zalán", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={80} align="left">
                      <p style={{ textAlign: "center" }}>kiraly.zalan@petrik.hu</p>
                    </Text>
                    <Text index={81} align="left">
                      <p style={{ textAlign: "center" }}>A.016</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={8} className="et_pb_with_border">
                  <Column span="1_6" index={44}>
                    <TeamMember index={42} name="Koczka István" position="informatika szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/koczka_istvan.jpg", alt: "Koczka István", width: 656, height: 985, srcSet: "/media/wp-content/uploads/2020/09/koczka_istvan.jpg 656w, /media/wp-content/uploads/2020/09/koczka_istvan-200x300.jpg 200w", sizes: "(max-width: 656px) 100vw, 656px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={82} align="left">
                      <p style={{ textAlign: "center" }}>koczka.istvan@petrik.hu</p>
                    </Text>
                    <Text index={83} align="left">
                      <p style={{ textAlign: "center" }}>A.130</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={45}>
                    <TeamMember index={43} name="Kollár Zsuzsanna" position="10.A osztályfőnök, matematika angol nyelven, matematika, angol nyelv" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Kollár Zsuzsanna", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={84} align="left">
                      <p style={{ textAlign: "center" }}>kollar.zsuzsanna@petrik.hu</p>
                    </Text>
                    <Text index={85} align="left">
                      <p style={{ textAlign: "center" }}>A.131</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={46}>
                    <TeamMember index={44} name="Kovács Olivér" position="13.B osztályfőnök, fizika, vegész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/kovacs_oliver.jpg", alt: "Kovács Olivér", width: 658, height: 988, srcSet: "/media/wp-content/uploads/2020/09/kovacs_oliver.jpg 658w, /media/wp-content/uploads/2020/09/kovacs_oliver-200x300.jpg 200w", sizes: "(max-width: 658px) 100vw, 658px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={86} align="left">
                      <p style={{ textAlign: "center" }}>kovacs.oliver@petrik.hu</p>
                    </Text>
                    <Text index={87} align="left">
                      <p style={{ textAlign: "center" }}>A.130</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={47}>
                    <TeamMember index={45} name="Kovácsné Antal Éva" position="matematika" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Kovácsné Antal Éva", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={88} align="left">
                      <p style={{ textAlign: "center" }}>antal.eva@petrik.hu</p>
                    </Text>
                    <Text index={89} align="left">
                      <p style={{ textAlign: "center" }}>A.133</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={48}>
                    <TeamMember index={46} name="Kugyelláné Schmidtka Ágnes" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Kugyelláné Schmidtka Ágnes", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border" />
                    <Text index={90} align="left" />
                    <Text index={91} align="left">
                      <p style={{ textAlign: "center" }}>A.016</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={49} last>
                    <TeamMember index={47} name="Laman Richárd" position="testnevelés" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Laman Richárd", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={92} align="left">
                      <p style={{ textAlign: "center" }}>laman.richard@petrik.hu</p>
                    </Text>
                    <Text index={93} align="left">
                      <p style={{ textAlign: "center" }}>A.016</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={9} className="et_pb_with_border">
                  <Column span="1_6" index={50}>
                    <TeamMember index={48} name="Latabár Endre" position="12.E osztályfőnök, angol nyelv tanár" image={{ src: "/media/wp-content/uploads/2020/09/latabar_endre.jpg", alt: "Latabár Endre", width: 658, height: 988, srcSet: "/media/wp-content/uploads/2020/09/latabar_endre.jpg 658w, /media/wp-content/uploads/2020/09/latabar_endre-200x300.jpg 200w", sizes: "(max-width: 658px) 100vw, 658px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={94} align="left">
                      <p style={{ textAlign: "center" }}>latabar.endre@petrik.hu</p>
                    </Text>
                    <Text index={95} align="left">
                      <p style={{ textAlign: "center" }}>A.131</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={51}>
                    <TeamMember index={49} name="Lénárdné Bárdossy Ágota" position="informatika szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Lénárdné Bárdossy Ágota", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={96} align="left">
                      <p style={{ textAlign: "center" }}>bardossya@petrik.hu</p>
                    </Text>
                    <Text index={97} align="left">
                      <p style={{ textAlign: "center" }}>A.020</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={52}>
                    <TeamMember index={50} name="Dr. Lois Isabella" position="vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2021/10/dr_lois_isabella.jpg", alt: "Dr. Lois Isabella", width: 681, height: 982, srcSet: "/media/wp-content/uploads/2021/10/dr_lois_isabella.jpg 681w, /media/wp-content/uploads/2021/10/dr_lois_isabella-480x692.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 681px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={98} align="left">
                      <p style={{ textAlign: "center" }}>lois@petrik.hu</p>
                    </Text>
                    <Text index={99} align="left">
                      <p style={{ textAlign: "center" }}>B.208</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={53}>
                    <TeamMember index={51} name="Lovas Margaret Anikó" position="munkaközösség-vezető, matematika tanár" image={{ src: "/media/wp-content/uploads/2020/09/lovas_margarett.jpg", alt: "Lovas Margaret Anikó", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/lovas_margarett.jpg 600w, /media/wp-content/uploads/2020/09/lovas_margarett-480x720.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={100} align="left">
                      <p style={{ textAlign: "center" }}>lovas@petrik.hu</p>
                    </Text>
                    <Text index={101} align="left">
                      <p style={{ textAlign: "center" }}>A.130</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={54}>
                    <TeamMember index={52} name="Lukács Ferenc" position="matematika, fizika" image={{ src: "/media/wp-content/uploads/2020/09/lukacs_ferenc.jpg", alt: "Lukács Ferenc", width: 652, height: 979, srcSet: "/media/wp-content/uploads/2020/09/lukacs_ferenc.jpg 652w, /media/wp-content/uploads/2020/09/lukacs_ferenc-200x300.jpg 200w", sizes: "(max-width: 652px) 100vw, 652px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={102} align="left">
                      <p style={{ textAlign: "center" }}>lukacs.ferenc@petrik.hu</p>
                    </Text>
                    <Text index={103} align="left">
                      <p style={{ textAlign: "center" }}>A.130</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={55} last>
                    <TeamMember index={53} name="Madarász Ákos" position="matematika-angol" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Madarász Ákos", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={104} align="left">
                      <p style={{ textAlign: "center" }}>madarasz.akos@petrik.hu</p>
                    </Text>
                    <Text index={105} align="left">
                      <p style={{ textAlign: "center" }}>A.130</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={10} className="et_pb_with_border">
                  <Column span="1_6" index={56}>
                    <TeamMember index={54} name="Márta József István" position="vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Márta József István", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={106} align="left">
                      <p style={{ textAlign: "center" }}>marta.jozsef@petrik.hu</p>
                    </Text>
                    <Text index={107} align="left">
                      <p style={{ textAlign: "center" }}>A.213</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={57}>
                    <TeamMember index={55} name="Dr. Máté Marianna" position="9.A osztályfőnök, matematika, kémia" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Dr. Máté Marianna", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={108} align="left">
                      <p style={{ textAlign: "center" }}>mate.marianna@petrik.hu</p>
                    </Text>
                    <Text index={109} align="left">
                      <p style={{ textAlign: "center" }}>A.130</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={58}>
                    <TeamMember index={56} name="Merényi Miklós" position="2/14. RS osztályfőnök, munkaközösség-vezető, informatika szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Merényi Miklós", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={110} align="left">
                      <p style={{ textAlign: "center" }}>merenyi.miklos@petrik.hu</p>
                    </Text>
                    <Text index={111} align="left">
                      <p style={{ textAlign: "center" }}>A.017</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={59}>
                    <TeamMember index={57} name="Mészáros Tamás" position="informatika szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Mészáros Tamás", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={112} align="left">
                      <p style={{ textAlign: "center" }}>meszaros.tamas@petrik.hu</p>
                    </Text>
                    <Text index={113} align="left">
                      <p style={{ textAlign: "center" }}>A.016</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={60}>
                    <TeamMember index={58} name="Nagy Judit" position="matematika" image={{ src: "/media/wp-content/uploads/2020/09/nagy_judit.jpg", alt: "Nagy Judit", width: 656, height: 985, srcSet: "/media/wp-content/uploads/2020/09/nagy_judit.jpg 656w, /media/wp-content/uploads/2020/09/nagy_judit-200x300.jpg 200w", sizes: "(max-width: 656px) 100vw, 656px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={114} align="left">
                      <p style={{ textAlign: "center" }}>nagy.judit@petrik.hu</p>
                    </Text>
                    <Text index={115} align="left">
                      <p style={{ textAlign: "center" }}>A.130</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={61} last>
                    <TeamMember index={59} name="Nagyné Németh Ildikó Andrea" position="12.C osztályfőnök vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Nagyné Németh Ildikó Andrea", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={116} align="left">
                      <p style={{ textAlign: "center" }}>nemeth.ildiko@petrik.hu</p>
                    </Text>
                    <Text index={117} align="left">
                      <p style={{ textAlign: "center" }}>B.309</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={11} className="et_pb_with_border">
                  <Column span="1_6" index={62}>
                    <TeamMember index={60} name="Omischl-Németh Eszter" position="11.G osztályfőnök, magyar nyelv és irodalom, angol nyelv" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Omischl-Németh Eszter", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={118} align="left">
                      <p style={{ textAlign: "center" }}>nemeth.eszter@petrik.hu</p>
                    </Text>
                    <Text index={119} align="left">
                      <p style={{ textAlign: "center" }}>A.219</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={63}>
                    <TeamMember index={61} name="Pappné Debreczeni Ildikó" position="9.C osztályfőnök, környezetvédelem szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/pappne_debreczeni_ildik.jpg", alt: "Pappné Debreczeni Ildikó", width: 656, height: 985, srcSet: "/media/wp-content/uploads/2020/09/pappne_debreczeni_ildik.jpg 656w, /media/wp-content/uploads/2020/09/pappne_debreczeni_ildik-200x300.jpg 200w", sizes: "(max-width: 656px) 100vw, 656px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={120} align="left">
                      <p style={{ textAlign: "center" }}>pappne@petrik.hu</p>
                    </Text>
                    <Text index={121} align="left">
                      <p style={{ textAlign: "center" }}>B.041</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={64}>
                    <TeamMember index={62} name="Penksza Károly Lászlóné" position="általános igazgatóhelyettes, biológia tanár" image={{ src: "/media/wp-content/uploads/2020/09/penksza_karolyne.jpg", alt: "Penksza Károly Lászlóné", width: 672, height: 976, srcSet: "/media/wp-content/uploads/2020/09/penksza_karolyne.jpg 672w, /media/wp-content/uploads/2020/09/penksza_karolyne-480x697.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 672px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={122} align="left">
                      <p style={{ textAlign: "center" }}>asztalos@petrik.hu</p>
                    </Text>
                    <Text index={123} align="left">
                      <p style={{ textAlign: "center" }}>Diákcentrum</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={65}>
                    <TeamMember index={63} name="Petri Judit" position="10.B osztályfőnök, vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/petri_judit.jpg", alt: "Petri Judit", width: 654, height: 982, srcSet: "/media/wp-content/uploads/2020/09/petri_judit.jpg 654w, /media/wp-content/uploads/2020/09/petri_judit-200x300.jpg 200w", sizes: "(max-width: 654px) 100vw, 654px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={124} align="left">
                      <p style={{ textAlign: "center" }}>petri.judit@petrik.hu</p>
                    </Text>
                    <Text index={125} align="left">
                      <p style={{ textAlign: "center" }}>B.041</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={66}>
                    <TeamMember index={64} name="Rausch Péter" position="11.C osztályfőnök, munkaközösség-vezető, környezetvédelem szakmai tanár, kémia" image={{ src: "/media/wp-content/uploads/2020/09/rausch_peter.jpg", alt: "Rausch Péter", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/rausch_peter.jpg 600w, /media/wp-content/uploads/2020/09/rausch_peter-480x720.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={126} align="left">
                      <p style={{ textAlign: "center" }}>rausch.peter@petrik.hu</p>
                    </Text>
                    <Text index={127} align="left">
                      <p style={{ textAlign: "center" }}>B.041</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={67} last>
                    <TeamMember index={65} name="Ribní Ferenc" position="informatika szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Ribní Ferenc", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={128} align="left">
                      <p style={{ textAlign: "center" }}>ribni.ferenc@petrik.hu</p>
                    </Text>
                    <Text index={129} align="left">
                      <p style={{ textAlign: "center" }}>A.020</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={12} className="et_pb_with_border">
                  <Column span="1_6" index={68}>
                    <TeamMember index={66} name="Sárközi-Paulik Brigitta" position="igazgatóhelyettes, 11.E osztályfőnök, angol nyelv" image={{ src: "/media/wp-content/uploads/2020/09/sarkozi_paulik_brigitta.jpg", alt: "Sárközi-Paulik Brigitta", width: 658, height: 988, srcSet: "/media/wp-content/uploads/2020/09/sarkozi_paulik_brigitta.jpg 658w, /media/wp-content/uploads/2020/09/sarkozi_paulik_brigitta-200x300.jpg 200w", sizes: "(max-width: 658px) 100vw, 658px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={130} align="left">
                      <p style={{ textAlign: "center" }}>paulik@petrik.hu</p>
                    </Text>
                    <Text index={131} align="left">
                      <p style={{ textAlign: "center" }}>B.108</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={69}>
                    <TeamMember index={67} name="" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border" />
                    <Text index={132} align="left">
                      <p style={{ textAlign: "center" }}>@petrik.hu</p>
                    </Text>
                    <Text index={133} align="left" />
                  </Column>
                  <Column span="1_6" index={70}>
                    <TeamMember index={68} name="Schubert Bence" position="testnevelés" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Schubert Bence", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={134} align="left">
                      <p style={{ textAlign: "center" }}>schubert.bence@petrik.hu</p>
                    </Text>
                    <Text index={135} align="left">
                      <p style={{ textAlign: "center" }}>A.016</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={71}>
                    <TeamMember index={69} name="Seres Orsolya Zsuzsanna" position="10.C osztályfőnök, angol nyelv tanár" image={{ src: "/media/wp-content/uploads/2020/09/seres_orsolya.jpg", alt: "Seres Orsolya Zsuzsanna", width: 656, height: 985, srcSet: "/media/wp-content/uploads/2020/09/seres_orsolya.jpg 656w, /media/wp-content/uploads/2020/09/seres_orsolya-200x300.jpg 200w", sizes: "(max-width: 656px) 100vw, 656px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={136} align="left">
                      <p style={{ textAlign: "center" }}>seres@petrik.hu</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={72}>
                    <TeamMember index={70} name="Siska Dávid" position="vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", alt: "Siska Dávid", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={137} align="left">
                      <p style={{ textAlign: "center" }}>siska.david@petrik.hu</p>
                    </Text>
                    <Text index={138} align="left">
                      <p style={{ textAlign: "center" }}>B.309</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={73} last>
                    <TeamMember index={71} name="" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border" />
                    <Text index={139} align="left">
                      <p style={{ textAlign: "center" }}>@petrik.hu</p>
                    </Text>
                    <Text index={140} align="left" />
                  </Column>
                </Row>
                <Row index={13} className="et_pb_with_border">
                  <Column span="1_6" index={74}>
                    <TeamMember index={72} name="Sőre Ferenc" position="vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/sore_ferenc.jpg", alt: "Sőre Ferenc", width: 656, height: 986, srcSet: "/media/wp-content/uploads/2020/09/sore_ferenc.jpg 656w, /media/wp-content/uploads/2020/09/sore_ferenc-200x300.jpg 200w", sizes: "(max-width: 656px) 100vw, 656px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={141} align="left">
                      <p style={{ textAlign: "center" }}>sore@petrik.hu</p>
                    </Text>
                    <Text index={142} align="left">
                      <p style={{ textAlign: "center" }}>B.125</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={75}>
                    <TeamMember index={73} name="Szabados István" position="9.KNY osztályfőnök,munkaközösség-vezető, magyar nyelv és irodalom, történelem" image={{ src: "/media/wp-content/uploads/2020/09/szabados_istvan.jpg", alt: "Szabados István", width: 648, height: 973, srcSet: "/media/wp-content/uploads/2020/09/szabados_istvan.jpg 648w, /media/wp-content/uploads/2020/09/szabados_istvan-200x300.jpg 200w", sizes: "(max-width: 648px) 100vw, 648px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={143} align="left">
                      <p style={{ textAlign: "center" }}>szabados@petrik.hu</p>
                    </Text>
                    <Text index={144} align="left">
                      <p style={{ textAlign: "center" }}>A.219</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={76}>
                    <TeamMember index={74} name="Dr. Szabó Marianna" position="13.C osztályfőnök, környezetvédelmi szakmai tanár, biológia" image={{ src: "/media/wp-content/uploads/2020/09/szabo_marianne.jpg", alt: "Dr. Szabó Marianna", width: 412, height: 618, srcSet: "/media/wp-content/uploads/2020/09/szabo_marianne.jpg 412w, /media/wp-content/uploads/2020/09/szabo_marianne-200x300.jpg 200w", sizes: "(max-width: 412px) 100vw, 412px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={145} align="left">
                      <p style={{ textAlign: "center" }}>dr.szabo.marianna@petrik.hu</p>
                    </Text>
                    <Text index={146} align="left">
                      <p style={{ textAlign: "center" }}>B.041</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={77}>
                    <TeamMember index={75} name="Szajkó Orsolya" position="vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2021/10/szajko_orsolya.jpg", alt: "Szajkó Orsolya", width: 681, height: 994, srcSet: "/media/wp-content/uploads/2021/10/szajko_orsolya.jpg 681w, /media/wp-content/uploads/2021/10/szajko_orsolya-480x701.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 681px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={147} align="left">
                      <p style={{ textAlign: "center" }}>szajko.orsolya@petrik.hu</p>
                    </Text>
                    <Text index={148} align="left">
                      <p style={{ textAlign: "center" }}>B.041</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={78}>
                    <TeamMember index={76} name="Szolnok Ádám" position="igazgatóhelyettes, angol" image={{ src: "/media/wp-content/uploads/2020/09/szolnok_adam.jpg", alt: "Szolnok Ádám", width: 652, height: 979, srcSet: "/media/wp-content/uploads/2020/09/szolnok_adam.jpg 652w, /media/wp-content/uploads/2020/09/szolnok_adam-200x300.jpg 200w", sizes: "(max-width: 652px) 100vw, 652px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={149} align="left">
                      <p style={{ textAlign: "center" }}>szolnok@petrik.hu</p>
                    </Text>
                    <Text index={150} align="left">
                      <p style={{ textAlign: "center" }}>A.017</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={79} last>
                    <TeamMember index={77} name="Takács Emese" position="matematika" image={{ src: "/media/wp-content/uploads/2020/09/takacs_emese.jpg", alt: "Takács Emese", width: 654, height: 982, srcSet: "/media/wp-content/uploads/2020/09/takacs_emese.jpg 654w, /media/wp-content/uploads/2020/09/takacs_emese-200x300.jpg 200w", sizes: "(max-width: 654px) 100vw, 654px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={151} align="left">
                      <p style={{ textAlign: "center" }}>tmse@petrik.hu</p>
                    </Text>
                    <Text index={152} align="left">
                      <p style={{ textAlign: "center" }}>A.213</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={14} className="et_pb_with_border">
                  <Column span="1_6" index={80}>
                    <TeamMember index={78} name="Tihanyi Péter" position="vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/tihanyi_peter.jpg", alt: "Tihanyi Péter", width: 654, height: 982, srcSet: "/media/wp-content/uploads/2020/09/tihanyi_peter.jpg 654w, /media/wp-content/uploads/2020/09/tihanyi_peter-200x300.jpg 200w", sizes: "(max-width: 654px) 100vw, 654px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={153} align="left">
                      <p style={{ textAlign: "center" }}>tihanyi@petrik.hu</p>
                    </Text>
                    <Text index={154} align="left">
                      <p style={{ textAlign: "center" }}>B.220</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={81}>
                    <TeamMember index={79} name="Tóth Béla" position="testnevelés" image={{ src: "/media/wp-content/uploads/2020/09/toth_bela.jpg", alt: "Tóth Béla", width: 654, height: 982, srcSet: "/media/wp-content/uploads/2020/09/toth_bela.jpg 654w, /media/wp-content/uploads/2020/09/toth_bela-200x300.jpg 200w", sizes: "(max-width: 654px) 100vw, 654px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={155} align="left">
                      <p style={{ textAlign: "center" }}>tela@petrik.hu</p>
                    </Text>
                    <Text index={156} align="left">
                      <p style={{ textAlign: "center" }}>A.016</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={82}>
                    <TeamMember index={80} name="Tóth Enikő" position="matematika" image={{ src: "/media/wp-content/uploads/2020/09/toth_eniko.jpg", alt: "Tóth Enikő", width: 652, height: 979, srcSet: "/media/wp-content/uploads/2020/09/toth_eniko.jpg 652w, /media/wp-content/uploads/2020/09/toth_eniko-200x300.jpg 200w", sizes: "(max-width: 652px) 100vw, 652px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={157} align="left">
                      <p style={{ textAlign: "center" }}>totheniko@petrik.hu</p>
                    </Text>
                    <Text index={158} align="left">
                      <p style={{ textAlign: "center" }}>A.110</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={83}>
                    <TeamMember index={81} name="Tóth Edina" position="vegyész szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/toth_edina.jpg", alt: "Tóth Edina", width: 654, height: 982, srcSet: "/media/wp-content/uploads/2020/09/toth_edina.jpg 654w, /media/wp-content/uploads/2020/09/toth_edina-200x300.jpg 200w", sizes: "(max-width: 654px) 100vw, 654px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={159} align="left">
                      <p style={{ textAlign: "center" }}>tothe@petrik.hu</p>
                    </Text>
                    <Text index={160} align="left">
                      <p style={{ textAlign: "center" }}>A.110</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={84}>
                    <TeamMember index={82} name="Tóth Éva" position="13.D osztályfőnök, angol nyelv tanár, szakmai informatika tanár" image={{ src: "/media/wp-content/uploads/2020/10/toth_eva.jpg", alt: "Tóth Éva", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/10/toth_eva.jpg 600w, /media/wp-content/uploads/2020/10/toth_eva-480x720.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Image src="/media/wp-content/uploads/2023/10/bathyscaphe-6934707_1280.png" width={1280} height={784} srcSet="/media/wp-content/uploads/2023/10/bathyscaphe-6934707_1280.png 1280w, /media/wp-content/uploads/2023/10/bathyscaphe-6934707_1280-980x600.png 980w, /media/wp-content/uploads/2023/10/bathyscaphe-6934707_1280-480x294.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) 1280px, 100vw" href="https://forms.gle/cif8azLVMrBJhEuB8" index={0} />
                    <Text index={161} align="left">
                      <p style={{ textAlign: "center" }}>toth.eva@petrik.hu</p>
                    </Text>
                    <Text index={162} align="left">
                      <p style={{ textAlign: "center" }}>A.113</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={85} last>
                    <TeamMember index={83} name="Tóth Krisztina" position="11.B osztályfőnök, vegyész szakmai tanárz, kémia tanár" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", alt: "Tóth Krisztina", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={163} align="left">
                      <p style={{ textAlign: "center" }}>toth.krisztina@petrik.hu</p>
                    </Text>
                    <Text index={164} align="left">
                      <p style={{ textAlign: "center" }}>B.041</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={15} className="et_pb_with_border">
                  <Column span="1_6" index={86}>
                    <TeamMember index={84} name="Uhlár Zoltán István" position="gépész" image={{ src: "/media/wp-content/uploads/2020/09/uhlar_zoltan.jpg", alt: "Uhlár Zoltán István", width: 654, height: 982, srcSet: "/media/wp-content/uploads/2020/09/uhlar_zoltan.jpg 654w, /media/wp-content/uploads/2020/09/uhlar_zoltan-200x300.jpg 200w", sizes: "(max-width: 654px) 100vw, 654px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={165} align="left">
                      <p style={{ textAlign: "center" }}>uhlarz@petrik.hu</p>
                    </Text>
                    <Text index={166} align="left">
                      <p style={{ textAlign: "center" }}>A.132</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={87}>
                    <TeamMember index={85} name="Urbin Péter" position="informatika szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/urbin_peter.jpg", alt: "Urbin Péter", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/urbin_peter.jpg 600w, /media/wp-content/uploads/2020/09/urbin_peter-480x720.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={167} align="left">
                      <p style={{ textAlign: "center" }}>urbin.peter@petrik.hu</p>
                    </Text>
                    <Text index={168} align="left">
                      <p style={{ textAlign: "center" }}>A.019</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={88}>
                    <TeamMember index={86} name="Vámos Tibor" position="12.C osztályfőnök, környezetvédelmi szakmai tanár" image={{ src: "/media/wp-content/uploads/2020/09/vamos_tibor.jpg", alt: "Vámos Tibor", width: 652, height: 979, srcSet: "/media/wp-content/uploads/2020/09/vamos_tibor.jpg 652w, /media/wp-content/uploads/2020/09/vamos_tibor-200x300.jpg 200w", sizes: "(max-width: 652px) 100vw, 652px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={169} align="left">
                      <p style={{ textAlign: "center" }}>vamos.tibor@petrik.hu</p>
                    </Text>
                    <Text index={170} align="left">
                      <p style={{ textAlign: "center" }}>A.213</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={89}>
                    <TeamMember index={87} name="Villányi-Borsics Eszter" position="13.E osztályfőnök,angol nyelv tanár" image={{ src: "/media/wp-content/uploads/2020/09/villanyi_eszter.jpg", alt: "Villányi-Borsics Eszter", width: 656, height: 985, srcSet: "/media/wp-content/uploads/2020/09/villanyi_eszter.jpg 656w, /media/wp-content/uploads/2020/09/villanyi_eszter-200x300.jpg 200w", sizes: "(max-width: 656px) 100vw, 656px" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={171} align="left">
                      <p style={{ textAlign: "center" }}>villanyi@petrik.hu</p>
                    </Text>
                    <Text index={172} align="left">
                      <p style={{ textAlign: "center" }}>A.113</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={90}>
                    <TeamMember index={88} name="Völgyi Ferenc Iván" position="9.E osztályfőnök, informatika szakmai tanár" image={{ src: "/media/wp-content/uploads/2026/05/vfi-1.jpg", alt: "Völgyi Ferenc Iván", width: 977, height: 1023, srcSet: "/media/wp-content/uploads/2026/05/vfi-1.jpg 977w, /media/wp-content/uploads/2026/05/vfi-1-480x503.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 977px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={173} align="left">
                      <p style={{ textAlign: "center" }}>volgyi@petrik.hu</p>
                    </Text>
                    <Text index={174} align="left">
                      <p style={{ textAlign: "center" }}>A.116</p>
                    </Text>
                  </Column>
                  <Column span="1_6" index={91} last>
                    <TeamMember index={89} name="Weisz Ilona" position="vegyész szakmai tanár, biológia, kémia" image={{ src: "/media/wp-content/uploads/2020/09/weisz_ilona.jpg", alt: "Weisz Ilona", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/weisz_ilona.jpg 600w, /media/wp-content/uploads/2020/09/weisz_ilona-480x720.jpg 480w", sizes: "(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 600px, 100vw" }} align="center" className="et_pb_with_border">
                      {' '}
                    </TeamMember>
                    <Text index={175} align="left">
                      <p style={{ textAlign: "center" }}>weisz@petrik.hu</p>
                    </Text>
                    <Text index={176} align="left">
                      <p style={{ textAlign: "center" }}>A.116</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={16} className="et_pb_with_border">
                  <Column span="1_6" index={92}>
                    <TeamMember index={90} name="" image={{ src: "/media/wp-content/uploads/2020/09/tanarur.png", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarur.png 600w, /media/wp-content/uploads/2020/09/tanarur-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border" />
                    <Text index={177} align="left">
                      <p style={{ textAlign: "center" }}>@petrik.hu</p>
                    </Text>
                    <Text index={178} align="left" />
                  </Column>
                  <Column span="1_6" index={93}>
                    <TeamMember index={91} name="" image={{ src: "/media/wp-content/uploads/2020/09/tanarno.png", width: 600, height: 900, srcSet: "/media/wp-content/uploads/2020/09/tanarno.png 600w, /media/wp-content/uploads/2020/09/tanarno-200x300.png 200w", sizes: "(max-width: 600px) 100vw, 600px" }} align="center" className="et_pb_with_border" />
                    <Text index={179} align="left">
                      <p style={{ textAlign: "center" }}>@petrik.hu</p>
                    </Text>
                    <Text index={180} align="left" />
                  </Column>
                  <Column span="1_6" index={94} />
                  <Column span="1_6" index={95} />
                  <Column span="1_6" index={96} />
                  <Column span="1_6" index={97} last />
                </Row>
              </Section>
              <Section index={2} className="et_pb_with_border">
                <Row index={17}>
                  <Column span="1_3" index={98}>
                    <Text index={181} align="center" bgLayout="dark">
                      <h2><span style={{ color: "#808080" }}>Levelezési címünk</span></h2>
                      {' '}
                      <p>1146 Budapest, Thököly út 48-54.</p>
                    </Text>
                  </Column>
                  <Column span="1_3" index={99}>
                    <Text index={182} align="center" bgLayout="dark">
                      <h2><span style={{ color: "#808080" }}>Telefon</span></h2>
                      {' '}
                      <p><Link to="tel:+3613434810">+36 1 343 4810</Link></p>
                    </Text>
                  </Column>
                  <Column span="1_3" index={100} last>
                    <Text index={183} align="center" bgLayout="dark">
                      <h2><span style={{ color: "#808080" }}>E-mail</span></h2>
                      {' '}
                      <p><a href="mailto:info@petrik.hu">info@petrik.hu</a></p>
                    </Text>
                  </Column>
                </Row>
                <Row index={18}>
                  <Column span="4_4" index={101} last>
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
