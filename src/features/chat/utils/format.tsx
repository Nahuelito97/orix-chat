import type { ReactNode } from 'react'

// Negrita, itálica, tachado, código inline y links autodetectados.
const TOKEN =
  /(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|`[^`\n]+`|https?:\/\/[^\s]+|@[a-zA-Z0-9_]{2,})/g

/**
 * Formato inline tipo markdown, seguro (construye nodos React, no HTML).
 * No interpreta nada dentro de `código`.
 */
export function formatText(text: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  TOKEN.lastIndex = 0

  while ((m = TOKEN.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    const key = `t${i++}`

    if (tok.startsWith('**') || tok.startsWith('__')) {
      out.push(<strong key={key}>{tok.slice(2, -2)}</strong>)
    } else if (tok.startsWith('~~')) {
      out.push(<s key={key}>{tok.slice(2, -2)}</s>)
    } else if (tok.startsWith('`')) {
      out.push(
        <code key={key} className="rounded bg-black/20 px-1 font-mono text-[0.85em]">
          {tok.slice(1, -1)}
        </code>,
      )
    } else if (tok.startsWith('@')) {
      out.push(
        <span key={key} className="rounded bg-primary/20 px-0.5 font-medium">
          {tok}
        </span>,
      )
    } else if (tok.startsWith('http')) {
      out.push(
        <a
          key={key}
          href={tok}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:opacity-80"
        >
          {tok}
        </a>,
      )
    } else {
      // *italic* o _italic_
      out.push(<em key={key}>{tok.slice(1, -1)}</em>)
    }
    last = m.index + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}
