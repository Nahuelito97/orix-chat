import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socketService } from '../../../services/socket.service'
import { chatsService } from '../../../services/chats.service'
import { queryKeys } from '../../../lib/queryKeys'
import { useChatStore } from '../store/chatStore'
import { useOutboxStore } from '../../offline/store/outboxStore'
import type { ChatSummary, UserMini } from '../../../types'

export function useChatActions() {
  const queryClient = useQueryClient()
  const openChatInStore = useChatStore((s) => s.openChat)
  const closeChatInStore = useChatStore((s) => s.closeChat)

  const openChat = useCallback(
    async (chat: ChatSummary) => {
      openChatInStore(chat)
      const socket = socketService.get()
      socket?.emit('chat:join', { chatId: chat.id })

      // Aseguramos el historial (primera página) en cache y marcamos leído.
      await queryClient.ensureInfiniteQueryData({
        queryKey: queryKeys.messages(chat.id),
        queryFn: ({ pageParam }) =>
          chatsService.messages(chat.id, pageParam ?? undefined),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (last: { nextCursor: string | null }) =>
          last.nextCursor ?? undefined,
      })
      socket?.emit('read', { chatId: chat.id })

      // Optimista: este chat queda sin no-leídos en la lista.
      queryClient.setQueryData<ChatSummary[]>(queryKeys.chats, (old) =>
        old?.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c)),
      )
    },
    [openChatInStore, queryClient],
  )

  const closeChat = useCallback(() => {
    const active = useChatStore.getState().activeChat
    if (active) socketService.get()?.emit('chat:leave', { chatId: active.id })
    closeChatInStore()
  }, [closeChatInStore])

  /** Refresca la lista de chats y abre el que tenga ese id. */
  const openChatById = useCallback(
    async (id: string) => {
      const list = await chatsService.list()
      queryClient.setQueryData(queryKeys.chats, list)
      const chat = list.find((c) => c.id === id)
      if (chat) await openChat(chat)
    },
    [openChat, queryClient],
  )

  const openChatWithUser = useCallback(
    async (other: UserMini) => {
      const { id } = await chatsService.createDirect(other.id)
      await openChatById(id)
    },
    [openChatById],
  )

  const sendMessage = useCallback(
    (input: {
      text?: string
      image?: string
      audioUrl?: string
      fileUrl?: string
      fileName?: string
      replyToId?: string
    }) => {
      const active = useChatStore.getState().activeChat
      if (!active) return
      const socket = socketService.get()
      const payload = { chatId: active.id, ...input }
      if (socket?.connected) {
        socket.emit('message:send', payload)
      } else {
        // Sin conexión: a la cola, se envía al reconectar.
        useOutboxStore.getState().enqueue(payload)
      }
    },
    [],
  )

  /** Reenvía el contenido de un mensaje a otro chat. */
  const forwardMessage = useCallback(
    (toChatId: string, msg: { text?: string | null; image?: string | null; fileUrl?: string | null; fileName?: string | null }) => {
      socketService.get()?.emit('message:send', {
        chatId: toChatId,
        text: msg.text ?? undefined,
        image: msg.image ?? undefined,
        fileUrl: msg.fileUrl ?? undefined,
        fileName: msg.fileName ?? undefined,
      })
    },
    [],
  )

  const pinMessage = useCallback((messageId: string) => {
    socketService.get()?.emit('message:pin', { messageId })
  }, [])

  const toggleMute = useCallback((chatId: string) => {
    socketService.get()?.emit('chat:mute', { chatId })
  }, [])

  const togglePinChat = useCallback((chatId: string) => {
    socketService.get()?.emit('chat:pin', { chatId })
  }, [])

  const toggleArchiveChat = useCallback((chatId: string) => {
    socketService.get()?.emit('chat:archive', { chatId })
  }, [])

  const editMessage = useCallback((messageId: string, text: string) => {
    socketService.get()?.emit('message:edit', { messageId, text })
  }, [])

  const deleteMessage = useCallback((messageId: string) => {
    socketService.get()?.emit('message:delete', { messageId })
  }, [])

  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    socketService.get()?.emit('reaction:toggle', { messageId, emoji })
  }, [])

  const setTyping = useCallback((typing: boolean) => {
    const active = useChatStore.getState().activeChat
    if (!active) return
    socketService.get()?.emit('typing', { chatId: active.id, typing })
  }, [])

  return {
    openChat,
    openChatById,
    closeChat,
    openChatWithUser,
    sendMessage,
    forwardMessage,
    pinMessage,
    toggleMute,
    togglePinChat,
    toggleArchiveChat,
    editMessage,
    deleteMessage,
    toggleReaction,
    setTyping,
  }
}
