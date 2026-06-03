import { useQuery } from '@tanstack/react-query'
import { chatsService } from '../../../services/chats.service'
import { useDebounce } from '../../../hooks/useDebounce'

/** Busca mensajes (texto) dentro de un chat, con debounce de 300ms. */
export function useMessageSearch(chatId: string, term: string) {
  const q = useDebounce(term.trim(), 300)
  return useQuery({
    queryKey: ['messageSearch', chatId, q],
    queryFn: () => chatsService.searchMessages(chatId, q),
    enabled: q.length > 0,
  })
}
