import type { ReactNode } from 'react'
import './TeamMember.css'

type Props = {
  name: string
  /** Optional body text under the name, used on the contact pages. */
  children?: ReactNode
  /** Divi lets the heading level vary per module; the site uses h4 and h6. */
  headingLevel?: 4 | 6
  /** Job title, shown under the name. */
  position?: string
  /** `loading` comes from the mirror; see the note in Image.tsx. */
  image?: {
    src: string
    alt?: string
    width?: number
    height?: number
    srcSet?: string
    sizes?: string
    loading?: 'lazy' | 'eager'
  }
  align?: 'left' | 'center' | 'right'
  index: number
  className?: string
}

/**
 * Divi's person module, used for the staff listings on /tanari-kar/ and
 * /elerhetoseg/.
 */
export default function TeamMember({
  name,
  children,
  headingLevel = 6,
  position,
  image,
  align = 'center',
  index,
  className,
}: Props) {
  const Heading = `h${headingLevel}` as 'h4' | 'h6'
  const classes = [
    'et_pb_module',
    'et_pb_team_member',
    `et_pb_team_member_${index}`,
    'clearfix',
    `et_pb_text_align_${align}`,
    'et_pb_bg_layout_light',
  ]
  if (!image) classes.push('et_pb_team_member_no_image')
  if (className) classes.push(className)

  return (
    <div className={classes.join(' ')}>
      {image && (
        <div className="et_pb_team_member_image">
          <img
            src={image.src}
            alt={image.alt ?? name}
            width={image.width}
            height={image.height}
            srcSet={image.srcSet}
            sizes={image.sizes}
            loading={image.loading}
            decoding="async"
          />
        </div>
      )}
      <div className="et_pb_team_member_description">
        <Heading className="et_pb_module_header">{name}</Heading>
        {position && <p className="et_pb_member_position">{position}</p>}
        {children && <div>{children}</div>}
      </div>
    </div>
  )
}
