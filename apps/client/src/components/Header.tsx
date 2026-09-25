import { Fragment, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { MenuItem } from '../data/site.ts'
import { useSiteMenu } from '../lib/site/siteContext.ts'
import './Header.css'
import { useFixedHeader } from '../lib/useFixedHeader.ts'

/** Served from public/, so it is a plain URL rather than a bundled import. */
const LOGO_SRC = '/media/wp-content/uploads/2020/08/logo-nagy.png'

/**
 * Renders one menu entry. A parent without a target is not a link in the
 * original either — Divi emits href="#" there, which we drop.
 */
function MenuEntry({ item, current }: { item: MenuItem; current: string }) {
  const isCurrent = item.to === current
  const hasCurrentChild = item.children?.some((child) => child.to === current) ?? false

  const classes = ['menu-item']
  if (item.children) classes.push('menu-item-has-children')
  if (isCurrent) classes.push('current-menu-item')
  if (hasCurrentChild) classes.push('current-menu-ancestor')

  return (
    <li className={classes.join(' ')}>
      {item.to ? (
        <Link to={item.to} aria-current={isCurrent ? 'page' : undefined}>
          {item.label}
        </Link>
      ) : item.href ? (
        <a href={item.href} target="_blank" rel="noreferrer">
          {item.label}
        </a>
      ) : (
        /*
         * An <a> with no href, for a dropdown parent that is not itself a
         * page. The original wrote `<a href="#">`, which would jump to the top
         * of the page; leaving the href off is inert instead. It has to stay
         * an <a> though - the theme hangs the menu's padding and its dropdown
         * arrow off `a` selectors, and a <span> here left these five items at
         * full height while the rest of the header shrank on scroll.
         */
        <a className="menu-parent">{item.label}</a>
      )}
      {item.children && (
        <ul className="sub-menu">
          {item.children.map((child, index) => (
            <MenuEntry key={`${child.label}-${index}`} item={child} current={current} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function Header() {
  // Divi shrank the header on scroll from JavaScript; see useFixedHeader.
  const fixed = useFixedHeader()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  // The Szerkesztő's edited menu when there is one, else src/data/site.ts (AGENT.md 6.19).
  const { primary: primaryMenu } = useSiteMenu()

  return (
    <header id="main-header" className={fixed ? 'et-fixed-header' : undefined}>
      <div className="container clearfix et_menu_container">
        <div className="logo_container">
          {/* The helper span and the logo link are inline, so the whitespace
              between them in the original markup is a real 3.6px gap. */}
          <span className="logo_helper" />{' '}
          <Link to="/">
            <img src={LOGO_SRC} width={1920} height={500} alt="petrik.hu" id="logo" />
          </Link>
        </div>
        <div id="et-top-navigation">
          <nav id="top-menu-nav">
            <ul id="top-menu" className="nav">
              {/* The menu items are inline-block, so the whitespace between the
                  <li> tags in the original markup renders as a real ~3.6px gap.
                  React emits no whitespace between mapped children, so it has
                  to be written out to keep the spacing identical. */}
              {primaryMenu.map((item, index) => (
                <Fragment key={`${item.label}-${index}`}>
                  {index > 0 && ' '}
                  <MenuEntry item={item} current={pathname} />
                </Fragment>
              ))}
            </ul>
          </nav>
          <div id="et_top_search">
            <Link to="/kereses/" id="et_search_icon">
              <span className="screen-reader-text">Keresés</span>
            </Link>
          </div>
          <div id="et_mobile_nav_menu">
            <div className={`mobile_nav ${menuOpen ? 'opened' : 'closed'}`}>
              <button
                type="button"
                className="mobile_menu_bar mobile_menu_bar_toggle"
                aria-expanded={menuOpen}
                aria-controls="mobile_menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span className="screen-reader-text">Oldal kiválasztása</span>
              </button>
              {/* Divi closed its jQuery menu on navigation; one delegated
                  handler does the same for every link inside. */}
              <ul
                id="mobile_menu"
                className="et_mobile_menu"
                hidden={!menuOpen}
                onClick={() => setMenuOpen(false)}
              >
                {primaryMenu.map((item, index) => (
                  <MenuEntry key={`${item.label}-${index}`} item={item} current={pathname} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
