import { http } from './http'

export interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
}

export const linksService = {
  preview: (url: string) =>
    http.get<LinkPreview>(`/links/preview?url=${encodeURIComponent(url)}`),
}
