import type { ReactNode } from 'react'
import './Testimonial.css'

type Props = {
  children: ReactNode
  author: string
  /** Portrait shown to the left of the quote. */
  portrait?: string
  align?: 'left' | 'center' | 'right' | 'justified'
  index: number
}

/** Divi's testimonial module: a quote with a round portrait and an author. */
export default function Testimonial({ children, author, portrait, align = 'left', index }: Props) {
  return (
    <div
      className={`et_pb_module et_pb_testimonial et_pb_testimonial_${index} clearfix et_pb_text_align_${align} et_pb_bg_layout_light`}
    >
      {portrait && (
        <div
          className="et_pb_testimonial_portrait"
          style={{ backgroundImage: `url("${portrait}")` }}
          role="presentation"
        />
      )}
      <div className="et_pb_testimonial_description">
        <div className="et_pb_testimonial_description_inner">
          <div className="et_pb_testimonial_content">{children}</div>
        </div>
        <span className="et_pb_testimonial_author">{author}</span>
      </div>
    </div>
  )
}
