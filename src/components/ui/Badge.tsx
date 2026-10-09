type Variant = 'gold' | 'dark' | 'light' | 'green' | 'amber' | 'red' | 'blue' | 'plum'

interface Props {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

const CLASSES: Record<Variant, string> = {
  gold:  'bg-blue-500/12 text-blue-600 border border-blue-500/25',
  dark:  'bg-white/10 text-blue-100 border border-white/15',
  light: 'bg-[#eff6ff] text-[#1e40af] border border-[#dbeafe]',
  green: 'bg-green-500/12 text-green-600 border border-green-500/25',
  amber: 'bg-yellow-500/12 text-yellow-600 border border-yellow-500/25',
  red:   'bg-red-500/12 text-red-600 border border-red-500/25',
  blue:  'bg-blue-500/12 text-blue-600 border border-blue-500/25',
  plum:  'bg-indigo-500/12 text-indigo-600 border border-indigo-500/25',
}

export default function Badge({ variant = 'light', children, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${CLASSES[variant]} ${className}`}>
      {children}
    </span>
  )
}
