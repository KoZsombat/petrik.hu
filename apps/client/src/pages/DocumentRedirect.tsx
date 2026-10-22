import { Navigate, useParams } from 'react-router-dom'

/** `/dokumentumtar/<doc>/` -> `/docs/<doc>/`, as the original redirected it. */
export default function DocumentRedirect() {
  const { slug = '' } = useParams<{ slug: string }>()
  return <Navigate to={`/docs/${slug}/`} replace />
}
