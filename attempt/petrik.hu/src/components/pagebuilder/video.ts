/**
 * The YouTube id in any of the link shapes people paste - watch?v=, youtu.be/,
 * /embed/, /shorts/. VideoEmbed.tsx only knows how to embed YouTube, as the
 * mirror's video modules only ever were.
 */
export function youtubeId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\.|^m\./, '')
    let id: string | null = null
    if (host === 'youtu.be') id = parsed.pathname.slice(1)
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id = parsed.searchParams.get('v') ?? parsed.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] ?? null
    }
    return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : null
  } catch {
    return null
  }
}
