import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useChats } from '../../chat/hooks/useChats'
import { useMessages } from '../../chat/hooks/useMessages'
import { useAuth } from '../../auth/hooks/useAuth'
import { socketService } from '../../../services/socket.service'
import { formatText } from '../../chat/utils/format'

/** Widget flotante de ayuda (OrixBot), abajo a la derecha. */
export default function BotWidget() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: chats = [] } = useChats()
  const botChat = chats.find(
    (c) => !c.isGroup && c.other?.username === 'orixbot',
  )

  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [botTyping, setBotTyping] = useState(false)
  const { messages } = useMessages(open ? botChat?.id : undefined)

  // Al abrir, nos unimos a la sala del chat del bot para recibir respuestas.
  useEffect(() => {
    if (!open || !botChat) return
    const socket = socketService.get()
    socket?.emit('chat:join', { chatId: botChat.id })
    const onTyping = (p: { chatId: string; userId: string; typing: boolean }) => {
      if (p.chatId === botChat.id && p.userId === 'orixbot') setBotTyping(p.typing)
    }
    socket?.on('typing', onTyping)
    return () => {
      socket?.off('typing', onTyping)
    }
  }, [open, botChat])

  function send(e: FormEvent) {
    e.preventDefault()
    const value = text.trim()
    if (!value || !botChat) return
    socketService.get()?.emit('message:send', { chatId: botChat.id, text: value })
    setText('')
  }

  return (
    <>
      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-outline bg-surface shadow-2xl shadow-black/30">
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-on-accent">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-on-accent/15 text-lg">
              🤖
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">OrixBot</p>
              <p className="text-xs opacity-80">
                {botTyping ? t('chat.typing') : t('bot.subtitle')}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-on-accent/80 hover:text-on-accent"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex flex-1 flex-col-reverse gap-2 overflow-y-auto bg-surface-variant/20 px-3 py-3">
            {botTyping && (
              <div className="mr-auto rounded-2xl rounded-bl-md bg-surface-variant px-3 py-2 text-sm text-content-muted">
                {t('chat.typing')}
              </div>
            )}
            {messages.map((m) => {
              const mine = m.sender.id === user?.id
              return (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? 'ml-auto rounded-br-md bg-primary/20 text-content'
                      : 'mr-auto rounded-bl-md bg-surface-variant text-content'
                  }`}
                >
                  {m.text ? formatText(m.text) : null}
                </div>
              )
            })}
            {messages.length === 0 && (
              <p className="m-auto text-center text-sm text-content-muted">
                {t('bot.empty')}
              </p>
            )}
          </div>

          {/* Input */}
          <form onSubmit={send} className="flex items-center gap-2 border-t border-outline bg-surface px-3 py-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('bot.placeholder')}
              className="flex-1 rounded-xl border border-outline bg-bg px-3 py-2 text-sm outline-none placeholder:text-inactive focus:border-primary"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-on-accent transition hover:bg-primary-pressed disabled:opacity-50"
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-2xl text-on-accent shadow-xl shadow-black/30 transition hover:bg-primary-pressed"
        aria-label={t('bot.help')}
        title={t('bot.help')}
      >
        {open ? '✕' : '🤖'}
      </button>
    </>
  )
}
