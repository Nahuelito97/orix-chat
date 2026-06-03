import { env } from '../config/env'

export interface Gif {
  id: string
  url: string // URL del GIF (downsized, para enviar/mostrar)
}

interface GiphyItem {
  id: string
  images: { downsized: { url: string }; fixed_height: { url: string } }
}

const BASE = 'https://api.giphy.com/v1/gifs'

export const giphyService = {
  enabled: () => Boolean(env.giphyKey),

  async search(query: string): Promise<Gif[]> {
    if (!env.giphyKey) return []
    const endpoint = query.trim()
      ? `${BASE}/search?q=${encodeURIComponent(query)}&limit=24&rating=pg-13`
      : `${BASE}/trending?limit=24&rating=pg-13`
    const res = await fetch(`${endpoint}&api_key=${env.giphyKey}`)
    if (!res.ok) return []
    const json = (await res.json()) as { data: GiphyItem[] }
    return json.data.map((g) => ({ id: g.id, url: g.images.downsized.url }))
  },
}
