import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocGeptermiHazirend.css'

export default function DocGeptermiHazirend() {
  return (
    <DocsLayout slug="geptermi-hazirend" className="page-docs-geptermi-hazirend">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p><a href="/media/wp-content/uploads/2020/11/geptermi_hazirend.pdf">Géptermi házirend<br /></a><a href="/media/wp-content/uploads/2020/11/geptermi_hazirend_ellenorzo_lista.pdf">Géptermi házirend ellenőrző lista</a></p>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
