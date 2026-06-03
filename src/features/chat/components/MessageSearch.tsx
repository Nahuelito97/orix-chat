import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Input from '../../../components/ui/Input'
import { useMessageSearch } from '../hooks/useMessageSearch'
import { formatTime } from '../utils/chat'

interface Props {
  chatId: string
  onClose: () => void
}

/** Buscador de mensajes dentro del chat activo. */
export default function MessageSearch({ chatId, onClose }: Props) {
  const { t } = useTranslation()
  const [term, setTerm] = useState('')
  const { data: results = [], isFetching } = useMessageSearch(chatId, term)

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface-variant/20">
      <div className="flex items-center gap-2 border-b border-outline bg-surface px-3 py-2">
        <Input
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t('chat.searchMessagesPlaceholder')}
          className="py-2 text-sm"
        />
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg px-2 py-1 text-content-muted hover:text-content"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {!term.trim() ? (
          <p className="mt-6 text-center text-sm text-content-muted">
            {t('chat.searchMessagesHint')}
          </p>
        ) : isFetching ? (
          <p className="mt-6 text-center text-sm text-content-muted">
            {t('chat.searching')}
          </p>
        ) : results.length === 0 ? (
          <p className="mt-6 text-center text-sm text-content-muted">
            {t('chat.noResults')}
          </p>
        ) : (
          <ul className="space-y-1">
            {results.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-outline bg-surface px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-content-muted">
                  <span className="font-medium text-content">
                    {m.sender.name || `@${m.sender.username}`}
                  </span>
                  <span>{formatTime(m.createdAt)}</span>
                </div>
                <p className="mt-0.5 break-words text-sm">{m.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
