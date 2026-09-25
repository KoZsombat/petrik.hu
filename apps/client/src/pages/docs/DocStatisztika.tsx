import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocStatisztika.css'

export default function DocStatisztika() {
  return (
    <DocsLayout slug="statisztika" className="page-docs-statisztika">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p><a href="/media/wp-content/uploads/2021/01/vizsgaeredmenyek-2019-20.pdf">Vizsga eredmények</a><a href="/media/wp-content/uploads/2021/01/hazirend.pdf"><br /></a><a href="/media/wp-content/uploads/2021/01/osztaly-adatok.pdf">Osztály létszám adatok<br /></a><a href="/media/wp-content/uploads/2021/01/lemorzsolodas-aranya.pdf">Lemorzsolodási adadtok</a></p>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
