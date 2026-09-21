import RecentPosts from './RecentPosts.tsx'
import SearchWidget from './SearchWidget.tsx'
import './Sidebar.css'

/** Divi's right-hand sidebar: a search box and the recent posts list. */
export default function Sidebar() {
  return (
    <div id="sidebar">
      <SearchWidget />
      <RecentPosts />
    </div>
  )
}
