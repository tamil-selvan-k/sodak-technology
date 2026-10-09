import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  dark?: boolean
}

export default function Input({ label, error, hint, dark, className = '', id, ...props }: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const base = `w-full px-4 py-2.5 rounded-[2.5rem] border text-sm transition-all outline-none
    focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]
    ${error ? 'border-red-500' : 'border-[#dbeafe]'}
    ${dark ? 'bg-white/10 border-white/20 text-white placeholder:text-blue-200' : 'bg-white text-[#172554] placeholder:text-slate-400'}`

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className={`text-[13px] font-medium ${dark ? 'text-blue-100' : 'text-[#172554]'}`}>{label}</label>}
      <input id={inputId} className={`${base} ${className}`} {...props} />
      {error && <span className="text-xs text-red-500">{error}</span>}
      {hint  && !error && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  )
}
