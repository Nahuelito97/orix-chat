import { useTranslation } from 'react-i18next'
import type { ChatMessage } from '../../../types'

interface Props {
  editing: ChatMessage | null
  replyTo: ChatMessage | null
  onCancel: () => void
}

/** Barra contextual encima del input: editando o respondiendo. */
export default function ReplyBar({ editing, replyTo, onCancel }: Props) {
  const { t } = useTranslation()
  if (!editing && !replyTo) return null

  const target = editing ?? replyTo
  const label = editing
    ? t('chat.editingLabel')
    : t('chat.replyingTo', {
        name: replyTo?.sender.name || `@${replyTo?.sender.username}`,
      })
  const preview =
    target?.text ?? (target?.image ? t('chat.image') : '')

  return (
    <div className="flex items-center gap-2 border-t border-outline bg-surface px-4 py-2 text-sm">
      <span className="text-primary">{label}</span>
      <span className="min-w-0 flex-1 truncate text-content-muted">{preview}</span>
      <button
        onClick={onCancel}
        className="text-content-muted hover:text-content"
        aria-label="Cancelar"
      >
        ✕
      </button>
    </div>
  )
}
