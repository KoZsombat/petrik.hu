import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocNemzetkoziesitesiStrategia.css'

export default function DocNemzetkoziesitesiStrategia() {
  return (
    <DocsLayout slug="nemzetkoziesitesi-strategia" className="page-docs-nemzetkoziesitesi-strategia">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p><a href="/media/wp-content/uploads/2023/09/nemzetkoziesitesi_strategia_-_2023-09-06.pdf">Nemzetköziesítési stratégia</a></p>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
