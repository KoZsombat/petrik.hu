import { createElement } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { isFileHref } from '../../../../../shared/pnw/rich-content.ts'
import type { RichElement, RichNode } from '../../../../../shared/pnw/rich-content.ts'
import { isSafeHref } from '../../../../../shared/pnw/richtext.ts'

/**
 * A content tree (shared/pnw/rich-content.ts) as real JSX - the Szerkesztő's
 * text, element for element. Never `dangerouslySetInnerHTML`: the tags are a
 * whitelist the server enforces, and the only attributes are `href` (checked
 * with `isSafeHref` again here) and a whitelisted `style`.
 *
 * Links are made the way the generator always made them, from the target
 * alone: an http(s) URL is an anchor that opens in a new tab; a file under
 * /media/, a mailto: or a tel: is a plain anchor; any other root-relative path
 * is a router link.
 */
function renderElement(node: RichElement, key: number): ReactNode {
  const children = node.children?.map(renderNode)

  if (node.tag === 'br') return <br key={key} />

  if (node.tag === 'a') {
    const href = node.href
    if (!href || !isSafeHref(href)) return <span key={key}>{children}</span>
    if (/^https?:\/\//i.test(href)) {
      return (
        <a key={key} href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      )
    }
    if (isFileHref(href)) {
      return (
        <a key={key} href={href}>
          {children}
        </a>
      )
    }
    return (
      <Link key={key} to={href}>
        {children}
      </Link>
    )
  }

  return createElement(node.tag, { key, style: node.style }, children)
}

function renderNode(node: RichNode, key: number): ReactNode {
  return typeof node === 'string' ? node : renderElement(node, key)
}

export default function RichContent({ nodes }: { nodes: RichNode[] | undefined }) {
  return <>{nodes?.map(renderNode)}</>
}
