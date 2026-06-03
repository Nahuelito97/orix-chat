import { useTranslation } from 'react-i18next'
import { useAuth } from '../../auth/hooks/useAuth'
import ProfileForm from '../components/ProfileForm'

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      {user ? (
        <ProfileForm user={user} />
      ) : (
        <p className="text-content-muted">{t('common.loading')}</p>
      )}
    </div>
  )
}
