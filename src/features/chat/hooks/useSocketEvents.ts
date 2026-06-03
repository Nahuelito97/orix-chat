import { useEffect } from 'react'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { socketService } from '../../../services/socket.service'
import { queryKeys } from '../../../lib/queryKeys'
import { useAuthStore } from '../../auth/store/authStore'
import { useChatStore } from '../store/chatStore'
import { useSettingsStore } from '../../settings/store/settingsStore'
import { useOutboxStore } from '../../offline/store/outboxStore'
import { notificationsService } from '../../../services/notifications.service'
import type { MessagePage } from './useMessages'
import type { ChatMessage } from '../../../types'

/**
 * Conecta el socket y traduce sus eventos a:
 *  - mutaciones de la cache de TanStack Query (mensajes, lista de chats)
 *  - estado de Zustand (presencia, typing, recibos de lectura)
 * Se monta una sola vez dentro del árbol autenticado.
 */
export function useSocketEvents() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let cleanup = () => {}

    void socketService.connect().then((socket) => {
      const onNew = (msg: ChatMessage) => {
        // Insertamos al frente de la primera página (la de los más nuevos).
        queryClient.setQueryData<InfiniteData<MessagePage>>(
          queryKeys.messages(msg.chatId),
          (old) => {
            if (!old || old.pages.length === 0) return old
            const [first, ...rest] = old.pages
            if (first.messages.some((m) => m.id === msg.id)) return old
            return {
              ...old,
              pages: [
                { ...first, messages: [msg, ...first.messages] },
                ...rest,
              ],
            }
          },
        )
        void queryClient.invalidateQueries({ queryKey: queryKeys.chats })

        const { activeChat } = useChatStore.getState()
        const uid = useAuthStore.getState().uid
        const fromOther = msg.sender.id !== uid

        if (fromOther) {
          // Confirmamos entrega siempre (aunque el chat no esté abierto).
          socket.emit('delivered', { chatId: msg.chatId })
          // Y lectura si lo tengo abierto.
          if (activeChat?.id === msg.chatId) {
            socket.emit('read', { chatId: msg.chatId })
          }
        }

        // ¿El chat está silenciado? (lo miramos en la cache de chats)
        const chats = queryClient.getQueryData<{ id: string; muted: boolean }[]>(
          queryKeys.chats,
        )
        const muted = chats?.find((c) => c.id === msg.chatId)?.muted

        // Notificación + sonido si llega de otro, en background y no muteado.
        if (fromOther && document.hidden && !muted) {
          const { notifications, sound } = useSettingsStore.getState()
          const name = msg.sender.name || `@${msg.sender.username}`
          const body = msg.text ?? (msg.fileUrl ? '📎' : '📷')
          if (notifications) notificationsService.notify(name, body)
          if (sound) notificationsService.beep()
        }
      }

      const onUpdate = (msg: ChatMessage) => {
        queryClient.setQueryData<InfiniteData<MessagePage>>(
          queryKeys.messages(msg.chatId),
          (old) =>
            old
              ? {
                  ...old,
                  pages: old.pages.map((p) => ({
                    ...p,
                    messages: p.messages.map((m) =>
                      m.id === msg.id ? msg : m,
                    ),
                  })),
                }
              : old,
        )
      }

      const onPresence = (p: {
        userId: string
        online: boolean
        at: number
      }) => useChatStore.getState().setPresence(p.userId, p.online, p.at)

      const onTyping = (p: {
        chatId: string
        userId: string
        typing: boolean
      }) => {
        if (useChatStore.getState().activeChat?.id === p.chatId) {
          useChatStore.getState().setTyping(p.userId, p.typing)
        }
      }

      const onRead = (r: {
        chatId: string
        userId: string
        lastReadAt: string
      }) => {
        if (useChatStore.getState().activeChat?.id === r.chatId) {
          useChatStore.getState().setRead(r.userId, r.lastReadAt)
        }
      }

      const onDelivered = (r: {
        chatId: string
        userId: string
        lastDeliveredAt: string
      }) => {
        if (useChatStore.getState().activeChat?.id === r.chatId) {
          useChatStore.getState().setDelivered(r.userId, r.lastDeliveredAt)
        }
      }

      const onBump = () =>
        void queryClient.invalidateQueries({ queryKey: queryKeys.chats })

      // Conexión: marca online y vacía la cola offline.
      const onConnect = () => {
        useOutboxStore.getState().setOnline(true)
        const { queue, clear } = useOutboxStore.getState()
        queue.forEach((msg) => socket.emit('message:send', msg))
        if (queue.length) clear()
      }
      const onDisconnect = () => useOutboxStore.getState().setOnline(false)

      const onGone = ({ chatId }: { chatId: string }) => {
        // Si tenía ese chat abierto, lo cierro.
        if (useChatStore.getState().activeChat?.id === chatId) {
          useChatStore.getState().closeChat()
        }
        void queryClient.invalidateQueries({ queryKey: queryKeys.chats })
      }

      socket.on('message:new', onNew)
      socket.on('message:update', onUpdate)
      socket.on('presence', onPresence)
      socket.on('typing', onTyping)
      socket.on('read', onRead)
      socket.on('delivered', onDelivered)
      socket.on('chat:bump', onBump)
      socket.on('chat:gone', onGone)
      socket.on('connect', onConnect)
      socket.on('disconnect', onDisconnect)
      if (socket.connected) onConnect()

      cleanup = () => {
        socket.off('message:new', onNew)
        socket.off('message:update', onUpdate)
        socket.off('presence', onPresence)
        socket.off('typing', onTyping)
        socket.off('read', onRead)
        socket.off('delivered', onDelivered)
        socket.off('chat:bump', onBump)
        socket.off('chat:gone', onGone)
        socket.off('connect', onConnect)
        socket.off('disconnect', onDisconnect)
      }
    })

    return () => cleanup()
  }, [queryClient])
}
