import { useTranslation } from 'react-i18next'
import Modal from '../../../components/ui/Modal'
import Avatar from '../../../components/ui/Avatar'
import { useChats } from '../hooks/useChats'
import { chatAvatar, chatTitle } from '../utils/chat'

interface Props {
  open: boolean
  onClose: () => void
  onPick: (chatId: string) => void
}

/** Lista de chats para reenviar un mensaje. */
export default function ForwardModal({ open, onClose, onPick }: Props) {
  const { t } = useTranslation()
  const { data: chats = [] } = useChats()

  return (
    <Modal open={open} title={t('chat.forwardTo')} onClose={onClose}>
      <ul className="max-h-80 space-y-1 overflow-y-auto">
        {chats.map((chat) => (
          <li key={chat.id}>
            <button
              onClick={() => {
                onPick(chat.id)
                onClose()
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-variant"
            >
              <Avatar src={chatAvatar(chat)} name={chatTitle(chat)} size={32} />
              <span className="truncate">{chatTitle(chat)}</span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
