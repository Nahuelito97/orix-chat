import { useTranslation } from 'react-i18next'
import Avatar from '../../../components/ui/Avatar'
import { chatAvatar, chatTitle, formatListTime } from '../utils/chat'
import type { ChatSummary } from '../../../types'

interface Props {
  chat: ChatSummary
  active: boolean
  online: boolean
  onClick: () => void
  onPin: () => void
  onArchive: () => void
}

export default function ChatListItem({
  chat,
  active,
  online,
  onClick,
  onPin,
  onArchive,
}: Props) {
  const { t } = useTranslation()
  const title = chat.isSelf ? t('chat.savedMessages') : chatTitle(chat)
  const unread = chat.unread > 0

  const preview = chat.lastMessage?.deleted
    ? t('chat.lastMessageDeleted')
    : chat.lastMessage?.text || t('chat.noMessagesYet')

  return (
    <li className="group relative px-2">
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-surface-variant ${
          active ? 'bg-surface-variant' : ''
        }`}
      >
        <Avatar
          src={chatAvatar(chat)}
          name={title}
          size={48}
          online={chat.isGroup ? undefined : online}
        />

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1">
            {chat.pinned && <span className="shrink-0 text-xs">📌</span>}
            <span className="truncate font-semibold">{title}</span>
          </span>
          <span
            className={`mt-0.5 block truncate text-sm ${
              unread ? 'font-medium text-content' : 'text-content-muted'
            }`}
          >
            {preview}
          </span>
        </span>

        {/* Columna derecha: hora + no-leídos */}
        <span className="flex flex-col items-end gap-1 self-stretch">
          {chat.lastMessage && (
            <span className="text-[11px] text-content-muted">
              {formatListTime(chat.lastMessage.createdAt)}
            </span>
          )}
          {unread && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-on-accent">
              {chat.unread}
            </span>
          )}
        </span>
      </button>

      {/* Acciones (hover) */}
      <div className="absolute right-4 top-2 hidden gap-1 rounded-lg bg-surface px-1 py-0.5 shadow group-hover:flex">
        <button
          onClick={onPin}
          title={chat.pinned ? t('chat.unpinChat') : t('chat.pinChat')}
          className="rounded px-1 text-content-muted hover:text-primary"
        >
          📌
        </button>
        <button
          onClick={onArchive}
          title={chat.archived ? t('chat.unarchive') : t('chat.archive')}
          className="rounded px-1 text-content-muted hover:text-content"
        >
          🗄
        </button>
      </div>
    </li>
  )
}
