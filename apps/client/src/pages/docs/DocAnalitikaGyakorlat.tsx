import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocAnalitikaGyakorlat.css'

export default function DocAnalitikaGyakorlat() {
  return (
    <DocsLayout slug="analitika-gyakorlat" className="page-docs-analitika-gyakorlat">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p><a href="/media/wp-content/uploads/2020/11/recept_gyujtemeny_az_analitika_gyakorlat_szamara.pdf">Recept gyűjtemény az analitika gyakorlat számára</a></p>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
