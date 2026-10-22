import type { MouseEvent, ReactNode } from 'react'
import './Blurb.css'

type Props = {
  /** The body text of the blurb. */
  children?: ReactNode
  title?: string
  /** A link wrapping the title, if the module has one. */
  titleHref?: string
  /** A link wrapping the icon or image; Divi then makes the whole blurb clickable. */
  iconHref?: string
  /** Image shown beside or above the text. */
  image?: { src: string; alt?: string; width?: number; height?: number }
  /** Divi's icon-font glyph, when the blurb uses an icon instead of an image. */
  icon?: string
  position?: 'top' | 'left' | 'right'
  align?: 'left' | 'center' | 'right' | 'justified'
  index: number
  className?: string
}

/**
 * Divi's blurb module: an icon or image with a heading and a short description.
 */
export default function Blurb({
  children,
  title,
  titleHref,
  iconHref,
  image,
  icon,
  position = 'top',
  align = 'left',
  index,
  className,
}: Props) {
  const classes = [
    'et_pb_module',
    'et_pb_blurb',
    `et_pb_blurb_${index}`,
    `et_pb_text_align_${align}`,
    `et_pb_blurb_position_${position}`,
    'et_pb_bg_layout_light',
  ]
  if (className) classes.push(className)
  if (iconHref) classes.push('et_clickable')

  const visual = image ? (
    <span className="et_pb_image_wrap">
      <img
        src={image.src}
        alt={image.alt ?? ''}
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
      />
    </span>
  ) : (
    <span className="et_pb_image_wrap">
      <span className="et-pb-icon">{icon}</span>
    </span>
  )

  // Divi's script made a blurb with an icon link clickable as a whole.
  const openWhole = (event: MouseEvent<HTMLDivElement>) => {
    if (iconHref && !(event.target as HTMLElement).closest('a')) window.open(iconHref, '_blank', 'noopener')
  }

  return (
    <div className={classes.join(' ')} onClick={iconHref ? openWhole : undefined}>
      <div className="et_pb_blurb_content">
        {(image || icon) && (
          <div className="et_pb_main_blurb_image">
            {iconHref ? <a href={iconHref} target="_blank" rel="noopener noreferrer">{visual}</a> : visual}
          </div>
        )}
        <div className="et_pb_blurb_container">
          {/* Divi puts the heading inside the description block, not beside it. */}
          {(title || children) && (
            <div className="et_pb_blurb_description">
              {title && (
                <h4 className="et_pb_module_header">
                  {titleHref ? <a href={titleHref}>{title}</a> : title}
                </h4>
              )}
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
