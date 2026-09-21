import { Outlet } from 'react-router-dom'
import Footer from './Footer.tsx'
import Header from './Header.tsx'
import ScrollToTop from './ScrollToTop.tsx'
import TopBar from './TopBar.tsx'
import { useDocumentHead } from '../lib/useDocumentHead.ts'
import './Layout.css'

/**
 * The chrome every page shares: the green utility bar, the fixed header, the
 * page body and the footer.
 *
 * Every route in App.tsx sits under this element, so the per-route <title>
 * belongs here rather than in each of the 53 page components - the generated
 * ones could not carry it anyway.
 */
export default function Layout() {
  useDocumentHead()

  return (
    <div id="page-container">
      <ScrollToTop />
      <TopBar />
      <Header />
      <div id="et-main-area">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
