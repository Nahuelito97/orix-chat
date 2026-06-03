import {
  useState,
  type ClipboardEvent,
  type DragEvent,
  type KeyboardEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import Button from '../../../components/ui/Button'
import EmojiPicker from './EmojiPicker'
import GifPicker from './GifPicker'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import type { UserMini } from '../../../types'

interface Props {
  value: string
  editing: boolean
  uploading: boolean
  temporary: boolean
  mentionables: UserMini[]
  onChange: (value: string) => void
  onSubmit: () => void
  onPickImage: (file: File) => void
  onPickFile: (file: File) => void
  onPickGif: (url: string) => void
  onSendVoice: (blob: Blob) => void
  onToggleTemporary: () => void
}

export default function MessageComposer({
  value,
  editing,
  uploading,
  temporary,
  mentionables,
  onChange,
  onSubmit,
  onPickImage,
  onPickFile,
  onPickGif,
  onSendVoice,
  onToggleTemporary,
}: Props) {
  const { t } = useTranslation()
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [gifOpen, setGifOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const recorder = useVoiceRecorder()

  // Autocompletado de menciones: detecta @palabra al final del texto.
  const mentionMatch = value.match(/@([a-zA-Z0-9_]*)$/)
  const mentionQuery = mentionMatch?.[1].toLowerCase() ?? null
  const mentionOptions =
    mentionQuery !== null
      ? mentionables
          .filter((u) => u.username.toLowerCase().startsWith(mentionQuery))
          .slice(0, 5)
      : []

  function pickMention(username: string) {
    onChange(value.replace(/@([a-zA-Z0-9_]*)$/, `@${username} `))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }

  function firstImage(files?: FileList | null): File | undefined {
    if (!files) return undefined
    return Array.from(files).find((f) => f.type.startsWith('image/'))
  }

  function handleDrop(e: DragEvent<HTMLFormElement>) {
    e.preventDefault()
    setDragging(false)
    const file = firstImage(e.dataTransfer.files)
    if (file) onPickImage(file)
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const file = firstImage(e.clipboardData.files)
    if (file) {
      e.preventDefault()
      onPickImage(file)
    }
  }

  async function startRecording() {
    const ok = await recorder.start()
    if (!ok) toast.error(t('chat.micDenied'))
  }

  async function stopAndSend() {
    const blob = await recorder.stop()
    if (blob) onSendVoice(blob)
  }

  // ── Barra de grabación de voz ──
  if (recorder.recording) {
    const mm = String(Math.floor(recorder.seconds / 60)).padStart(2, '0')
    const ss = String(recorder.seconds % 60).padStart(2, '0')
    return (
      <div className="flex items-center gap-3 border-t border-outline bg-surface px-4 py-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-danger" />
        <span className="flex-1 font-mono text-sm">
          {t('chat.recording')} {mm}:{ss}
        </span>
        <button
          onClick={recorder.cancel}
          className="rounded-lg px-3 py-1.5 text-sm text-content-muted hover:text-danger"
        >
          {t('common.cancel')}
        </button>
        <Button onClick={stopAndSend}>{t('chat.send')}</Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative flex items-end gap-1 border-t bg-surface px-3 py-3 ${
        dragging ? 'border-primary bg-primary/5' : 'border-outline'
      }`}
    >
      {mentionOptions.length > 0 && (
        <div className="absolute bottom-full left-3 mb-1 w-56 overflow-hidden rounded-xl border border-outline bg-surface shadow-xl">
          {mentionOptions.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => pickMention(u.username)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-variant"
            >
              <span className="font-medium">@{u.username}</span>
              {u.name ? <span className="text-content-muted"> · {u.name}</span> : null}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setEmojiOpen((o) => !o)}
        className="rounded-lg px-1.5 py-1.5 text-xl text-content-muted hover:text-primary"
        title="Emojis"
      >
        😊
      </button>
      {emojiOpen && (
        <EmojiPicker
          onSelect={(e) => {
            onChange(value + e)
            setEmojiOpen(false)
          }}
          onClose={() => setEmojiOpen(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setGifOpen((o) => !o)}
        className="rounded-lg px-1.5 py-1.5 text-xs font-bold text-content-muted hover:text-primary"
        title="GIF"
      >
        GIF
      </button>
      {gifOpen && (
        <GifPicker
          onPick={(url) => {
            onPickGif(url)
            setGifOpen(false)
          }}
          onClose={() => setGifOpen(false)}
        />
      )}

      <label className="cursor-pointer rounded-lg px-1.5 py-1.5 text-xl text-content-muted hover:text-primary" title="Imagen">
        🖼️
        <input type="file" accept="image/*" hidden disabled={uploading} onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) onPickImage(f)
        }} />
      </label>

      <label className="cursor-pointer rounded-lg px-1.5 py-1.5 text-xl text-content-muted hover:text-primary" title="Archivo">
        📎
        <input type="file" hidden disabled={uploading} onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) onPickFile(f)
        }} />
      </label>

      <button
        type="button"
        onClick={onToggleTemporary}
        title={t('chat.temporary')}
        className={`rounded-lg px-1.5 py-1.5 text-xl transition ${
          temporary ? 'text-primary' : 'text-content-muted hover:text-primary'
        }`}
      >
        ⏱
      </button>

      <textarea
        rows={1}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          autoResize(e.target)
        }}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={uploading ? t('chat.uploadingImage') : t('chat.messagePlaceholder')}
        className="flex-1 resize-none rounded-xl border border-outline bg-bg px-3.5 py-2.5 text-sm outline-none placeholder:text-inactive focus:border-primary"
      />

      {value.trim() || editing ? (
        <Button type="submit" disabled={uploading}>
          {editing ? t('common.save') : t('chat.send')}
        </Button>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="rounded-lg px-2 py-1.5 text-xl text-content-muted hover:text-primary"
          title={t('chat.recordVoice')}
        >
          🎙️
        </button>
      )}
    </form>
  )
}
