type Variant = 'light' | 'dark' | 'ghost' | 'gold'

interface Props {
  variant?: Variant
  className?: string
  children: React.ReactNode
}

const CLASSES: Record<Variant, string> = {
  light: 'bg-white border border-[var(--dm-border)] rounded-xl p-6 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md',
  dark:  'bg-[var(--navy-800)] border border-[var(--gold-500)]/10 rounded-xl p-6 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-dark',
  ghost: 'bg-white/4 border border-white/7 rounded-xl p-6',
  gold:  'bg-[var(--gold-500)]/6 border border-[var(--gold-500)]/20 rounded-xl p-6',
}

export default function Card({ variant = 'light', className = '', children }: Props) {
  return <div className={`${CLASSES[variant]} ${className}`}>{children}</div>
}
