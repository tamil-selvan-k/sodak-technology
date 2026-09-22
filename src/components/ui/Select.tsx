import type { SelectHTMLAttributes } from 'react'

interface Option { value: string; label: string }

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Option[]
  placeholder?: string
  error?: string
}

export default function Select({ label, options, placeholder, error, className = '', id, ...props }: Props) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={selectId} className="text-[13px] font-medium text-slate-600">{label}</label>}
      <select
        id={selectId}
        className={`w-full px-3.5 py-2.5 rounded-md border border-[var(--dm-border)] bg-white text-sm text-[var(--dm-text)] transition-[border-color] outline-none cursor-pointer
          focus:border-[var(--gold-500)] focus:shadow-[0_0_0_3px_rgba(200,160,53,0.12)]
          appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_12px_center]
          ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
