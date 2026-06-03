import { useTranslation } from 'react-i18next'
import Avatar from '../../../components/ui/Avatar'
import { chatAvatar, chatTitle } from '../utils/chat'
import type { ChatSummary } from '../../../types'

interface Props {
  chat: ChatSummary
  online: boolean
  someoneTyping: boolean
  onBack: () => void
  onSearch: () => void
  onToggleMute: () => void
  onCall: (video: boolean) => void
}

export default function ChatHeader({
  chat,
  online,
  someoneTyping,
  onBack,
  onSearch,
  onToggleMute,
  onCall,
}: Props) {
  const { t } = useTranslation()
  const title = chatTitle(chat)

  let status: React.ReactNode
  if (someoneTyping) {
    status = <span className="text-primary">{t('chat.typing')}</span>
  } else if (chat.isGroup) {
    status = t('chat.members', { count: chat.participants.length })
  } else if (online) {
    status = <span className="text-success">{t('chat.online')}</span>
  } else {
    status = t('chat.offline')
  }

  return (
    <div className="flex items-center gap-3 border-b border-outline bg-surface px-4 py-3">
      <button
        onClick={onBack}
        className="text-content-muted hover:text-content sm:hidden"
        aria-label="Volver"
      >
        ←
      </button>
      <Avatar
        src={chatAvatar(chat)}
        name={title}
        online={chat.isGroup ? undefined : online}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium leading-tight">{title}</p>
        <p className="text-xs text-content-muted">{status}</p>
      </div>
      {!chat.isGroup && (
        <>
          <button
            onClick={() => onCall(false)}
            className="rounded-lg px-2 py-1 text-content-muted hover:bg-surface-variant hover:text-content"
            title={t('call.audioCall')}
          >
            📞
          </button>
          <button
            onClick={() => onCall(true)}
            className="rounded-lg px-2 py-1 text-content-muted hover:bg-surface-variant hover:text-content"
            title={t('call.videoCall')}
          >
            📹
          </button>
        </>
      )}
      <button
        onClick={onToggleMute}
        className="rounded-lg px-2 py-1 text-content-muted hover:bg-surface-variant hover:text-content"
        title={chat.muted ? t('chat.unmute') : t('chat.mute')}
        aria-label={chat.muted ? t('chat.unmute') : t('chat.mute')}
      >
        {chat.muted ? '🔕' : '🔔'}
      </button>
      <button
        onClick={onSearch}
        className="rounded-lg px-2 py-1 text-content-muted hover:bg-surface-variant hover:text-content"
        title={t('chat.searchInChat')}
        aria-label={t('chat.searchInChat')}
      >
        🔍
      </button>
    </div>
  )
}
