import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  dark?: boolean
}

export default function Input({ label, error, hint, dark, className = '', id, ...props }: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const base = `w-full px-3.5 py-2.5 rounded-[2.5rem] border text-sm transition-[border-color] outline-none
    focus:border-[#4865ad] focus:shadow-[0_0_0_3px_rgba(72,101,173,0.12)]
    ${error ? 'border-red-500' : 'border-[#e2e8f0]'}
    ${dark ? 'bg-white/6 border-white/12 text-white placeholder:text-slate-600' : 'bg-white text-[var(--dm-text)] placeholder:text-slate-400'}`

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className={`text-[13px] font-medium ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</label>}
      <input id={inputId} className={`${base} ${className}`} {...props} />
      {error && <span className="text-xs text-red-500">{error}</span>}
      {hint  && !error && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  )
}
