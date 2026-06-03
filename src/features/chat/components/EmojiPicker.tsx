const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '😘',
  '😜', '🤪', '🤔', '🤨', '😎', '🥳', '😏', '😢', '😭', '😤',
  '😡', '🥺', '😳', '😱', '😴', '🤤', '🤯', '🤗', '🤫', '🙄',
  '😬', '😈', '👍', '👎', '👏', '🙌', '🙏', '💪', '🤝', '✌️',
  '👌', '🤙', '🔥', '✨', '⭐', '🎉', '❤️', '🧡', '💛', '💚',
  '💙', '💜', '🖤', '💔', '💯', '👀', '🎁', '☕', '🍕', '⚽',
]

interface Props {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export default function EmojiPicker({ onSelect, onClose }: Props) {
  return (
    <div
      className="absolute bottom-14 left-2 z-20 grid max-h-52 w-64 grid-cols-8 gap-1 overflow-y-auto rounded-xl border border-outline bg-surface p-2 shadow-xl"
      onMouseLeave={onClose}
    >
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onSelect(e)}
          className="rounded text-lg transition hover:scale-125 hover:bg-surface-variant"
        >
          {e}
        </button>
      ))}
    </div>
  )
}
