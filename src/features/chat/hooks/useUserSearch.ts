import { useQuery } from '@tanstack/react-query'
import { usersService } from '../../../services/users.service'
import { queryKeys } from '../../../lib/queryKeys'
import { useDebounce } from '../../../hooks/useDebounce'

/** Busca usuarios por @username, con debounce de 300ms. */
export function useUserSearch(term: string) {
  const q = useDebounce(term.trim(), 300)
  const query = useQuery({
    queryKey: queryKeys.userSearch(q),
    queryFn: () => usersService.search(q),
    enabled: q.length > 0,
  })
  return { ...query, term: q }
}
