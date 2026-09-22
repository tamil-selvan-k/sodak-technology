type Variant = 'gold' | 'dark' | 'light' | 'green' | 'amber' | 'red' | 'blue' | 'plum'

interface Props {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

const CLASSES: Record<Variant, string> = {
  gold:  'bg-[var(--gold-500)]/12 text-[var(--gold-500)] border border-[var(--gold-500)]/25',
  dark:  'bg-white/7 text-[#94a3b8] border border-white/8',
  light: 'bg-slate-100 text-slate-600',
  green: 'bg-green-500/12 text-green-500 border border-green-500/25',
  amber: 'bg-yellow-500/12 text-yellow-500 border border-yellow-500/25',
  red:   'bg-red-500/12 text-red-500 border border-red-500/25',
  blue:  'bg-blue-500/12 text-blue-500 border border-blue-500/25',
  plum:  'bg-violet-600/12 text-violet-600 border border-violet-600/25',
}

export default function Badge({ variant = 'light', children, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${CLASSES[variant]} ${className}`}>
      {children}
    </span>
  )
}
