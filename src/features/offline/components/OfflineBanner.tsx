import { useTranslation } from 'react-i18next'
import { useOutboxStore } from '../store/outboxStore'

/** Aviso fijo cuando no hay conexión, con los mensajes en cola. */
export default function OfflineBanner() {
  const { t } = useTranslation()
  const online = useOutboxStore((s) => s.online)
  const pending = useOutboxStore((s) => s.queue.length)

  if (online) return null

  return (
    <div className="fixed left-1/2 top-3 z-50 -translate-x-1/2 rounded-full border border-warn/40 bg-warn/15 px-4 py-1.5 text-sm text-warn shadow-lg">
      {t('offline.banner')}
      {pending > 0 && ` · ${t('offline.queued', { count: pending })}`}
    </div>
  )
}
