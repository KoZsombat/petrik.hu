import './Gallery.css'

export type GalleryItem = {
  src: string
  alt?: string
  width?: number
  height?: number
  srcSet?: string
  sizes?: string
  /** Carried from the mirror; see the note in Image.tsx. */
  loading?: 'lazy' | 'eager'
  /** The full-size file the thumbnail links to. */
  full?: string
}

type Props = {
  items: GalleryItem[]
  index: number
  /** Divi's `data-per_page`: how many thumbnails one page of the grid holds. */
  perPage?: number
}

/**
 * Divi's gallery module in grid layout.
 *
 * The layout is the theme's own, collected from the mirror: the items float,
 * and their width comes from a rule scoped to the column the module sits in
 * (`.et_pb_gutters3 .et_pb_column_1_6 .et_pb_grid_item`), not from anything
 * the module itself says. An earlier version of this component laid the items
 * out on a CSS grid of its own invention, which made the single thumbnail on
 * the home page a quarter of its real width.
 *
 * `display: block` is inline because that is where Divi kept it. The stylesheet
 * hides every item (`.et_pb_gallery_grid .et_pb_gallery_item { display: none }`)
 * and the script showed the ones on the current page - so without it the module
 * collapses to nothing. The port has no pagination: with one page of items
 * every item is on it.
 *
 * The original opened each image in Divi's jQuery lightbox; here the thumbnail
 * is a plain link to the full-size file, which needs no script and still works
 * with the keyboard.
 */
export default function Gallery({ items, index, perPage = 4 }: Props) {
  return (
    <div
      className={`et_pb_module et_pb_gallery et_pb_gallery_${index} et_pb_bg_layout_light et_pb_gallery_grid`}
    >
      <div className="et_pb_gallery_items et_post_gallery clearfix" data-per_page={perPage}>
        {items.map((item, position) => (
          <div
            key={item.src}
            className={`et_pb_gallery_item et_pb_grid_item et_pb_bg_layout_light et_pb_gallery_item_${index}_${position}${
              position % perPage === 0 ? ' first_in_row' : ''
            }`}
            style={{ display: 'block' }}
          >
            <div className="et_pb_gallery_image landscape">
              <a href={item.full ?? item.src} title="" target="_blank" rel="noreferrer">
                <img
                  src={item.src}
                  alt={item.alt ?? ''}
                  width={item.width}
                  height={item.height}
                  srcSet={item.srcSet}
                  sizes={item.sizes}
                  loading={item.loading}
                  decoding="async"
                />
                <span className="et_overlay" />
              </a>
            </div>
          </div>
        ))}
      </div>
      {/* Divi rendered the pagination even with a single page, hidden. */}
      <div className="et_pb_gallery_pagination" style={{ display: 'none' }}>
        <ul />
      </div>
    </div>
  )
}
