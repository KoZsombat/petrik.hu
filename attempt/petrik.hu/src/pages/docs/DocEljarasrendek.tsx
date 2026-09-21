import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocEljarasrendek.css'

export default function DocEljarasrendek() {
  return (
    <DocsLayout slug="eljarasrendek" className="page-docs-eljarasrendek">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p><a href="/media/wp-content/uploads/2023/11/Eljarasrend_tantermi-rend_rongalasok-bejelentese.pdf">Eljárásrend &#8211; Tantermi rend, rongálások bejelentése</a></p>
              {' '}
              <p><a href="/media/wp-content/uploads/2023/11/Eljarasrend_tanulok-kikerese.pdf">Eljárásrend &#8211; Tanulók kikérése</a></p>
              {' '}
              <p><a href="/media/wp-content/uploads/2024/12/Eljarasrend-a-tanulok-bantalmazasi-eseteinek-kivizsgalasara-es-kezelesere_Petrik.pdf">Eljárásrend &#8211; A tanulók bántalmazási eseteinek kivizsgálásáról és kezeléséről</a></p>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
