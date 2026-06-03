/** Claves centralizadas de TanStack Query. */
export const queryKeys = {
  me: ['me'] as const,
  chats: ['chats'] as const,
  messages: (chatId: string) => ['messages', chatId] as const,
  userSearch: (q: string) => ['users', 'search', q] as const,
}
