type Props = {
  /** The PDF the <object> embeds. Often a different upload from `href`. */
  embed: string
  /** What both links point at. */
  href: string
  /** The visible link text. */
  label: string
  /** The download button's text - "Letöltés" in the mirror. */
  buttonLabel: string
  /** The embed's aria-label, which names the file in Hungarian. */
  embedLabel: string
}

/**
 * Gutenberg's file block, used by the one docs page written in the WordPress
 * editor rather than the Divi builder.
 *
 * The embed keeps its `hidden` attribute. WordPress ships it hidden and lets
 * its Interactivity API reveal it only where the browser can preview a PDF;
 * that script is not ported, and measuring the mirror confirms the object stays
 * at 0x0 there too. The file is reachable through both links either way.
 */
export default function FileBlock({ embed, href, label, buttonLabel, embedLabel }: Props) {
  const mediaId = 'wp-block-file--media-' + href.split('/').pop()?.replace(/\W+/g, '-')

  return (
    <div className="wp-block-file">
      <object
        hidden
        className="wp-block-file__embed"
        data={embed}
        type="application/pdf"
        style={{ width: '100%', height: '600px' }}
        aria-label={embedLabel}
      />
      <a id={mediaId} href={href}>
        {label}
      </a>
      <a
        href={href}
        className="wp-block-file__button wp-element-button"
        download
        aria-describedby={mediaId}
      >
        {buttonLabel}
      </a>
    </div>
  )
}
