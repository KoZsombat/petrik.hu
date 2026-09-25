import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocSzervezetiEsMukodesiSzabalyzat.css'

export default function DocSzervezetiEsMukodesiSzabalyzat() {
  return (
    <DocsLayout slug="szervezeti-es-mukodesi-szabalyzat" className="page-docs-szervezeti-es-mukodesi-szabalyzat">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p><a href="/media/wp-content/uploads/2026/02/SZMSZ_hitelsitett_2025_2026.pdf">Szervezeti és Működési Szabályzat</a></p>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
