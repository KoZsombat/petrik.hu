import DocsLayout from '../../components/docs/DocsLayout.tsx'
import Column from '../../components/divi/Column.tsx'
import Row from '../../components/divi/Row.tsx'
import Section from '../../components/divi/Section.tsx'
import Text from '../../components/divi/Text.tsx'
import './DocVegyipariMuveletek.css'

export default function DocVegyipariMuveletek() {
  return (
    <DocsLayout slug="vegyipari-muveletek" className="page-docs-vegyipari-muveletek">
      <Section index={0} dividerTop>
        <Row index={0}>
          <Column span="4_4" index={0} last>
            <Text index={0} align="left">
              <a href="/media/wp-content/uploads/2020/09/vegyipari_muveletek_1.pdf">Vegyipari műveletek I</a>
              <br />
              {' '}
              <a href="/media/wp-content/uploads/2020/09/vegyipari_muveletek_2.pdf">Vegyipari műveletek II</a>
              <br />
              {' '}
              <a href="/media/wp-content/uploads/2020/09/vegyipari_muveletek_3.pdf">Vegyipari műveletek III</a>
              <br />
              {' '}
              <a href="/media/wp-content/uploads/2020/09/vegyipari-muveleti-gyakorlatok_14.pdf">Vegyipari műveleti gyakorlatok 14</a>
            </Text>
          </Column>
        </Row>
      </Section>
    </DocsLayout>
  )
}
