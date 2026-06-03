/** Perfil de usuario (espejo de la tabla User del backend). */
export interface UserData {
  id: string
  username: string
  name: string
  email: string
  bio: string
  avatar: string
  lastSeen: string // ISO date
}

/** Resumen mínimo de un usuario (sender, participantes…). */
export interface UserMini {
  id: string
  username: string
  name: string
  avatar?: string
  lastSeen?: string
}

/** Participante de un chat: usuario + rol. */
export interface Participant extends UserMini {
  role: 'admin' | 'member'
}

/** Reacción agrupada por emoji. */
export interface Reaction {
  emoji: string
  count: number
  userIds: string[]
}

/** Cita de un mensaje al que se responde. */
export interface ReplyPreview {
  id: string
  text: string | null
  image: string | null
  deleted: boolean
  sender: UserMini
}

/** Mensaje tal como lo devuelve el backend (REST y socket). */
export interface ChatMessage {
  id: string
  chatId: string
  sender: UserMini
  text: string | null
  image: string | null
  audioUrl: string | null
  fileUrl: string | null
  fileName: string | null
  pinned: boolean
  deleted: boolean
  edited: boolean
  expiresAt: string | null
  createdAt: string // ISO
  replyTo: ReplyPreview | null
  reactions: Reaction[]
}

/** Resumen de un chat para la lista lateral. */
export interface ChatSummary {
  id: string
  isGroup: boolean
  isSelf: boolean
  name: string | null
  avatar: string | null
  createdBy: string | null
  myRole: 'admin' | 'member'
  muted: boolean
  pinned: boolean
  archived: boolean
  updatedAt: string
  participants: Participant[]
  /** El otro usuario en chats 1-a-1 (null en grupos). */
  other: UserMini | null
  lastMessage: {
    text: string | null
    deleted: boolean
    createdAt: string
    senderId: string
  } | null
  unread: number
}

/** Recibo de lectura emitido por socket. */
export interface ReadReceipt {
  chatId: string
  userId: string
  lastReadAt: string
}
