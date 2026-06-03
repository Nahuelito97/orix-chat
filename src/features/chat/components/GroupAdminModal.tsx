import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Avatar from '../../../components/ui/Avatar'
import { useAuth } from '../../auth/hooks/useAuth'
import { useUserSearch } from '../hooks/useUserSearch'
import { useGroupActions } from '../hooks/useGroupActions'
import type { ChatSummary, UserMini } from '../../../types'

interface Props {
  chat: ChatSummary
  open: boolean
  onClose: () => void
}

export default function GroupAdminModal({ chat, open, onClose }: Props) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { renameGroup, addMembers, removeMember, leaveGroup } = useGroupActions()

  const [name, setName] = useState(chat.name ?? '')
  const [term, setTerm] = useState('')
  const search = useUserSearch(term)

  const isAdmin = chat.myRole === 'admin'
  const memberIds = new Set(chat.participants.map((p) => p.id))
  const candidates = (search.data ?? []).filter((u) => !memberIds.has(u.id))

  function handleRename() {
    const value = name.trim()
    if (value && value !== chat.name) renameGroup(chat.id, value)
  }

  function handleAdd(u: UserMini) {
    addMembers(chat.id, [u.id])
    setTerm('')
  }

  function handleLeave() {
    if (confirm(t('group.confirmLeave'))) {
      leaveGroup(chat.id)
      onClose()
    }
  }

  return (
    <Modal open={open} title={t('group.manage')} onClose={onClose}>
      <div className="space-y-4">
        {/* Nombre */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label={t('group.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isAdmin}
            />
          </div>
          {isAdmin && (
            <Button onClick={handleRename} disabled={!name.trim()}>
              {t('common.save')}
            </Button>
          )}
        </div>

        {/* Miembros */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-content-muted">
            {t('group.membersTitle', { count: chat.participants.length })}
          </p>
          <ul className="max-h-44 space-y-1 overflow-y-auto">
            {chat.participants.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-variant"
              >
                <Avatar src={p.avatar} name={p.name || p.username} size={28} />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {p.name || `@${p.username}`}
                  {p.id === user?.id && ` (${t('group.you')})`}
                </span>
                {p.role === 'admin' && (
                  <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    admin
                  </span>
                )}
                {isAdmin && p.id !== user?.id && (
                  <button
                    onClick={() => removeMember(chat.id, p.id)}
                    className="text-content-muted hover:text-danger"
                    title={t('group.remove')}
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Agregar miembros (solo admin) */}
        {isAdmin && (
          <div>
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={t('group.addMembers')}
              className="text-sm"
            />
            {term.trim() && candidates.length > 0 && (
              <ul className="mt-2 max-h-36 overflow-y-auto rounded-xl border border-outline">
                {candidates.map((u) => (
                  <li key={u.id}>
                    <button
                      onClick={() => handleAdd(u)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-variant"
                    >
                      <Avatar src={u.avatar} name={u.name || u.username} size={24} />
                      {u.name || `@${u.username}`}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Button variant="danger" fullWidth onClick={handleLeave}>
          {t('group.leave')}
        </Button>
      </div>
    </Modal>
  )
}
