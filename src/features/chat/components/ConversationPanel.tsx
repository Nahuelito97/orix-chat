import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { uploadFile } from '../../../services/storage.service'
import { useAuth } from '../../auth/hooks/useAuth'
import { useMessages } from '../hooks/useMessages'
import { useChatActions } from '../hooks/useChatActions'
import { useChatStore } from '../store/chatStore'
import { isUserOnline } from '../utils/chat'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import ReplyBar from './ReplyBar'
import MessageComposer from './MessageComposer'
import MessageSearch from './MessageSearch'
import ForwardModal from './ForwardModal'
import Modal from '../../../components/ui/Modal'
import { callService } from '../../../services/call.service'
import { aiService } from '../../../services/ai.service'
import type { ChatMessage } from '../../../types'

export default function ConversationPanel() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const activeChat = useChatStore((s) => s.activeChat)
  const typingUsers = useChatStore((s) => s.typingUsers)
  const reads = useChatStore((s) => s.reads)
  const deliveries = useChatStore((s) => s.deliveries)
  const presence = useChatStore((s) => s.presence)
  const {
    closeChat,
    sendMessage,
    forwardMessage,
    pinMessage,
    toggleMute,
    editMessage,
    deleteMessage,
    toggleReaction,
    setTyping,
  } = useChatActions()
  const { messages, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessages(activeChat?.id)

  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [editing, setEditing] = useState<ChatMessage | null>(null)
  const [uploading, setUploading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [forwarding, setForwarding] = useState<ChatMessage | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [summarizing, setSummarizing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [temporary, setTemporary] = useState(false)
  const TEMP_TTL = 300 // 5 min
  const ttl = () => (temporary ? TEMP_TTL : undefined)
  const lastTypingWrite = useRef(0)
  const typingOffTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  if (!activeChat || !user) {
    return (
      <div className="hidden h-full flex-col items-center justify-center gap-3 bg-surface-variant/30 sm:flex">
        <span className="text-5xl">💬</span>
        <p className="text-content-muted">{t('chat.chooseChat')}</p>
      </div>
    )
  }

  const other = activeChat.other
  const online = !activeChat.isGroup && isUserOnline(other, presence)
  const someoneTyping = Object.entries(typingUsers).some(
    ([id, v]) => v && id !== user.id,
  )

  function handleType(value: string) {
    setText(value)
    const now = Date.now()
    if (now - lastTypingWrite.current > 1500) {
      lastTypingWrite.current = now
      setTyping(true)
    }
    clearTimeout(typingOffTimer.current)
    typingOffTimer.current = setTimeout(() => setTyping(false), 2500)
  }

  function submit() {
    const value = text.trim()
    if (!value) return
    if (editing) {
      editMessage(editing.id, value)
      setEditing(null)
    } else {
      sendMessage({ text: value, replyToId: replyTo?.id, ttlSeconds: ttl() })
      setReplyTo(null)
    }
    setText('')
    setTyping(false)
  }

  async function pickImage(file: File) {
    setUploading(true)
    try {
      const url = await uploadFile(file, 'messages')
      sendMessage({ image: url, replyToId: replyTo?.id, ttlSeconds: ttl() })
      setReplyTo(null)
    } catch {
      toast.error(t('chat.imageError'))
    } finally {
      setUploading(false)
    }
  }

  async function pickAttachment(file: File) {
    setUploading(true)
    try {
      const url = await uploadFile(file, 'files')
      sendMessage({
        fileUrl: url,
        fileName: file.name,
        replyToId: replyTo?.id,
        ttlSeconds: ttl(),
      })
      setReplyTo(null)
    } catch {
      toast.error(t('chat.imageError'))
    } finally {
      setUploading(false)
    }
  }

  function pickGif(url: string) {
    sendMessage({ image: url, replyToId: replyTo?.id, ttlSeconds: ttl() })
    setReplyTo(null)
  }

  async function sendVoice(blob: Blob) {
    setUploading(true)
    try {
      const file = new File([blob], `voice-${Date.now()}.webm`, {
        type: 'audio/webm',
      })
      const url = await uploadFile(file, 'audio')
      sendMessage({ audioUrl: url, replyToId: replyTo?.id, ttlSeconds: ttl() })
      setReplyTo(null)
    } catch {
      toast.error(t('chat.imageError'))
    } finally {
      setUploading(false)
    }
  }

  function startEdit(msg: ChatMessage) {
    setEditing(msg)
    setReplyTo(null)
    setText(msg.text ?? '')
  }

  function cancelBar() {
    setEditing(null)
    setReplyTo(null)
    setText('')
  }

  async function summarizeChat() {
    if (!activeChat) return
    setSummary('')
    setSummarizing(true)
    try {
      const res = await aiService.summarize(activeChat.id, i18n.resolvedLanguage ?? 'es')
      setSummary(res.summary)
    } catch {
      setSummary(null)
      toast.error(t('ai.error'))
    } finally {
      setSummarizing(false)
    }
  }

  async function fetchSuggestions() {
    if (!activeChat) return
    try {
      const res = await aiService.suggest(activeChat.id, i18n.resolvedLanguage ?? 'es')
      setSuggestions(res.suggestions)
    } catch {
      toast.error(t('ai.error'))
    }
  }

  return (
    <div className="flex h-full flex-col bg-surface-variant/20">
      <ChatHeader
        chat={activeChat}
        online={online}
        someoneTyping={someoneTyping}
        onBack={closeChat}
        onSearch={() => setSearchOpen(true)}
        onToggleMute={() => toggleMute(activeChat.id)}
        onSummarize={summarizeChat}
        onCall={(video) => {
          if (other) {
            void callService.startCall(
              other.id,
              activeChat.id,
              other.name || `@${other.username}`,
              video,
            )
          }
        }}
      />
      {searchOpen ? (
        <MessageSearch chatId={activeChat.id} onClose={() => setSearchOpen(false)} />
      ) : (
        <>
          <MessageList
            messages={messages}
            myId={user.id}
            isGroup={activeChat.isGroup}
            otherLastRead={other ? reads[other.id] : undefined}
            otherLastDelivered={other ? deliveries[other.id] : undefined}
            hasMore={!!hasNextPage}
            isLoadingMore={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
            onReply={setReplyTo}
            onEdit={startEdit}
            onDelete={(m) => deleteMessage(m.id)}
            onReact={(m, emoji) => toggleReaction(m.id, emoji)}
            onPin={(m) => pinMessage(m.id)}
            onForward={(m) => setForwarding(m)}
          />
          {/* Sugerencias de IA */}
          <div className="flex flex-wrap items-center gap-2 border-t border-outline bg-surface px-3 py-2">
            <button
              onClick={fetchSuggestions}
              title={t('ai.suggest')}
              className="shrink-0 rounded-full border border-outline px-2 py-1 text-xs text-content-muted transition hover:border-primary hover:text-primary"
            >
              💡 {t('ai.suggest')}
            </button>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setText(s)
                  setSuggestions([])
                }}
                className="rounded-full bg-surface-variant px-3 py-1 text-xs transition hover:bg-primary/15"
              >
                {s}
              </button>
            ))}
          </div>

          <ReplyBar editing={editing} replyTo={replyTo} onCancel={cancelBar} />
          <MessageComposer
            value={text}
            editing={!!editing}
            uploading={uploading}
            temporary={temporary}
            mentionables={
              activeChat.isGroup
                ? activeChat.participants.filter((p) => p.id !== user.id)
                : []
            }
            onChange={handleType}
            onSubmit={submit}
            onPickImage={pickImage}
            onPickFile={pickAttachment}
            onPickGif={pickGif}
            onSendVoice={sendVoice}
            onToggleTemporary={() => setTemporary((v) => !v)}
          />
        </>
      )}

      <ForwardModal
        open={!!forwarding}
        onClose={() => setForwarding(null)}
        onPick={(chatId) => forwarding && forwardMessage(chatId, forwarding)}
      />

      <Modal
        open={summary !== null}
        title={t('ai.summaryTitle')}
        onClose={() => setSummary(null)}
      >
        {summarizing ? (
          <p className="text-content-muted">{t('ai.summarizing')}</p>
        ) : (
          <p className="whitespace-pre-wrap text-sm">{summary}</p>
        )}
      </Modal>
    </div>
  )
}
