import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocTagintezmenyVezetoiPalyazatok.css'

export default function DocTagintezmenyVezetoiPalyazatok() {
  return (
    <DocsLayout slug="tagintezmeny-vezetoi-palyazatok" className="page-docs-tagintezmeny-vezetoi-palyazatok">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p>Gál-Berey Csilla<a href="/media/wp-content/uploads/2020/11/geptermi_hazirend_ellenorzo_lista.pdf"></a></p>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
