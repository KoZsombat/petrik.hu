import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './Doc6360.css'

export default function Doc6360() {
  return (
    <DocsLayout slug="6360" className="page-docs-6360">
      <Section index={0}>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <p><a href="/media/wp-content/uploads/2024/10/Tortenelem.pdf">Történelem témakörök</a></p>
            </Text>
            <Text index={1} align="left">
              <p><a href="/media/wp-content/uploads/2025/09/Nemet_nyelv_temakorok_2025_osz.pdf">Német nyelv</a></p>
            </Text>
          </Column>
        </Row>
        <Row index={1}>
          <Column span="4_4" index={1} last>
            <Text index={2} align="left">
              <p><a href="/media/wp-content/uploads/2024/10/Angol_nyelv.pdf">Angol nyelv témakörök</a></p>
              {' '}
            </Text>
            <Text index={3} align="left">
              <p><a href="/media/wp-content/uploads/2025/09/Celnyelvi_civilizacio_temakorok_2025_osz.pdf">Angol célnyelvi civilizáció</a></p>
            </Text>
            <Text index={4} align="left">
              <p><a href="/media/wp-content/uploads/2024/10/Digitalis_kultura.pdf">Digitális kultúra témakörök</a></p>
              {' '}
            </Text>
            <Text index={5} align="left">
              <p><a href="/media/wp-content/uploads/2024/10/Magyar_nyelv_irodalom.pdf">Magyar nyelv és irodalom témakörök</a></p>
              {' '}
            </Text>
            <Text index={6} align="left">
              <p><a href="/media/wp-content/uploads/2024/10/Foldrajz-temakorok_2024.pdf">Földrajz témakörök</a></p>
              {' '}
            </Text>
            <Text index={7} align="left">
              <p><a href="/media/wp-content/uploads/2025/09/Fizika_temakorok_2025_osz.pdf">Fizika</a></p>
            </Text>
            <Text index={8} align="left">
              <p><a href="/media/wp-content/uploads/2025/09/Matematika_temakorok_2025_osz.pdf">Matematika</a></p>
            </Text>
          </Column>
        </Row>
      </Section>
      <Section index={1} />
    </DocsLayout>
  )
}
