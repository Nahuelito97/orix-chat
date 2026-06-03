interface AvatarProps {
  src?: string
  name?: string
  size?: number
  online?: boolean
}

/** Avatar con fallback a iniciales sobre fondo del tema. */
export default function Avatar({ src, name = '?', size = 40, online }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span
          className="grid h-full w-full place-items-center rounded-full bg-surface-variant font-semibold text-content"
          style={{ fontSize: size * 0.4 }}
        >
          {initials || '?'}
        </span>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface ${
            online ? 'bg-success' : 'bg-inactive'
          }`}
        />
      )}
    </span>
  )
}
