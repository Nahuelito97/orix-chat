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
  onSummarize: () => void
}

export default function ChatHeader({
  chat,
  online,
  someoneTyping,
  onBack,
  onSearch,
  onToggleMute,
  onCall,
  onSummarize,
}: Props) {
  const { t } = useTranslation()
  const title = chat.isSelf ? t('chat.savedMessages') : chatTitle(chat)

  let status: React.ReactNode
  if (someoneTyping) {
    status = <span className="text-primary">{t('chat.typing')}</span>
  } else if (chat.isGroup) {
    status = t('chat.members', { count: chat.participants.length })
  } else if (online) {
    status = (
      <span className="flex items-center gap-1 text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        {t('chat.online')}
      </span>
    )
  } else {
    status = t('chat.offline')
  }

  const btn =
    'grid h-9 w-9 place-items-center rounded-full text-base text-content-muted transition hover:bg-surface-variant hover:text-content'

  return (
    <div className="flex items-center gap-3 border-b border-outline bg-surface px-4 py-2.5 shadow-sm shadow-black/5">
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
        size={44}
        online={chat.isGroup ? undefined : online}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold leading-tight">{title}</p>
        <p className="mt-0.5 text-xs text-content-muted">{status}</p>
      </div>

      <div className="flex items-center gap-0.5">
        {!chat.isGroup && !chat.isSelf && (
          <>
            <button onClick={() => onCall(false)} className={btn} title={t('call.audioCall')}>
              📞
            </button>
            <button onClick={() => onCall(true)} className={btn} title={t('call.videoCall')}>
              📹
            </button>
          </>
        )}
        <button
          onClick={onToggleMute}
          className={btn}
          title={chat.muted ? t('chat.unmute') : t('chat.mute')}
        >
          {chat.muted ? '🔕' : '🔔'}
        </button>
        <button onClick={onSummarize} className={btn} title={t('ai.summarize')}>
          ✨
        </button>
        <button onClick={onSearch} className={btn} title={t('chat.searchInChat')}>
          🔍
        </button>
      </div>
    </div>
  )
}
