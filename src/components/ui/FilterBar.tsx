'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface FilterOption { value: string; label: string }

interface Filter {
  key: string
  placeholder: string
  options: FilterOption[]
}

interface Props {
  filters: Filter[]
  searchKey?: string
  searchPlaceholder?: string
  resultCount?: number
}

export default function FilterBar({ filters, searchKey = 'search', searchPlaceholder = 'Search…', resultCount }: Props) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  return (
    <div className="filter-bar">
      <div className="container flex items-center gap-3 flex-wrap">
        {filters.map(f => (
          <select
            key={f.key}
            value={searchParams.get(f.key) ?? ''}
            onChange={e => updateParam(f.key, e.target.value)}
            className="px-3.5 py-2 rounded-md border border-[var(--dm-border)] bg-white text-[13px] font-medium text-slate-600 cursor-pointer transition-[border-color] outline-none focus:border-[var(--gold-500)] min-w-[140px] appearance-none"
          >
            <option value="">{f.placeholder}</option>
            {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
        <input
          type="search"
          placeholder={searchPlaceholder}
          defaultValue={searchParams.get(searchKey) ?? ''}
          onChange={e => updateParam(searchKey, e.target.value)}
          className="flex-1 min-w-[160px] px-3.5 py-2 rounded-md border border-[var(--dm-border)] bg-white text-[13px] text-[var(--dm-text)] transition-[border-color] outline-none focus:border-[var(--gold-500)] placeholder:text-slate-400"
        />
        {resultCount !== undefined && (
          <span className="ml-auto text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            {resultCount} results
          </span>
        )}
      </div>
    </div>
  )
}
