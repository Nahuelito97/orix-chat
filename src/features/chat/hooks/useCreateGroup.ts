import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatsService } from '../../../services/chats.service'
import { queryKeys } from '../../../lib/queryKeys'

/** Crea un grupo y refresca la lista de chats. Devuelve el id creado. */
export function useCreateGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, memberIds }: { name: string; memberIds: string[] }) =>
      chatsService.createGroup(name, memberIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chats })
    },
  })
}
