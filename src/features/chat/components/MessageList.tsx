import { useEffect, useRef, useState, type UIEvent } from 'react'
import { useTranslation } from 'react-i18next'
import MessageBubble from './MessageBubble'
import type { ChatMessage } from '../../../types'

interface Props {
  messages: ChatMessage[]
  myId: string
  isGroup: boolean
  otherLastRead?: string
  otherLastDelivered?: string
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
  onReply: (msg: ChatMessage) => void
  onEdit: (msg: ChatMessage) => void
  onDelete: (msg: ChatMessage) => void
  onReact: (msg: ChatMessage, emoji: string) => void
  onPin: (msg: ChatMessage) => void
  onForward: (msg: ChatMessage) => void
}

export default function MessageList({
  messages,
  myId,
  isGroup,
  otherLastRead,
  otherLastDelivered,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
  onForward,
}: Props) {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showJump, setShowJump] = useState(false)

  // Tick para ocultar en vivo los mensajes temporales vencidos.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(id)
  }, [])
  const visible = messages.filter(
    (m) => !m.expiresAt || new Date(m.expiresAt).getTime() > now,
  )

  function seen(msg: ChatMessage): boolean {
    return !!otherLastRead && new Date(otherLastRead) >= new Date(msg.createdAt)
  }
  function delivered(msg: ChatMessage): boolean {
    return (
      !!otherLastDelivered &&
      new Date(otherLastDelivered) >= new Date(msg.createdAt)
    )
  }

  // En flex-col-reverse el fondo (más nuevo) es scrollTop≈0; arriba es negativo.
  function handleScroll(e: UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const distanceFromBottom = Math.abs(el.scrollTop)
    setShowJump(distanceFromBottom > 240)
    const distanceFromTop =
      el.scrollHeight - el.clientHeight - distanceFromBottom
    if (distanceFromTop < 120 && hasMore && !isLoadingMore) onLoadMore()
  }

  function jumpToBottom() {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-full flex-col-reverse gap-1 overflow-y-auto px-4 py-4"
      >
        {visible.map((m) => (
          <MessageBubble
            key={m.id}
            msg={m}
            mine={m.sender.id === myId}
            isGroup={isGroup}
            seen={seen(m)}
            delivered={delivered(m)}
            myId={myId}
            onReply={() => onReply(m)}
            onEdit={() => onEdit(m)}
            onDelete={() => onDelete(m)}
            onReact={(emoji) => onReact(m, emoji)}
            onPin={() => onPin(m)}
            onForward={() => onForward(m)}
          />
        ))}

        {isLoadingMore && (
          <p className="py-2 text-center text-xs text-content-muted">
            {t('common.loading')}
          </p>
        )}
        {visible.length === 0 && (
          <p className="my-auto text-center text-sm text-content-muted">
            {t('chat.noMessages')}
          </p>
        )}
      </div>

      {showJump && (
        <button
          onClick={jumpToBottom}
          title={t('chat.scrollToBottom')}
          className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full border border-outline bg-surface text-content shadow-lg transition hover:bg-surface-variant"
        >
          ↓
        </button>
      )}
    </div>
  )
}
