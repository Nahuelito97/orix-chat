import { useTranslation } from 'react-i18next'
import Avatar from '../../../components/ui/Avatar'
import type { UserMini } from '../../../types'

interface Props {
  loading: boolean
  results: UserMini[]
  onPick: (u: UserMini) => void
}

export default function UserSearchResults({ loading, results, onPick }: Props) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <p className="px-4 py-6 text-center text-sm text-content-muted">
        {t('chat.searching')}
      </p>
    )
  }
  if (results.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-content-muted">
        {t('chat.noUserFound')}
      </p>
    )
  }
  return (
    <ul>
      {results.map((u) => (
        <li key={u.id}>
          <button
            onClick={() => onPick(u)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-variant"
          >
            <Avatar src={u.avatar} name={u.name || u.username} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">
                {u.name || `@${u.username}`}
              </span>
              <span className="block truncate text-sm text-primary">
                {t('chat.openChat')}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
