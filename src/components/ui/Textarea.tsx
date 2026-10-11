import type { TextareaHTMLAttributes } from 'react'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export default function Textarea({ label, error, hint, className = '', id, disabled, ...props }: Props) {
  const areaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={areaId} className="text-[13px] font-medium text-[#172554]">{label}</label>}
      <textarea
        id={areaId}
        rows={4}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-2xl border bg-white text-sm text-[#172554] placeholder:text-slate-400 outline-none resize-y
          transition-all duration-200 ease-out
          focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]
          ${error ? 'border-red-500' : 'border-[#dbeafe]'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-[#f8fafc]' : 'hover:border-[#93c5fd]'}
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
      {hint  && !error && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  )
}
