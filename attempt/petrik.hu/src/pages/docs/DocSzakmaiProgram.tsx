import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocSzakmaiProgram.css'

export default function DocSzakmaiProgram() {
  return (
    <DocsLayout slug="szakmai-program" className="page-docs-szakmai-program">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p><a href="/media/wp-content/uploads/2026/02/SzakmaiProgram_hitelesitett_2025_2026.pdf">Szakmai program 2025-26</a><a href="/media/wp-content/uploads/2021/02/szakmai_program_2020_2021_-_mellekletek.pdf"></a></p>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
