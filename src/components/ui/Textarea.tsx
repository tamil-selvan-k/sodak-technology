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
      {label && <label htmlFor={areaId} className="text-[13px] font-medium text-slate-600">{label}</label>}
      <textarea
        id={areaId}
        rows={4}
        className={`w-full px-3.5 py-2.5 rounded-md border border-[var(--dm-border)] bg-white text-sm text-[var(--dm-text)] placeholder:text-slate-400 transition-[border-color] outline-none resize-y
          focus:border-[var(--gold-500)] focus:shadow-[0_0_0_3px_rgba(200,160,53,0.12)]
          ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
      {hint  && !error && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  )
}
