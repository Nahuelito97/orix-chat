import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { formatTime } from '../utils/chat'
import { formatText } from '../utils/format'
import { aiService } from '../../../services/ai.service'
import MessageActions from './MessageActions'
import type { ChatMessage } from '../../../types'

interface Props {
  msg: ChatMessage
  mine: boolean
  isGroup: boolean
  seen: boolean
  delivered: boolean
  myId: string
  onReply: () => void
  onEdit: () => void
  onDelete: () => void
  onReact: (emoji: string) => void
  onPin: () => void
  onForward: () => void
}

export default function MessageBubble({
  msg,
  mine,
  isGroup,
  seen,
  delivered,
  myId,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
  onForward,
}: Props) {
  const { t, i18n } = useTranslation()
  const [translation, setTranslation] = useState<string | null>(null)
  const senderName = (s: { name: string; username: string }) =>
    s.name || `@${s.username}`
  const tick = seen ? '✓✓' : delivered ? '✓✓' : '✓'

  async function handleTranslate() {
    if (!msg.text) return
    try {
      const { translation: tr } = await aiService.translate(
        msg.text,
        i18n.resolvedLanguage ?? 'es',
      )
      setTranslation(tr)
    } catch {
      toast.error(t('ai.error'))
    }
  }

  return (
    <div className={`group flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className="flex max-w-[80%] flex-col">
        <div
          className={`relative rounded-2xl px-3.5 py-2 text-sm ${
            mine
              ? 'rounded-br-md bg-primary text-on-accent'
              : 'rounded-bl-md bg-surface text-content'
          }`}
        >
          {isGroup && !mine && (
            <p className="mb-0.5 text-xs font-semibold text-primary">
              {senderName(msg.sender)}
            </p>
          )}

          {/* Cita del mensaje respondido */}
          {msg.replyTo && (
            <div
              className={`mb-1 rounded-lg border-l-2 px-2 py-1 text-xs ${
                mine
                  ? 'border-on-accent/50 bg-on-accent/10'
                  : 'border-primary/60 bg-bg/60'
              }`}
            >
              <span className="block font-medium opacity-80">
                {senderName(msg.replyTo.sender)}
              </span>
              <span className="block truncate opacity-70">
                {msg.replyTo.deleted
                  ? t('chat.lastMessageDeleted')
                  : msg.replyTo.text || (msg.replyTo.image ? t('chat.image') : '')}
              </span>
            </div>
          )}

          {/* Contenido */}
          {msg.deleted ? (
            <p className="italic opacity-60">{t('chat.messageDeleted')}</p>
          ) : msg.image ? (
            <img src={msg.image} alt="" className="max-h-60 rounded-lg" />
          ) : msg.audioUrl ? (
            <audio controls src={msg.audioUrl} className="max-w-[220px]" />
          ) : msg.fileUrl ? (
            <a
              href={msg.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg bg-bg/40 px-2 py-1.5 underline-offset-2 hover:underline"
            >
              <span className="text-lg">📎</span>
              <span className="truncate">{msg.fileName || t('chat.file')}</span>
            </a>
          ) : (
            <p className="whitespace-pre-wrap break-words">
              {msg.text ? formatText(msg.text) : null}
            </p>
          )}

          {translation && (
            <p
              className={`mt-1 border-t pt-1 text-sm italic ${
                mine ? 'border-on-accent/20' : 'border-outline'
              }`}
            >
              🌐 {translation}
            </p>
          )}

          <p
            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
              mine ? 'text-on-accent/70' : 'text-content-muted'
            }`}
          >
            {msg.pinned && <span title={t('chat.pinned')}>📌</span>}
            {msg.edited && !msg.deleted && <span>{t('chat.edited')}</span>}
            <span>{formatTime(msg.createdAt)}</span>
            {mine && !msg.deleted && (
              <span
                title={
                  seen ? t('chat.seen') : delivered ? t('chat.delivered') : t('chat.sent')
                }
                className={seen ? 'text-syncing' : ''}
              >
                {tick}
              </span>
            )}
          </p>
        </div>

        {/* Reacciones */}
        {msg.reactions.length > 0 && (
          <div
            className={`mt-1 flex flex-wrap gap-1 ${mine ? 'justify-end' : 'justify-start'}`}
          >
            {msg.reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact(r.emoji)}
                className={`rounded-full border px-1.5 py-0.5 text-xs transition ${
                  r.userIds.includes(myId)
                    ? 'border-primary bg-primary/15'
                    : 'border-outline bg-surface'
                }`}
              >
                {r.emoji} {r.count}
              </button>
            ))}
          </div>
        )}
      </div>

      {!msg.deleted && (
        <MessageActions
          mine={mine}
          pinned={msg.pinned}
          canTranslate={!!msg.text}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onReact={onReact}
          onPin={onPin}
          onForward={onForward}
          onTranslate={handleTranslate}
        />
      )}
    </div>
  )
}
