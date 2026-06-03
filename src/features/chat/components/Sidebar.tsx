import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../../components/ui/LanguageSwitcher'
import ThemeToggle from '../../../components/ui/ThemeToggle'
import Input from '../../../components/ui/Input'
import { useAuth } from '../../auth/hooks/useAuth'
import { useChats } from '../hooks/useChats'
import { useUserSearch } from '../hooks/useUserSearch'
import { useGlobalSearch } from '../hooks/useGlobalSearch'
import { useChatActions } from '../hooks/useChatActions'
import { useChatStore } from '../store/chatStore'
import { isUserOnline } from '../utils/chat'
import ChatListItem from './ChatListItem'
import UserSearchResults from './UserSearchResults'
import NewGroupModal from './NewGroupModal'
import SettingsToggles from '../../settings/components/SettingsToggles'
import type { UserMini } from '../../../types'

export default function Sidebar() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const { data: chats = [] } = useChats()
  const {
    openChat,
    openChatById,
    openChatWithUser,
    togglePinChat,
    toggleArchiveChat,
  } = useChatActions()
  const activeChat = useChatStore((s) => s.activeChat)
  const presence = useChatStore((s) => s.presence)

  const [term, setTerm] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [groupOpen, setGroupOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const search = useUserSearch(term)
  const messageSearch = useGlobalSearch(term)

  // OrixBot vive en el widget flotante, no en la lista.
  const listChats = chats.filter(
    (c) => !(!c.isGroup && c.other?.username === 'orixbot'),
  )
  const activeChats = listChats.filter((c) => !c.archived)
  const archivedChats = listChats.filter((c) => c.archived)

  async function startChat(user: UserMini) {
    await openChatWithUser(user)
    setTerm('')
  }

  return (
    <div className="flex h-full flex-col border-r border-outline bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-lg font-bold">
          Orix<span className="text-primary">Chat</span>
        </h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-lg px-2 py-1 text-content-muted hover:bg-surface-variant hover:text-content"
              aria-label="Menú"
            >
              ⋮
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-9 z-10 w-44 overflow-hidden rounded-xl border border-outline bg-surface-variant shadow-xl"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <Link
                  to="/profile"
                  className="block px-4 py-2.5 text-sm hover:bg-surface"
                >
                  {t('menu.editProfile')}
                </Link>
                <SettingsToggles />
                <button
                  onClick={() => logout()}
                  className="block w-full border-t border-outline px-4 py-2.5 text-left text-sm text-danger hover:bg-surface"
                >
                  {t('menu.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Búsqueda + nuevo grupo */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t('chat.searchPlaceholder')}
          className="py-2 text-sm"
        />
        <button
          onClick={() => setGroupOpen(true)}
          title={t('group.title')}
          className="shrink-0 rounded-xl border border-outline bg-bg px-3 py-2 text-lg text-content-muted transition hover:border-primary hover:text-primary"
        >
          ＋
        </button>
      </div>

      {/* Resultados / lista */}
      <div className="flex-1 overflow-y-auto">
        {term.trim() ? (
          <>
            <p className="px-4 pt-2 text-xs font-semibold uppercase tracking-wide text-content-muted">
              {t('chat.usersSection')}
            </p>
            <UserSearchResults
              loading={search.isFetching}
              results={search.data ?? []}
              onPick={startChat}
            />
            {(messageSearch.data?.length ?? 0) > 0 && (
              <>
                <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-content-muted">
                  {t('chat.messagesSection')}
                </p>
                <ul>
                  {messageSearch.data!.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => void openChatById(r.chatId)}
                        className="block w-full px-4 py-2 text-left hover:bg-surface-variant"
                      >
                        <span className="block truncate text-sm font-medium">
                          {r.chatName}
                        </span>
                        <span className="block truncate text-xs text-content-muted">
                          {r.text}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <ul>
            {activeChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                active={activeChat?.id === chat.id}
                online={!chat.isGroup && isUserOnline(chat.other, presence)}
                onClick={() => void openChat(chat)}
                onPin={() => togglePinChat(chat.id)}
                onArchive={() => toggleArchiveChat(chat.id)}
              />
            ))}
            {activeChats.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-content-muted">
                {t('chat.noChats')}
              </p>
            )}

            {/* Archivados */}
            {archivedChats.length > 0 && (
              <li>
                <button
                  onClick={() => setShowArchived((v) => !v)}
                  className="w-full px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-content-muted hover:text-content"
                >
                  🗄 {t('chat.archived')} ({archivedChats.length}) {showArchived ? '▾' : '▸'}
                </button>
              </li>
            )}
            {showArchived &&
              archivedChats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  active={activeChat?.id === chat.id}
                  online={!chat.isGroup && isUserOnline(chat.other, presence)}
                  onClick={() => void openChat(chat)}
                  onPin={() => togglePinChat(chat.id)}
                  onArchive={() => toggleArchiveChat(chat.id)}
                />
              ))}
          </ul>
        )}
      </div>

      <NewGroupModal open={groupOpen} onClose={() => setGroupOpen(false)} />
    </div>
  )
}
