import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useSettingsStore } from '../store/settingsStore'
import { notificationsService } from '../../../services/notifications.service'

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-surface"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition ${
          checked ? 'bg-primary' : 'bg-inactive'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
            checked ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export default function SettingsToggles() {
  const { t } = useTranslation()
  const { notifications, sound, setNotifications, setSound } = useSettingsStore()

  async function toggleNotifications() {
    if (notifications) {
      setNotifications(false)
      return
    }
    const granted = await notificationsService.requestPermission()
    if (granted) setNotifications(true)
    else toast.error(t('settings.notificationsDenied'))
  }

  return (
    <div className="border-t border-outline">
      <Toggle
        label={t('settings.notifications')}
        checked={notifications}
        onChange={toggleNotifications}
      />
      <Toggle
        label={t('settings.sound')}
        checked={sound}
        onChange={() => setSound(!sound)}
      />
    </div>
  )
}
