import { Fragment } from 'react'
import { socialLinks } from '../data/site.ts'
import './SocialIcons.css'

/**
 * The Facebook / Instagram pair that appears in the top bar and again in the
 * footer bar. Divi renders the glyphs from its ETmodules icon font via ::before,
 * which is why the anchor carries the network as a class and the label is
 * visually hidden.
 */
export default function SocialIcons() {
  return (
    <ul className="et-social-icons">
      {/* Inline-block items; see the note in Header.tsx about the whitespace
          the original markup relies on for spacing. */}
      {socialLinks.map((link, index) => (
        <Fragment key={link.network}>
          {index > 0 && ' '}
          <li className={`et-social-icon et-social-${link.network}`}>
            <a href={link.href} className="icon" target="_blank" rel="noreferrer">
              <span>{link.label}</span>
            </a>
          </li>
        </Fragment>
      ))}
    </ul>
  )
}
