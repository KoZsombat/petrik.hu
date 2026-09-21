import { Link } from 'react-router-dom'
import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Blurb from '../components/divi/Blurb.tsx'
import Image from '../components/divi/Image.tsx'
import PostFeed from '../components/divi/PostFeed.tsx'
import Text from '../components/divi/Text.tsx'
import './Projekt.css'

export default function Projekt() {
  return (
    <div id="main-content" className="page-projekt">
      <article className="post-1516 page type-page status-publish hentry">
        <div className="entry-content">
          <div className="et-l et-l--post">
            <div className="et_builder_inner_content et_pb_gutters3">
              <Section index={0} first withBackground>
                <Row index={0}>
                  <Column span="4_4" index={0} last>
                    <Text index={0} align="left" bgLayout="dark">
                      <h1><span style={{ color: "#72c3b6" }}>Erasmus+ projektek</span></h1>
                    </Text>
                    <Text index={1} align="left" bgLayout="dark">
                      <p>Nyelvtanulás, Kúltúra, Szakmai fejlődés, Barátok és Életre szóló élmények</p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={1}>
                <Row index={1}>
                  <Column span="1_2" index={1}>
                    <Text index={2} align="left">
                      Az Erasmus+ projektek azért jók, mert
                    </Text>
                    <Blurb index={0} align="left" position="left" title="külföldi utazáson vehetsz részt bennük," icon="Z" />
                    <Blurb index={1} align="left" position="left" title="megismerhetsz más kultúrákat, tájakat, embereket," icon="Z" />
                    <Blurb index={2} align="left" position="left" title="életre szóló barátságokat köthetsz," icon="Z" />
                    <Blurb index={3} align="left" position="left" title="izgalmas iskolai programokon vehetsz részt," icon="Z" />
                    <Blurb index={4} align="left" position="left" title="gyakorolhatod az angol nyelvet, így fejlesztve nyelvtudásod," icon="Z" />
                    <Blurb index={5} align="left" position="left" title="olyan témákkal foglalkozhatsz, amelyek nem kerülnek elő tanórákon," icon="Z" />
                    <Blurb index={6} align="left" position="left" title="fejlesztheted a kreativitásod," icon="Z" />
                    <Blurb index={7} align="left" position="left" title="növelheted az önbizalmad, az önállóságodat." icon="Z" />
                  </Column>
                  <Column span="1_2" index={2} last>
                    <Image src="/media/wp-content/uploads/2020/10/projekt-miert-scaled.jpg" width={2048} height={2560} srcSet="/media/wp-content/uploads/2020/10/projekt-miert-scaled.jpg 2048w, /media/wp-content/uploads/2020/10/projekt-miert-1280x1600.jpg 1280w, /media/wp-content/uploads/2020/10/projekt-miert-980x1225.jpg 980w, /media/wp-content/uploads/2020/10/projekt-miert-480x600.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 2048px, 100vw" index={0} />
                  </Column>
                </Row>
                <Row index={2}>
                  <Column span="4_4" index={3} last>
                    <Text index={3} align="left">
                      <p>Iskolánk Erasmus+ Akkreditációval rendelkezik a szakképzés területén.</p>
                      {' '}
                      <p>Emellett rendszeresen részt veszünk köznevelési projektekben is.</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={3}>
                  <Column span="4_4" index={4} last>
                    <Text index={4} align="left">
                      <p>Az Erasmus+ projektekkel kapcsolatos bővebb információ:&nbsp;<a href="https://petrik-erasmus.webnode.hu/" target="_blank" rel="noreferrer">https://petrik-erasmus.webnode.hu/</a></p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={2} dividerTop dividerBottom>
                <Row index={4}>
                  <Column span="4_4" index={5} last>
                    <Text index={5} align="left">
                      <p>A projektekhez kapcsolódó hírek</p>
                    </Text>
                    <PostFeed
                      index={0}
                      columns={3}
                      align="left"
                      className="et_pb_with_border"
                      hasOlder
                      items={[
                      { slug: "kodok-szuperhosok-es-urutazas-jon-az-idei-kodolas-hete-a-petrikben", date: "2026 szept 09" },
                      { slug: "ujabb-orszagos-elismeres-a-dthpetrik-nek-innovativ-projekt-dijat-nyert-a-petrik-motion-pictures", date: "2026 jún 16" },
                      { slug: "europai-elismerest-nyert-a-lunaverzum-projekt", date: "2026 jún 04" },
                      { slug: "elmenybeszamolo-a-iii-civil-reggelirol-egyutt-ero-studio", date: "2026 ápr 19" },
                      { slug: "petrik-motion-pictures-a-zaronap-amikor-minden-eletre-kelt", date: "2026 ápr 03" },
                      { slug: "petrik-motion-pictures-lenduletben-a-digitalis-temahet", date: "2026 márc 27" },
                      ]}
                    />
                  </Column>
                </Row>
              </Section>
              <Section index={3} dividerTop dividerBottom>
                <Row index={5}>
                  <Column span="4_4" index={6} last>
                    <Text index={6} align="left">
                      Szakmai partnerek
                    </Text>
                  </Column>
                </Row>
                <Row index={6}>
                  <Column span="1_4" index={7}>
                    <Image src="/media/wp-content/uploads/2020/10/logo-erasmus-plus.png" width={1758} height={358} srcSet="/media/wp-content/uploads/2020/10/logo-erasmus-plus.png 1758w, /media/wp-content/uploads/2020/10/logo-erasmus-plus-1280x261.png 1280w, /media/wp-content/uploads/2020/10/logo-erasmus-plus-980x200.png 980w, /media/wp-content/uploads/2020/10/logo-erasmus-plus-480x98.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) and (max-width: 1280px) 1280px, (min-width: 1281px) 1758px, 100vw" loading="lazy" href="https://ec.europa.eu/programmes/erasmus-plus/about_hu" index={1} />
                  </Column>
                  <Column span="1_4" index={8}>
                    <Image src="/media/wp-content/uploads/2023/10/shark-6942486_1280.png" width={1280} height={857} srcSet="/media/wp-content/uploads/2023/10/shark-6942486_1280.png 1280w, /media/wp-content/uploads/2023/10/shark-6942486_1280-980x656.png 980w, /media/wp-content/uploads/2023/10/shark-6942486_1280-480x321.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) 1280px, 100vw" loading="lazy" href="https://forms.gle/SqJxy8gnj7maz4Q27" index={2} />
                  </Column>
                  <Column span="1_4" index={9}>
                    <Image src="/media/wp-content/uploads/2020/10/tempus_kozalapitvany.png" width={123} height={73} srcSet="/media/wp-content/uploads/2020/10/tempus_kozalapitvany.png 123w, /media/wp-content/uploads/2020/10/tempus_kozalapitvany-20x12.png 20w" sizes="(max-width: 123px) 100vw, 123px" loading="lazy" href="https://tka.hu/" index={3} />
                  </Column>
                  <Column span="1_4" index={10} last />
                </Row>
              </Section>
              <Section index={4} withBackground>
                <Row index={7}>
                  <Column span="4_4" index={11} last>
                    <Text index={7} align="left">
                      <p>Korábbi projekteink</p>
                    </Text>
                  </Column>
                </Row>
                <Row index={8}>
                  <Column span="1_3" index={12}>
                    <Text index={8} align="center">
                      <p><strong>2020-2022</strong><a href="https://our-common-european-tale.webnode.hu/%20és https://www.facebook.com/OurCommonEuropeanTale" target="_blank" rel="noreferrer"></a></p>
                      {' '}
                      <p>EurDigiCultHer</p>
                      {' '}
                      <p><Link to="//www.facebook.com/Training-for-Life-Leadership-Initiative-for-Europe-comenius-Project-259066730935222/"></Link><a href="https://www.facebook.com/Training-for-Life-Leadership-Initiative-for-Europe-comenius-Project-259066730935222/" target="_blank" rel="noreferrer"></a></p>
                    </Text>
                  </Column>
                  <Column span="1_3" index={13}>
                    <Text index={9} align="center">
                      <p><strong>2019-2022</strong><a href="https://our-common-european-tale.webnode.hu/%20és https://www.facebook.com/OurCommonEuropeanTale" target="_blank" rel="noreferrer"></a></p>
                      {' '}
                      <p>Off the Beaten Path</p>
                      {' '}
                      <p><em>További információ:<br /></em><a href="https://off-the-beaten-path0.webnode.hu/" target="_blank" rel="noreferrer">Honlap</a>,&nbsp;<a href="https://www.facebook.com/Erasmus-Off-the-Beaten-Path-102653107887638" target="_blank" rel="noreferrer">Facebook</a>,&nbsp;<a href="https://twinspace.etwinning.net/104637/home" target="_blank" rel="noreferrer">eTwinning</a>,&nbsp;<a href="https://twinspace.etwinning.net/104637/home" target="_blank" rel="noreferrer"></a><a href="https://www.instagram.com/offthebeatenpatherasmus/" target="_blank" rel="noreferrer">Instagram</a>&nbsp;</p>
                    </Text>
                  </Column>
                  <Column span="1_3" index={14} last>
                    <Text index={10} align="center">
                      <p><strong>2019-2021</strong></p>
                      {' '}
                      <p>Trainning for All</p>
                      {' '}
                      <p><em>További információ:<br /></em><a href="https://www.facebook.com/Erasmus-Training-for-All-106575467584508" target="_blank" rel="noreferrer">Facebook</a></p>
                    </Text>
                  </Column>
                </Row>
                <Row index={9}>
                  <Column span="1_3" index={15}>
                    <Text index={11} align="center">
                      <p><strong>2017-2019</strong><a href="https://our-common-european-tale.webnode.hu/%20és https://www.facebook.com/OurCommonEuropeanTale" target="_blank" rel="noreferrer"></a></p>
                      {' '}
                      <p>Our Common European Tale<br /><a href="https://our-common-european-tale.webnode.hu/" target="_blank" rel="noreferrer">https://our-common-european-tale.webnode.hu/</a> és <a href="https://www.facebook.com/OurCommonEuropeanTale" target="_blank" rel="noreferrer">https://www.facebook.com/OurCommonEuropeanTale</a></p>
                      {' '}
                      <p>&nbsp;</p>
                    </Text>
                  </Column>
                  <Column span="1_3" index={16}>
                    <Text index={12} align="center">
                      <p><strong>2015-2017</strong></p>
                      {' '}
                      <p>Math Around Us<br /><a href="https://twinspace.etwinning.net/9782/home" target="_blank" rel="noreferrer"> https://twinspace.etwinning.net/9782/home</a> és <a href="https://www.facebook.com/MathAroundUs/" target="_blank" rel="noreferrer"> https://www.facebook.com/MathAroundUs/</a></p>
                    </Text>
                  </Column>
                  <Column span="1_3" index={17} last>
                    <Text index={13} align="center">
                      <p><strong>2013-2015</strong><a href="https://our-common-european-tale.webnode.hu/%20és https://www.facebook.com/OurCommonEuropeanTale" target="_blank" rel="noreferrer"></a></p>
                      {' '}
                      <p>Training for LIFE: Leadership Initiative for Europe<br /><Link to="//www.facebook.com/Training-for-Life-Leadership-Initiative-for-Europe-comenius-Project-259066730935222/">https://www.facebook.com/Training-for-Life-Leadership-Initiative-for-Europe-comenius-Project-259066730935222/</Link><a href="https://www.facebook.com/Training-for-Life-Leadership-Initiative-for-Europe-comenius-Project-259066730935222/" target="_blank" rel="noreferrer"></a><a href="https://www.facebook.com/Training-for-Life-Leadership-Initiative-for-Europe-comenius-Project-259066730935222/" target="_blank" rel="noreferrer"></a></p>
                    </Text>
                  </Column>
                </Row>
              </Section>
              <Section index={5}>
                <Row index={10}>
                  <Column span="4_4" index={18} last>
                    <Text index={14} align="left">
                      <h1><strong>A projektek koordinátorának elérhetőség</strong></h1>
                    </Text>
                    <Blurb index={8} align="left" position="left" icon="">
                      <p>Szolnok Ádám</p>
                    </Blurb>
                    <Blurb index={9} align="left" position="left" icon="">
                      A.113 tanári
                    </Blurb>
                    <Blurb index={10} align="left" position="left" icon="">
                      <a href="mailto:szolnok@petrik.hu">szolnok@petrik.hu</a>
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
