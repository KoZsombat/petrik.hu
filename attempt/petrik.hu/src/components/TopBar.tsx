import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { contact } from '../data/site.ts'
import { useSiteMenu } from '../lib/site/siteContext.ts'
import SocialIcons from './SocialIcons.tsx'
import './TopBar.css'
import { useFixedHeader } from '../lib/useFixedHeader.ts'

/**
 * The fixed green utility bar above the header (Divi's "secondary nav").
 * Hidden below 980px, where its links move into the mobile menu.
 */
export default function TopBar() {
  // The theme recolours the bar in the fixed state; see useFixedHeader.
  const fixed = useFixedHeader()
  // The Szerkesztő's edited menu when there is one, else src/data/site.ts (AGENT.md 6.19).
  const { secondary: secondaryMenu } = useSiteMenu()
  return (
    <div id="top-header" className={fixed ? 'et-fixed-header' : undefined}>
      <div className="container clearfix">
        <div id="et-info">
          <span id="et-info-phone">{contact.phone}</span>
          <a href={`mailto:${contact.email}`}>
            <span id="et-info-email">{contact.email}</span>
          </a>
          <SocialIcons />
        </div>
        <div id="et-secondary-menu">
          <ul id="et-secondary-nav" className="menu">
            {/* Inline-block items; see the note in Header.tsx about the
                whitespace the original markup relies on for spacing. */}
            {secondaryMenu.map((item, index) => (
              <Fragment key={`${item.label}-${index}`}>
                {index > 0 && ' '}
                <li className="menu-item">
                  {item.to ? (
                    <Link to={item.to}>{item.label}</Link>
                  ) : (
                    <a href={item.href} target="_blank" rel="noreferrer">
                      {item.label}
                    </a>
                  )}
                </li>
              </Fragment>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
