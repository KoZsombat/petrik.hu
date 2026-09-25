import { Link } from 'react-router-dom'
import './FullwidthHeader.css'

type Cta = { label: string; to?: string; href?: string }

type Props = {
  heading: string
  /** Sub-heading shown under the title. */
  text?: string
  buttons?: Cta[]
  align?: 'left' | 'center' | 'right'
  index: number
}

/** Divi's fullwidth header module: a centred title, a line of text and CTAs. */
export default function FullwidthHeader({ heading, text, buttons = [], align = 'center', index }: Props) {
  return (
    <section
      className={`et_pb_module et_pb_fullwidth_header et_pb_fullwidth_header_${index} et_pb_text_align_${align} et_pb_bg_layout_light`}
    >
      <div className={`et_pb_fullwidth_header_container ${align}`}>
        <div className={`header-content-container ${align}`}>
          <div className="header-content">
            <h1 className="et_pb_module_header">{heading}</h1>
            {text && (
              <div className="et_pb_header_content_wrapper">
                <p>{text}</p>
              </div>
            )}
            {buttons.map((button, position) =>
              button.to ? (
                <Link
                  key={button.label}
                  className={`et_pb_button et_pb_more_button et_pb_button_${position === 0 ? 'one' : 'two'}`}
                  to={button.to}
                >
                  {button.label}
                </Link>
              ) : (
                <a
                  key={button.label}
                  className={`et_pb_button et_pb_more_button et_pb_button_${position === 0 ? 'one' : 'two'}`}
                  href={button.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {button.label}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
      <div className="et_pb_fullwidth_header_overlay" />
    </section>
  )
}
