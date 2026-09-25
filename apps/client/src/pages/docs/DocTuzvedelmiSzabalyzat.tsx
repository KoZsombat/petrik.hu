import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocTuzvedelmiSzabalyzat.css'

export default function DocTuzvedelmiSzabalyzat() {
  return (
    <DocsLayout slug="tuzvedelmi-szabalyzat" className="page-docs-tuzvedelmi-szabalyzat">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p><a href="/media/wp-content/uploads/2023/11/TVSZ_Petrik_2023.pdf">Tűzvédelmi szabályzat</a><br /><a href="/media/wp-content/uploads/2023/11/TVSZ-elolap.pdf">Tűzvédelmi szabályzat előlap</a></p>
              {' '}
              <p><a href="/media/wp-content/uploads/2023/11/MVSZ_BMSZC Petrik_2023.pdf">Munkavédelmi szabályzat</a></p>
              {' '}
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
