type Variant = 'light' | 'dark' | 'ghost' | 'gold'

interface Props {
  variant?: Variant
  className?: string
  children: React.ReactNode
}

const CLASSES: Record<Variant, string> = {
  light: 'bg-white border border-[#dbeafe] rounded-[2rem] p-6 transition-all hover:border-[#3b82f6] hover:-translate-y-0.5 shadow-[0_2px_12px_rgba(37,99,235,0.04)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)]',
  dark:  'bg-[#1e3a8a] text-white border border-white/15 rounded-[2rem] p-6 transition-all hover:border-[#93c5fd] hover:-translate-y-0.5',
  ghost: 'bg-[#eff6ff] border border-[#dbeafe] rounded-[2rem] p-6',
  gold:  'bg-[rgba(37,99,235,0.06)] border border-[rgba(37,99,235,0.22)] rounded-[2rem] p-6',
}

export default function Card({ variant = 'light', className = '', children }: Props) {
  return <div className={`${CLASSES[variant]} ${className}`}>{children}</div>
}
