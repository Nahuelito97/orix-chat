import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { giphyService, type Gif } from '../../../services/giphy.service'
import { useDebounce } from '../../../hooks/useDebounce'

interface Props {
  onPick: (gifUrl: string) => void
  onClose: () => void
}

export default function GifPicker({ onPick, onClose }: Props) {
  const { t } = useTranslation()
  const [term, setTerm] = useState('')
  const [gifs, setGifs] = useState<Gif[]>([])
  const q = useDebounce(term, 400)

  useEffect(() => {
    if (!giphyService.enabled()) return
    let alive = true
    giphyService.search(q).then((res) => {
      if (alive) setGifs(res)
    })
    return () => {
      alive = false
    }
  }, [q])

  return (
    <div
      className="absolute bottom-14 left-2 z-20 w-72 rounded-xl border border-outline bg-surface p-2 shadow-xl"
      onMouseLeave={onClose}
    >
      {!giphyService.enabled() ? (
        <p className="p-3 text-center text-xs text-content-muted">
          {t('chat.gifDisabled')}
        </p>
      ) : (
        <>
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={t('chat.searchGifs')}
            className="mb-2 w-full rounded-lg border border-outline bg-bg px-2.5 py-1.5 text-sm outline-none focus:border-primary"
          />
          <div className="grid max-h-52 grid-cols-2 gap-1 overflow-y-auto">
            {gifs.map((g) => (
              <button key={g.id} onClick={() => onPick(g.url)} className="overflow-hidden rounded-lg">
                <img src={g.url} alt="gif" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
