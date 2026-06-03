import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Avatar from '../../../components/ui/Avatar'
import { useUserSearch } from '../hooks/useUserSearch'
import { useCreateGroup } from '../hooks/useCreateGroup'
import { useChatActions } from '../hooks/useChatActions'
import type { UserMini } from '../../../types'

interface Props {
  open: boolean
  onClose: () => void
}

export default function NewGroupModal({ open, onClose }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [term, setTerm] = useState('')
  const [members, setMembers] = useState<UserMini[]>([])
  const search = useUserSearch(term)
  const createGroup = useCreateGroup()
  const { openChatById } = useChatActions()

  function toggleMember(user: UserMini) {
    setMembers((prev) =>
      prev.some((m) => m.id === user.id)
        ? prev.filter((m) => m.id !== user.id)
        : [...prev, user],
    )
  }

  function reset() {
    setName('')
    setTerm('')
    setMembers([])
  }

  async function handleCreate() {
    if (!name.trim() || members.length === 0 || createGroup.isPending) return
    try {
      const { id } = await createGroup.mutateAsync({
        name: name.trim(),
        memberIds: members.map((m) => m.id),
      })
      reset()
      onClose()
      await openChatById(id)
    } catch {
      toast.error(t('group.error'))
    }
  }

  const results = (search.data ?? []).filter(
    (u) => !members.some((m) => m.id === u.id),
  )

  return (
    <Modal
      open={open}
      title={t('group.title')}
      onClose={() => {
        reset()
        onClose()
      }}
    >
      <div className="space-y-4">
        <Input
          label={t('group.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('group.namePlaceholder')}
        />

        {/* Miembros seleccionados (chips) */}
        {members.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => toggleMember(m)}
                className="flex items-center gap-1.5 rounded-full border border-primary bg-primary/15 py-1 pl-1 pr-2 text-sm"
              >
                <Avatar src={m.avatar} name={m.name || m.username} size={20} />
                {m.name || `@${m.username}`} ✕
              </button>
            ))}
          </div>
        )}

        <div>
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={t('group.addMembers')}
            className="text-sm"
          />
          {term.trim() && (
            <ul className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-outline">
              {results.length === 0 ? (
                <li className="px-3 py-2 text-sm text-content-muted">
                  {t('chat.noUserFound')}
                </li>
              ) : (
                results.map((u) => (
                  <li key={u.id}>
                    <button
                      onClick={() => toggleMember(u)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-variant"
                    >
                      <Avatar src={u.avatar} name={u.name || u.username} size={28} />
                      {u.name || `@${u.username}`}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <Button
          fullWidth
          onClick={handleCreate}
          disabled={!name.trim() || members.length === 0 || createGroup.isPending}
        >
          {createGroup.isPending
            ? t('common.loading')
            : t('group.create', { count: members.length })}
        </Button>
      </div>
    </Modal>
  )
}
