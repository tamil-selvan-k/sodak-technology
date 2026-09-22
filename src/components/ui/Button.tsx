import type { ButtonHTMLAttributes } from 'react'

type Variant = 'gold' | 'dark' | 'ghost' | 'outline' | 'danger' | 'dm'
type Size    = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
  asChild?: boolean
}

const VARIANT_CLASSES: Record<Variant, string> = {
  gold:    'bg-[var(--gold-500)] text-[var(--navy-950)] hover:bg-[var(--gold-400)]',
  dark:    'bg-[var(--navy-800)] text-white border border-white/10 hover:bg-[var(--navy-700)]',
  ghost:   'bg-transparent text-[var(--gold-500)] border border-[var(--gold-500)]/35 hover:bg-[var(--gold-500)]/8',
  outline: 'bg-white/7 text-white border border-white/20 hover:bg-white/12',
  danger:  'bg-red-500/10 text-red-500 border border-red-500/25 hover:bg-red-500/15',
  dm:      'bg-[var(--dm-accent)] text-white hover:bg-[#0669ab]',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[15px]',
}

export default function Button({ variant = 'gold', size = 'md', full, className = '', children, ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap
        ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
