import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Image from '../../components/divi/Image.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocHazirend.css'

export default function DocHazirend() {
  return (
    <DocsLayout slug="hazirend" className="page-docs-hazirend">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p><a href="/media/wp-content/uploads/2026/02/Hazirend_hitelesiett_2025_2026-1.pdf">Házirend 2025/26</a></p>
            </Text>
          </Column>
        </Row>
      </Section>
      <Section index={1}>
        <Row index={1}>
          <Column span="4_4" index={1} last>
            <Image src="/media/wp-content/uploads/2023/10/underwater-ruin-7568606_1280.jpg" width={921} height={1280} srcSet="/media/wp-content/uploads/2023/10/underwater-ruin-7568606_1280.jpg 921w, /media/wp-content/uploads/2023/10/underwater-ruin-7568606_1280-480x667.jpg 480w" sizes="(min-width: 0px) and (max-width: 480px) 480px, (min-width: 481px) 921px, 100vw" href="https://docs.google.com/forms/d/e/1FAIpQLSf-5RxmFSsy28I8ES2Sr76RhdENeq2P285Dz48_w_MKWAe3Tw/viewform" index={0} />
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
