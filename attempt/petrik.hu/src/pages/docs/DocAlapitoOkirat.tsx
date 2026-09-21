import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocAlapitoOkirat.css'

export default function DocAlapitoOkirat() {
  return (
    <DocsLayout slug="alapito-okirat" className="page-docs-alapito-okirat">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p><a href="/media/wp-content/uploads/2022/08/Alapito_okirat_2022_07_29_BMSZC.pdf">Alapito_okirat_2022_07_29_BMSZC</a></p>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
