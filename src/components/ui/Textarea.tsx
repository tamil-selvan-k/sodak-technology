import type { TextareaHTMLAttributes } from 'react'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export default function Textarea({ label, error, hint, className = '', id, ...props }: Props) {
  const areaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={areaId} className="text-[13px] font-medium text-[#172554]">{label}</label>}
      <textarea
        id={areaId}
        rows={4}
        className={`w-full px-4 py-3 rounded-2xl border border-[#dbeafe] bg-white text-sm text-[#172554] placeholder:text-slate-400 transition-all outline-none resize-y
          focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]
          ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
      {hint  && !error && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  )
}
