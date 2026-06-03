import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import {
  authService,
  authErrorKey,
  isCancelledPopup,
} from '../../../services/auth.service'
import { usersService } from '../../../services/users.service'
import { queryKeys } from '../../../lib/queryKeys'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { t } = useTranslation()
  const ready = useAuthStore((s) => s.ready)
  const uid = useAuthStore((s) => s.uid)

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: usersService.getMe,
    enabled: !!uid,
  })

  function reportError(err: unknown) {
    const code = (err as { code?: string }).code ?? ''
    if (isCancelledPopup(code)) return
    toast.error(t(authErrorKey(code)))
  }

  return {
    ready,
    isAuthed: !!uid,
    user: meQuery.data ?? null,

    async signup(username: string, email: string, password: string) {
      try {
        await authService.signup(username, email, password)
        toast.success(t('auth.accountCreated'))
      } catch (err) {
        reportError(err)
        throw err
      }
    },
    async login(email: string, password: string) {
      try {
        await authService.login(email, password)
      } catch (err) {
        reportError(err)
        throw err
      }
    },
    async loginWithGoogle() {
      try {
        await authService.loginWithGoogle()
      } catch (err) {
        reportError(err)
        throw err
      }
    },
    async resetPassword(email: string) {
      try {
        await authService.resetPassword(email)
        toast.success(t('auth.resetSent'))
      } catch (err) {
        reportError(err)
      }
    },
    logout: () => authService.logout(),
  }
}
