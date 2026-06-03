import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OutboxMessage {
  chatId: string
  text?: string
  image?: string
  audioUrl?: string
  fileUrl?: string
  fileName?: string
  replyToId?: string
}

interface OutboxStore {
  online: boolean
  queue: OutboxMessage[]
  setOnline: (online: boolean) => void
  enqueue: (msg: OutboxMessage) => void
  clear: () => void
}

export const useOutboxStore = create<OutboxStore>()(
  persist(
    (set) => ({
      online: true,
      queue: [],
      setOnline: (online) => set({ online }),
      enqueue: (msg) => set((s) => ({ queue: [...s.queue, msg] })),
      clear: () => set({ queue: [] }),
    }),
    { name: 'orixchat:outbox', partialize: (s) => ({ queue: s.queue }) },
  ),
)
