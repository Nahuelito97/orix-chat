import { useInfiniteQuery } from '@tanstack/react-query'
import { chatsService } from '../../../services/chats.service'
import { queryKeys } from '../../../lib/queryKeys'

export interface MessagePage {
  messages: import('../../../types').ChatMessage[]
  nextCursor: string | null
}

/**
 * Historial paginado del chat (infinite-scroll). Cada página viene
 * newest-first; al concatenar páginas (nuevas→viejas) el resultado queda
 * newest-first global, ideal para render con flex-col-reverse.
 */
export function useMessages(chatId: string | undefined) {
  const query = useInfiniteQuery({
    queryKey: chatId ? queryKeys.messages(chatId) : ['messages', 'none'],
    queryFn: ({ pageParam }): Promise<MessagePage> =>
      chatsService.messages(chatId!, pageParam ?? undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!chatId,
  })

  const messages = query.data?.pages.flatMap((p) => p.messages) ?? []

  return {
    messages,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}
