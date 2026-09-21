import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocMuszakiIsmeretek.css'

export default function DocMuszakiIsmeretek() {
  return (
    <DocsLayout slug="muszaki-ismeretek" className="page-docs-muszaki-ismeretek">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <a href="/media/wp-content/uploads/2020/09/muszismeret_1.pdf">Műszaki ismeret I</a>
              <br />
              {' '}
              <a href="/media/wp-content/uploads/2020/09/muszismeret_2.pdf">Műszaki ismeret II</a>
              <br />
              {' '}
              <a href="/media/wp-content/uploads/2020/09/muszisme_feladat_12a_januar_7.pdf">Műszaki ismeretek &#8211; Projekt feladat</a>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
