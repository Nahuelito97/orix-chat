import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

/** Input con label opcional, estilado con el tema Orix. */
export default function Input({ label, className = '', ...props }: InputProps) {
  const field = (
    <input
      {...props}
      className={`w-full rounded-xl border border-outline bg-bg px-3.5 py-2.5 text-content outline-none transition placeholder:text-inactive focus:border-primary focus:ring-2 focus:ring-primary/30 ${className}`}
    />
  )
  if (!label) return field
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-content-muted">{label}</span>
      {field}
    </label>
  )
}
