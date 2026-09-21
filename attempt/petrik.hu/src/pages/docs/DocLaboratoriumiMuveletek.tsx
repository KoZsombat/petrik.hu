import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocLaboratoriumiMuveletek.css'

export default function DocLaboratoriumiMuveletek() {
  return (
    <DocsLayout slug="laboratoriumi-muveletek" className="page-docs-laboratoriumi-muveletek">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <a href="/media/wp-content/uploads/2020/09/labormuv_1.pdf">Laboratóriumi műveletek I.</a>
              {' '}
              <p><a href="/media/wp-content/uploads/2020/09/labormuv_2.pdf">Laboratóriumi műveletek II.</a></p>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
