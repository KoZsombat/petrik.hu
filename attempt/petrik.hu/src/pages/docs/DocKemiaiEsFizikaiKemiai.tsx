import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocKemiaiEsFizikaiKemiai.css'

export default function DocKemiaiEsFizikaiKemiai() {
  return (
    <DocsLayout slug="kemiai-es-fizikai-kemiai" className="page-docs-kemiai-es-fizikai-kemiai">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p><a href="/media/wp-content/uploads/2020/11/Kemiai-es-Fizikai-Kemiai-Vizsgafeladatok-es-Peldatar.pdf.pdf">Kémiai és Fizikai Kémiai &#8211; Vizsgafeladatok és Példatár</a></p>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
