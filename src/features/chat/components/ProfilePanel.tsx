import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Avatar from '../../../components/ui/Avatar'
import Button from '../../../components/ui/Button'
import { useAuth } from '../../auth/hooks/useAuth'
import { useMessages } from '../hooks/useMessages'
import { useGroupActions } from '../hooks/useGroupActions'
import { useChatStore } from '../store/chatStore'
import { chatAvatar, chatTitle } from '../utils/chat'
import GroupAdminModal from './GroupAdminModal'

export default function ProfilePanel() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const { deleteChat } = useGroupActions()
  const activeChat = useChatStore((s) => s.activeChat)
  const { messages } = useMessages(activeChat?.id)
  const [adminOpen, setAdminOpen] = useState(false)

  if (!activeChat) {
    return <div className="h-full border-l border-outline bg-surface" />
  }

  const other = activeChat.other
  const title = chatTitle(activeChat)
  const images = messages
    .filter((m) => m.image && !m.deleted)
    .map((m) => m.image!)

  return (
    <div className="flex h-full flex-col border-l border-outline bg-surface">
      <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
        <Avatar src={chatAvatar(activeChat)} name={title} size={88} />
        <h2 className="mt-2 text-lg font-semibold">{title}</h2>
        {activeChat.isGroup ? (
          <p className="text-sm text-content-muted">
            {t('chat.members', { count: activeChat.participants.length })}
          </p>
        ) : activeChat.isSelf ? (
          <p className="text-sm text-content-muted">{t('chat.savedHint')}</p>
        ) : (
          <p className="text-sm text-content-muted">@{other?.username}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto border-t border-outline px-6 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-content-muted">
          {t('chat.sharedImages')}
        </p>
        {images.length === 0 ? (
          <p className="text-sm text-content-muted">{t('chat.noImages')}</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map((src, i) => (
              <a key={i} href={src} target="_blank" rel="noreferrer">
                <img
                  src={src}
                  alt=""
                  className="aspect-square w-full rounded-lg object-cover"
                />
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-outline p-4">
        {activeChat.isGroup ? (
          <Button variant="outline" fullWidth onClick={() => setAdminOpen(true)}>
            {t('group.manage')}
          </Button>
        ) : (
          <Button
            variant="danger"
            fullWidth
            onClick={() => {
              if (confirm(t('chat.confirmDelete'))) deleteChat(activeChat.id)
            }}
          >
            {t('chat.deleteConversation')}
          </Button>
        )}
        <Button variant="danger" fullWidth onClick={() => logout()}>
          {t('menu.logout')}
        </Button>
      </div>

      {activeChat.isGroup && (
        <GroupAdminModal
          chat={activeChat}
          open={adminOpen}
          onClose={() => setAdminOpen(false)}
        />
      )}
    </div>
  )
}
