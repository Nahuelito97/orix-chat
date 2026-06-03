import { useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../components/ui/Button'
import EmojiPicker from './EmojiPicker'

interface Props {
  value: string
  editing: boolean
  uploading: boolean
  onChange: (value: string) => void
  onSubmit: () => void
  onPickImage: (file: File) => void
  onPickFile: (file: File) => void
}

export default function MessageComposer({
  value,
  editing,
  uploading,
  onChange,
  onSubmit,
  onPickImage,
  onPickFile,
}: Props) {
  const { t } = useTranslation()
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter envía; Shift+Enter hace salto de línea.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
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

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onPickImage(file)
  }

  function handleAttachment(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onPickFile(file)
  }

  function insertEmoji(emoji: string) {
    onChange(value + emoji)
    setEmojiOpen(false)
    textareaRef.current?.focus()
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
      className={`relative flex items-end gap-2 border-t bg-surface px-3 py-3 ${
        dragging ? 'border-primary bg-primary/5' : 'border-outline'
      }`}
    >
      <button
        type="button"
        onClick={() => setEmojiOpen((o) => !o)}
        className="rounded-lg px-2 py-1.5 text-xl text-content-muted hover:text-primary"
        title="Emojis"
      >
        😊
      </button>
      {emojiOpen && (
        <EmojiPicker onSelect={insertEmoji} onClose={() => setEmojiOpen(false)} />
      )}

      <label className="cursor-pointer rounded-lg px-2 py-1.5 text-xl text-content-muted hover:text-primary" title="Imagen">
        🖼️
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleImage}
          disabled={uploading}
        />
      </label>

      <label className="cursor-pointer rounded-lg px-2 py-1.5 text-xl text-content-muted hover:text-primary" title="Archivo">
        📎
        <input
          type="file"
          hidden
          onChange={handleAttachment}
          disabled={uploading}
        />
      </label>

      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          autoResize(e.target)
        }}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={
          uploading ? t('chat.uploadingImage') : t('chat.messagePlaceholder')
        }
        className="flex-1 resize-none rounded-xl border border-outline bg-bg px-3.5 py-2.5 text-sm outline-none placeholder:text-inactive focus:border-primary"
      />

      <Button type="submit" disabled={uploading || !value.trim()}>
        {editing ? t('common.save') : t('chat.send')}
      </Button>
    </form>
  )
}
