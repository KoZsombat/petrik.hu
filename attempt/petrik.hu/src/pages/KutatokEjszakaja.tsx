import PostHeader from '../components/PostHeader.tsx'
import SharedCounts from '../components/SharedCounts.tsx'
import Sidebar from '../components/Sidebar.tsx'
import { useBodyClass } from '../lib/useBodyClass.ts'
import Column from '../components/divi/Column.tsx'
import Row from '../components/divi/Row.tsx'
import Section from '../components/divi/Section.tsx'
import Divider from '../components/divi/Divider.tsx'
import Image from '../components/divi/Image.tsx'
import Text from '../components/divi/Text.tsx'
import './KutatokEjszakaja.css'

export default function KutatokEjszakaja() {
  // The theme keys layout on these; see useBodyClass.
  useBodyClass(["wp-singular", "post-template-default", "single", "single-post", "postid-8452", "single-format-standard", "wp-theme-Divi", "et_button_left", "et_pb_button_helper_class", "et_transparent_nav", "et_fullwidth_secondary_nav", "et_fixed_nav", "et_show_nav", "et_pb_show_title", "et_secondary_nav_enabled", "et_secondary_nav_two_panels", "et_primary_nav_dropdown_animation_fade", "et_secondary_nav_dropdown_animation_fade", "et_header_style_left", "et_pb_footer_columns_1_4__1_2", "et_cover_background", "et_pb_gutter", "et_pb_gutters3", "et_pb_pagebuilder_layout", "et_smooth_scroll", "et_right_sidebar"])
  return (
    <div id="main-content" className="page-kutatok-ejszakaja-a-petrikben">
      <div className="container">
        <div id="content-area" className="clearfix">
          <div id="left-area">
            <article id="post-8452" className="et_pb_post post-8452 post type-post status-publish format-standard hentry category-hirek category-kiemelt-hirek">
              <PostHeader slug="kutatok-ejszakaja-a-petrikben" date="2026. szept 15." />
              <div className="entry-content">
                <div className="et-l et-l--post">
                  <div className="et_builder_inner_content et_pb_gutters3">
                    <Section index={0}>
                      <Row index={0}>
                        <Column span="1_2" index={0}>
                          <Image src="/media/wp-content/uploads/2026/09/Kutatok-ejszakaja-plakat-Instagram-bejegyzes-45.png" width={1080} height={1350} srcSet="/media/wp-content/uploads/2026/09/Kutatok-ejszakaja-plakat-Instagram-bejegyzes-45.png 1080w, /media/wp-content/uploads/2026/09/Kutatok-ejszakaja-plakat-Instagram-bejegyzes-45-980x1225.png 980w, /media/wp-content/uploads/2026/09/Kutatok-ejszakaja-plakat-Instagram-bejegyzes-45-480x600.png 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) and (max-width: 980px) 980px, (min-width: 981px) 1080px, 100vw" index={0} />
                        </Column>
                        <Column span="1_2" index={1} last>
                          <Text index={0} align="left">
                            <p>Kedves Érdeklődők!</p>
                          </Text>
                          <Divider index={0} />
                          <Text index={1} align="left">
                            <div>{' '}{' '}</div>
                          </Text>
                          <Text index={2} align="left">
                            <blockquote>{' '}{' '}Iskolánk több éve csatlakozik a Kutatók éjszakája programhoz.&nbsp;{' '}Idén a plakáton látható programokkal készültünk.&nbsp;{' '}Várunk szeretettel minden érdeklődőt.&nbsp;{' '}A programról bővebb információk, ill. regisztráció, a Kutatók éjszakája hivatalos felületén:&nbsp;{' '}{' '}<a href="https://app.kutatokejszakaja.hu/intezmenyek/bmszc-petrik-lajos-ket-tanitasi-nyelvu-technikum" target="_blank" rel="noreferrer">https://app.kutatokejszakaja.hu/intezmenyek/bmszc-petrik-lajos-ket-tanitasi-nyelvu-technikum</a>{' '}{' '}</blockquote>
                          </Text>
                        </Column>
                      </Row>
                    </Section>
                  </div>
                </div>
                <SharedCounts />
              </div>
              {/* The mirror emits a second, empty meta wrapper here. */}
              <div className="et_post_meta_wrapper" />
            </article>
          </div>
          <Sidebar />
        </div>
      </div>
    </div>
  )
}
