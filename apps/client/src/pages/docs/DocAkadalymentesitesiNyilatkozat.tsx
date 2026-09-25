import DocsLayout from '../../components/docs/DocsLayout.tsx'
import FileBlock from '../../components/docs/FileBlock.tsx'
import './DocAkadalymentesitesiNyilatkozat.css'

export default function DocAkadalymentesitesiNyilatkozat() {
  return (
    <DocsLayout slug="akadalymentesitesi-nyilatkozat" className="page-docs-akadalymentesitesi-nyilatkozat">
      <FileBlock
        embed="/media/wp-content/uploads/2024/03/Akadalymentesitesi_nyilatkozat_petrik.hu_.pdf"
        href="/media/wp-content/uploads/2024/02/Akadalymentesitesi_nyilatkozat_Petrik.pdf"
        label="Akadálymentesítési_nyilatkozat_Petrik"
        buttonLabel="Letöltés"
        embedLabel="Akadálymentesítési_nyilatkozat_Petrik beágyazása"
      />
    </DocsLayout>
  )
}
