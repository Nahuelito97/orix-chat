import type { ChatSummary, UserMini } from '../../../types'

const ONLINE_THRESHOLD = 70_000 // ms

interface PresenceState {
  online: boolean
  at: number
}

/** ¿Está en línea? Usa presencia en vivo y cae al lastSeen como respaldo. */
export function isUserOnline(
  user: UserMini | null | undefined,
  presence: Record<string, PresenceState>,
): boolean {
  if (!user) return false
  const live = presence[user.id]
  if (live) return live.online
  if (!user.lastSeen) return false
  return Date.now() - new Date(user.lastSeen).getTime() < ONLINE_THRESHOLD
}

/** Nombre a mostrar para un chat (grupo, 1-a-1 o uno mismo). */
export function chatTitle(chat: ChatSummary, fallback = '...'): string {
  if (chat.isSelf) return 'Mensajes guardados'
  if (chat.isGroup) return chat.name || 'Grupo'
  return chat.other?.name || `@${chat.other?.username ?? fallback}`
}

/** Avatar a mostrar para un chat. */
export function chatAvatar(chat: ChatSummary): string | undefined {
  if (chat.isSelf) return chat.participants[0]?.avatar
  return chat.isGroup ? (chat.avatar ?? undefined) : chat.other?.avatar
}

/** Hora local HH:MM a partir de un ISO. */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Para la lista: hora si es hoy, fecha corta si no. */
export function formatListTime(iso: string): string {
  const d = new Date(iso)
  const sameDay = d.toDateString() === new Date().toDateString()
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
}
