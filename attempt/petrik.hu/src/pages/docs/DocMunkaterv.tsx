import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocMunkaterv.css'

export default function DocMunkaterv() {
  return (
    <DocsLayout slug="munkaterv" className="page-docs-munkaterv">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p><a href="/media/wp-content/uploads/2026/02/Petrik_eves-munkaterv_2025-2026.pdf">Munkaterv 2025-26</a></p>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
