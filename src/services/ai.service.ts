import { http } from './http'

export const aiService = {
  summarize: (chatId: string, lang: string) =>
    http.post<{ summary: string }>(`/ai/chats/${chatId}/summarize`, { lang }),
  suggest: (chatId: string, lang: string) =>
    http.post<{ suggestions: string[] }>(`/ai/chats/${chatId}/suggest`, { lang }),
  translate: (text: string, to: string) =>
    http.post<{ translation: string }>('/ai/translate', { text, to }),
}
