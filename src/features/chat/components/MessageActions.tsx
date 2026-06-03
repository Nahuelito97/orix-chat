import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

interface Props {
  mine: boolean
  pinned: boolean
  onReply: () => void
  onEdit: () => void
  onDelete: () => void
  onReact: (emoji: string) => void
  onPin: () => void
  onForward: () => void
}

export default function MessageActions({
  mine,
  pinned,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
  onForward,
}: Props) {
  const { t } = useTranslation()
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div
      className={`relative flex items-center self-center opacity-0 transition group-hover:opacity-100 ${
        mine ? 'order-first mr-1' : 'ml-1'
      }`}
    >
      <button
        onClick={() => setPickerOpen((o) => !o)}
        className="rounded p-1 text-content-muted hover:text-content"
        title={t('chat.react')}
      >
        😊
      </button>
      <button
        onClick={onReply}
        className="rounded p-1 text-content-muted hover:text-content"
        title={t('chat.reply')}
      >
        ↩️
      </button>
      <button
        onClick={onForward}
        className="rounded p-1 text-content-muted hover:text-content"
        title={t('chat.forward')}
      >
        ↪️
      </button>
      <button
        onClick={onPin}
        className="rounded p-1 text-content-muted hover:text-content"
        title={pinned ? t('chat.unpin') : t('chat.pin')}
      >
        📌
      </button>
      {mine && (
        <>
          <button
            onClick={onEdit}
            className="rounded p-1 text-content-muted hover:text-content"
            title={t('chat.edit')}
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1 text-content-muted hover:text-danger"
            title={t('chat.delete')}
          >
            🗑
          </button>
        </>
      )}
      {pickerOpen && (
        <div
          className="absolute -top-9 z-10 flex gap-1 rounded-full border border-outline bg-surface px-2 py-1 shadow-lg"
          onMouseLeave={() => setPickerOpen(false)}
        >
          {REACTION_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => {
                onReact(e)
                setPickerOpen(false)
              }}
              className="text-base transition hover:scale-125"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
