import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '../../../services/users.service'
import { queryKeys } from '../../../lib/queryKeys'
import type { UserData } from '../../../types'

/** Actualiza el perfil y refresca la cache `me`. */
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name?: string; bio?: string; avatar?: string }) =>
      usersService.updateProfile(data),
    onSuccess: (user: UserData) => {
      queryClient.setQueryData(queryKeys.me, user)
    },
  })
}
