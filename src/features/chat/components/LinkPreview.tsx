import { useQuery } from '@tanstack/react-query'
import { linksService } from '../../../services/links.service'

/** Tarjeta de previsualización de un link (Open Graph). */
export default function LinkPreview({ url }: { url: string }) {
  const { data } = useQuery({
    queryKey: ['linkPreview', url],
    queryFn: () => linksService.preview(url),
    staleTime: 60 * 60 * 1000,
    retry: false,
  })

  // Sin título ni imagen no mostramos nada.
  if (!data || (!data.title && !data.image)) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-1 block overflow-hidden rounded-lg border border-outline bg-bg/40 no-underline"
    >
      {data.image && (
        <img src={data.image} alt="" className="max-h-32 w-full object-cover" />
      )}
      <div className="px-2 py-1.5">
        {data.title && (
          <p className="truncate text-xs font-semibold">{data.title}</p>
        )}
        {data.description && (
          <p className="line-clamp-2 text-[11px] text-content-muted">
            {data.description}
          </p>
        )}
      </div>
    </a>
  )
}
