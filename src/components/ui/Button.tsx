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
  gold:    'bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-sm',
  dark:    'bg-[#172554] text-white border border-white/15 hover:bg-[#1e3a8a]',
  ghost:   'bg-transparent text-[#2563eb] border border-[#2563eb]/40 hover:bg-[#eff6ff]',
  outline: 'bg-white/10 text-white border border-white/25 hover:bg-white/15',
  danger:  'bg-red-500/10 text-red-500 border border-red-500/25 hover:bg-red-500/15',
  dm:      'bg-[#2563eb] text-white hover:bg-[#1d4ed8]',
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
