import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocDualisKepzesTajekoztato.css'

export default function DocDualisKepzesTajekoztato() {
  return (
    <DocsLayout slug="dualis-kepzes-tajekoztato" className="page-docs-dualis-kepzes-tajekoztato">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p><a href="/media/wp-content/uploads/2023/10/Dualis-kepzesrol-szolo-tajekoztato.pdf">Duális képzés tájékoztató</a></p>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
