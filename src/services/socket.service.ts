import { io, type Socket } from 'socket.io-client'
import { auth } from '../config/firebase'
import { env } from '../config/env'
import type { ChatMessage, ReadReceipt } from '../types'

/** Eventos que el servidor empuja al cliente. */
export interface ServerEvents {
  'message:new': (msg: ChatMessage) => void
  'message:update': (msg: ChatMessage) => void
  presence: (p: { userId: string; online: boolean; at: number }) => void
  typing: (p: { chatId: string; userId: string; typing: boolean }) => void
  read: (receipt: ReadReceipt) => void
  delivered: (receipt: {
    chatId: string
    userId: string
    lastDeliveredAt: string
  }) => void
  'chat:bump': (p: { chatId: string }) => void
  'chat:gone': (p: { chatId: string }) => void
}

/** Eventos que el cliente emite al servidor. */
export interface ClientEvents {
  'chat:join': (p: { chatId: string }) => void
  'chat:leave': (p: { chatId: string }) => void
  'message:send': (p: {
    chatId: string
    text?: string
    image?: string
    audioUrl?: string
    fileUrl?: string
    fileName?: string
    replyToId?: string
  }) => void
  'message:edit': (p: { messageId: string; text: string }) => void
  'message:delete': (p: { messageId: string }) => void
  'message:pin': (p: { messageId: string }) => void
  'reaction:toggle': (p: { messageId: string; emoji: string }) => void
  typing: (p: { chatId: string; typing: boolean }) => void
  read: (p: { chatId: string }) => void
  delivered: (p: { chatId: string }) => void
  'chat:mute': (p: { chatId: string }) => void
  'group:update': (p: { chatId: string; name?: string; avatar?: string }) => void
  'group:addMembers': (p: { chatId: string; memberIds: string[] }) => void
  'group:removeMember': (p: { chatId: string; userId: string }) => void
  'chat:leaveGroup': (p: { chatId: string }) => void
  'chat:delete': (p: { chatId: string }) => void
}

export type AppSocket = Socket<ServerEvents, ClientEvents>

let socket: AppSocket | null = null

export const socketService = {
  async connect(): Promise<AppSocket> {
    if (socket?.connected) return socket
    const token = await auth.currentUser?.getIdToken()
    socket = io(env.api.socketUrl, {
      auth: { token },
      transports: ['websocket'],
    })
    return socket
  },

  get(): AppSocket | null {
    return socket
  },

  disconnect() {
    socket?.disconnect()
    socket = null
  },
}
