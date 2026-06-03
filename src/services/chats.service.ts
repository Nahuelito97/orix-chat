import { http } from './http'
import type { ChatMessage, ChatSummary } from '../types'

export const chatsService = {
  list: () => http.get<ChatSummary[]>('/chats'),
  createDirect: (otherId: string) =>
    http.post<{ id: string }>('/chats/direct', { otherId }),
  createGroup: (name: string, memberIds: string[]) =>
    http.post<{ id: string }>('/chats/group', { name, memberIds }),
  messages: (chatId: string, cursor?: string) =>
    http.get<{ messages: ChatMessage[]; nextCursor: string | null }>(
      `/chats/${chatId}/messages${cursor ? `?cursor=${cursor}` : ''}`,
    ),
  searchMessages: (chatId: string, q: string) =>
    http.get<ChatMessage[]>(
      `/chats/${chatId}/search?q=${encodeURIComponent(q)}`,
    ),
}
