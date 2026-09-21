import './SocialFollow.css'

export type SocialNetwork = {
  /** Divi's network slug, e.g. "facebook"; it selects the icon glyph. */
  network: string
  href: string
  /** Tooltip text, as the original rendered it. */
  title: string
  /** Label inside the link; Divi hides it visually but keeps it in the markup. */
  label: string
}

type Props = {
  networks: SocialNetwork[]
  index: number
  align?: 'left' | 'center' | 'right'
}

/**
 * Divi's "social media follow" module: a row of icon links.
 *
 * Some instances in the mirror have no networks configured at all; those render
 * nothing rather than an empty list.
 */
export default function SocialFollow({ networks, index, align = 'left' }: Props) {
  if (!networks.length) return null

  return (
    <ul
      className={`et_pb_module et_pb_social_media_follow et_pb_social_media_follow_${index} clearfix et_pb_text_align_${align} et_pb_bg_layout_light`}
    >
      {networks.map((item, position) => (
        <li
          key={item.network}
          className={`et_pb_social_media_follow_network_${position} et_pb_social_icon et_pb_social_network_link et-social-${item.network}`}
        >
          <a
            href={item.href}
            className="icon et_pb_with_border"
            title={item.title}
            target="_blank"
            rel="noreferrer"
          >
            <span className="et_pb_social_media_follow_network_name" aria-hidden="true">
              {item.label}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
