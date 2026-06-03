import { create } from 'zustand'
import type { ChatSummary } from '../../../types'

interface PresenceState {
  online: boolean
  at: number
}

interface ChatStore {
  /** Chat abierto actualmente (null = ninguno). */
  activeChat: ChatSummary | null
  /** Presencia en vivo por userId. */
  presence: Record<string, PresenceState>
  /** "Escribiendo…" por userId (en el chat activo). */
  typingUsers: Record<string, boolean>
  /** lastReadAt por userId (en el chat activo). */
  reads: Record<string, string>
  /** lastDeliveredAt por userId (en el chat activo). */
  deliveries: Record<string, string>

  openChat: (chat: ChatSummary) => void
  closeChat: () => void
  setPresence: (userId: string, online: boolean, at: number) => void
  setTyping: (userId: string, typing: boolean) => void
  setRead: (userId: string, lastReadAt: string) => void
  setDelivered: (userId: string, lastDeliveredAt: string) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  activeChat: null,
  presence: {},
  typingUsers: {},
  reads: {},
  deliveries: {},

  // Al abrir un chat reseteamos lo "scopeado" al chat anterior.
  openChat: (chat) =>
    set({ activeChat: chat, typingUsers: {}, reads: {}, deliveries: {} }),
  closeChat: () =>
    set({ activeChat: null, typingUsers: {}, reads: {}, deliveries: {} }),

  setPresence: (userId, online, at) =>
    set((s) => ({ presence: { ...s.presence, [userId]: { online, at } } })),
  setTyping: (userId, typing) =>
    set((s) => ({ typingUsers: { ...s.typingUsers, [userId]: typing } })),
  setRead: (userId, lastReadAt) =>
    set((s) => ({ reads: { ...s.reads, [userId]: lastReadAt } })),
  setDelivered: (userId, lastDeliveredAt) =>
    set((s) => ({
      deliveries: { ...s.deliveries, [userId]: lastDeliveredAt },
    })),
}))
