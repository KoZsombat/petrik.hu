import { useMemo } from 'react'
import type { DocLibrary, LibraryCategory } from '../../../../../shared/pnw/page-types.ts'
import { docCategories, docs } from '../../data/docs.ts'
import { useSiteContent } from './siteContext.ts'

/** The bundled index (src/data/docs.ts) in the Dokumentumtár's own shape - also the editor's starting point. */
export function staticLibrary(): DocLibrary {
  return {
    categories: docCategories.map((category) => ({
      slug: category.slug,
      title: category.title,
      docs: category.docs.map((slug) => ({ slug, title: docs[slug]?.title ?? slug })),
    })),
  }
}

/** Where a listing sends the reader: the uploaded file itself, or the mirrored /docs/ page. */
export function docHref(doc: { slug: string; file?: string }): string {
  return doc.file ?? `/docs/${doc.slug}/`
}

/**
 * The categories every listing of the Dokumentumtár shows: the edited library
 * when the Szerkesztő saved one, otherwise the bundled index.
 */
export function useDocCategories(): LibraryCategory[] {
  const { library } = useSiteContent()
  return useMemo(() => (library ?? staticLibrary()).categories, [library])
}
