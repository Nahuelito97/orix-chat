import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isFirebaseConfigured } from '../../../config/env'
import LanguageSwitcher from '../../../components/ui/LanguageSwitcher'
import ThemeToggle from '../../../components/ui/ThemeToggle'
import LoginForm from '../components/LoginForm'
import GoogleButton from '../components/GoogleButton'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { t } = useTranslation()
  const { loginWithGoogle } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogle() {
    if (googleLoading) return
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch {
      /* toast via useAuth */
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Orix<span className="text-primary">Chat</span>
          </h1>
          <p className="mt-1 text-sm text-content-muted">{t('app.tagline')}</p>
        </div>

        {!isFirebaseConfigured && (
          <div className="mb-5 rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm text-warn">
            {t('auth.firebaseNotConfigured')}
          </div>
        )}

        <div className="rounded-2xl border border-outline bg-surface p-6 shadow-xl shadow-black/20">
          <LoginForm />

          <div className="my-5 flex items-center gap-3 text-xs text-content-muted">
            <span className="h-px flex-1 bg-outline" />
            {t('auth.or')}
            <span className="h-px flex-1 bg-outline" />
          </div>

          <GoogleButton onClick={handleGoogle} disabled={googleLoading} />
        </div>
      </div>
    </div>
  )
}
