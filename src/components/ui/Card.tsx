type Variant = 'light' | 'dark' | 'ghost' | 'gold'

interface Props {
  variant?: Variant
  className?: string
  children: React.ReactNode
}

const CLASSES: Record<Variant, string> = {
  light: 'bg-white border border-[#e2e8f0] rounded-[2rem] p-6 transition-transform hover:-translate-y-0.5',
  dark:  'bg-[#f8fafc] border border-[#e2e8f0] rounded-[2rem] p-6 transition-transform hover:-translate-y-0.5',
  ghost: 'bg-white/4 border border-[#e2e8f0] rounded-[2rem] p-6',
  gold:  'bg-[rgba(72,101,173,0.06)] border border-[rgba(72,101,173,0.2)] rounded-[2rem] p-6',
}

export default function Card({ variant = 'light', className = '', children }: Props) {
  return <div className={`${CLASSES[variant]} ${className}`}>{children}</div>
}
