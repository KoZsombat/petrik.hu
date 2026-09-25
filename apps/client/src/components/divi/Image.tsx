import { usePageOverride } from '../../lib/site/usePageOverride.ts'
import './Image.css'

type Props = {
  src: string
  alt?: string
  width?: number
  height?: number
  /** Responsive candidates, exactly as WordPress generated them. */
  srcSet?: string
  sizes?: string
  /** Wraps the image in a link, as Divi does when the module has a URL. */
  href?: string
  /**
   * Carried from the mirror rather than assumed. An image with no width and
   * height has nothing to reserve space with, so lazy-loading one collapses it
   * until it scrolls into view - and WordPress did not lazy-load every image.
   */
  loading?: 'lazy' | 'eager'
  /** Divi numbers image modules per page for its design stylesheet. */
  index: number
  className?: string
}

/** Divi's image module. */
export default function Image({
  src,
  alt = '',
  width,
  height,
  srcSet,
  sizes,
  href,
  loading,
  index,
  className,
}: Props) {
  // A replacement picture from the Szerkesztő (AGENT.md 6.19). Its srcset,
  // sizes and intrinsic size belong to the old file, so they go with it.
  const override = usePageOverride('image', index)
  const replaced = override?.src !== undefined
  if (override) href = override.href ?? href

  const image = (
    <img
      src={replaced ? override.src : src}
      alt={override?.alt ?? alt}
      width={replaced ? undefined : width}
      height={replaced ? undefined : height}
      srcSet={replaced ? undefined : srcSet}
      sizes={replaced ? undefined : sizes}
      loading={loading}
      decoding="async"
    />
  )
  const classes = ['et_pb_module', 'et_pb_image', `et_pb_image_${index}`]
  if (className) classes.push(className)

  return (
    <div className={classes.join(' ')}>
      <span className="et_pb_image_wrap">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer">
            {image}
          </a>
        ) : (
          image
        )}
      </span>
    </div>
  )
}
