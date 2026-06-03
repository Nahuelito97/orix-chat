import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { useQueryClient } from '@tanstack/react-query'
import { auth } from '../../../config/firebase'
import { authService } from '../../../services/auth.service'
import { socketService } from '../../../services/socket.service'
import { queryKeys } from '../../../lib/queryKeys'
import { useAuthStore } from '../store/authStore'

/**
 * Se monta una sola vez en la raíz. Sincroniza el estado de Firebase Auth con
 * el backend (sync de perfil), conecta el socket y siembra la query `me`.
 */
export function useAuthListener() {
  const queryClient = useQueryClient()
  const setReady = useAuthStore((s) => s.setReady)
  const setUid = useAuthStore((s) => s.setUid)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await authService.sync()
          queryClient.setQueryData(queryKeys.me, profile)
          await socketService.connect()
          setUid(user.uid)
        } catch {
          setUid(null)
        }
      } else {
        socketService.disconnect()
        queryClient.clear()
        setUid(null)
      }
      setReady(true)
    })
    return () => unsub()
  }, [queryClient, setReady, setUid])
}
