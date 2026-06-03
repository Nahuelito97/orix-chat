import { useTranslation } from 'react-i18next'
import Avatar from '../../../components/ui/Avatar'
import { chatAvatar, chatTitle } from '../utils/chat'
import type { ChatSummary } from '../../../types'

interface Props {
  chat: ChatSummary
  active: boolean
  online: boolean
  onClick: () => void
}

export default function ChatListItem({ chat, active, online, onClick }: Props) {
  const { t } = useTranslation()
  const title = chatTitle(chat)

  const preview = chat.lastMessage?.deleted
    ? t('chat.lastMessageDeleted')
    : chat.lastMessage?.text || t('chat.noMessagesYet')

  return (
    <li>
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-variant ${
          active ? 'bg-surface-variant' : ''
        }`}
      >
        <Avatar
          src={chatAvatar(chat)}
          name={title}
          online={chat.isGroup ? undefined : online}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate font-medium">{title}</span>
            {chat.unread > 0 && (
              <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-on-accent">
                {chat.unread}
              </span>
            )}
          </span>
          <span className="truncate text-sm text-content-muted">{preview}</span>
        </span>
      </button>
    </li>
  )
}
