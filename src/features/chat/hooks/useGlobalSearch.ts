import { useQuery } from '@tanstack/react-query'
import { chatsService } from '../../../services/chats.service'
import { useDebounce } from '../../../hooks/useDebounce'

/** Busca mensajes en todos los chats del usuario, con debounce. */
export function useGlobalSearch(term: string) {
  const q = useDebounce(term.trim(), 300)
  return useQuery({
    queryKey: ['globalSearch', q],
    queryFn: () => chatsService.searchGlobal(q),
    enabled: q.length > 1,
  })
}
