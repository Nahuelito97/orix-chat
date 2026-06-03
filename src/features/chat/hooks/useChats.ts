import { useQuery } from '@tanstack/react-query'
import { chatsService } from '../../../services/chats.service'
import { queryKeys } from '../../../lib/queryKeys'
import { useAuth } from '../../auth/hooks/useAuth'

/** Lista de chats del usuario (server-state). */
export function useChats() {
  const { isAuthed } = useAuth()
  return useQuery({
    queryKey: queryKeys.chats,
    queryFn: chatsService.list,
    enabled: isAuthed,
  })
}
