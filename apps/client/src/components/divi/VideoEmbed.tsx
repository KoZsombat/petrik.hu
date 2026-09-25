import './VideoEmbed.css'

type Props = {
  /** YouTube video id, e.g. "d3YG5QNkXA8". */
  videoId: string
  title: string
  /** Divi numbers video modules per page for its design stylesheet. */
  index: number
}

/**
 * Divi's video module wrapping a YouTube embed.
 *
 * The original relied on the jQuery FitVids plugin to keep the 16:9 ratio; an
 * aspect-ratio box does the same thing without any script. The iframe is
 * lazy-loaded and uses youtube-nocookie, which the WordPress oEmbed did not.
 */
export default function VideoEmbed({ videoId, title, index }: Props) {
  return (
    <div className={`et_pb_module et_pb_video et_pb_video_${index}`}>
      <div className="et_pb_video_box">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  )
}
