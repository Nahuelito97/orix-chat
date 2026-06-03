import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

type Mode = 'login' | 'signup'

export default function LoginForm() {
  const { t } = useTranslation()
  const { login, signup, resetPassword } = useAuth()

  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    if (mode === 'signup' && username.trim().length < 3) {
      toast.error(t('auth.usernameTooShort'))
      return
    }
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signup(username.trim(), email.trim(), password)
      } else {
        await login(email.trim(), password)
      }
    } catch {
      /* el toast ya lo dispara useAuth */
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Tabs */}
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-bg p-1">
        {(['login', 'signup'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              mode === m
                ? 'bg-primary text-on-accent'
                : 'text-content-muted hover:text-content'
            }`}
          >
            {m === 'login' ? t('auth.login') : t('auth.signup')}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <Input
            label={t('auth.username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('auth.usernamePlaceholder')}
            autoComplete="username"
            required
          />
        )}
        <Input
          label={t('auth.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.emailPlaceholder')}
          autoComplete="email"
          required
        />
        <Input
          label={t('auth.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('auth.passwordPlaceholder')}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
        />
        <Button type="submit" fullWidth disabled={loading}>
          {loading
            ? t('common.loading')
            : mode === 'login'
              ? t('auth.login')
              : t('auth.signup')}
        </Button>

        {mode === 'login' && (
          <button
            type="button"
            onClick={() => {
              if (!email.trim()) {
                toast.info(t('auth.enterEmailFirst'))
                return
              }
              void resetPassword(email.trim())
            }}
            className="block w-full text-center text-xs text-content-muted hover:text-primary"
          >
            {t('auth.forgotPassword')}
          </button>
        )}
      </form>
    </>
  )
}
