import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary text-on-accent hover:bg-primary-pressed disabled:opacity-60',
  outline:
    'border border-outline bg-bg text-content hover:bg-surface-variant disabled:opacity-60',
  danger:
    'border border-danger/40 text-danger hover:bg-danger/10 disabled:opacity-60',
}

export default function Button({
  variant = 'primary',
  fullWidth,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-xl px-4 py-2.5 font-semibold transition ${VARIANTS[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    />
  )
}
