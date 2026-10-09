'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface Props {
  total: number
  page: number
  perPage: number
  pages: number
}

export default function Pagination({ total, page, pages }: Props) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()

  if (pages <= 1) return null

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg text-sm border border-[#dbeafe] bg-white text-[#172554] disabled:opacity-40 hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
      >
        ←
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => goTo(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors
            ${p === page
              ? 'bg-[#2563eb] text-white border-[#2563eb] font-semibold'
              : 'border-[#dbeafe] bg-white text-[#172554] hover:border-[#2563eb] hover:text-[#2563eb]'}`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= pages}
        className="px-3 py-1.5 rounded-lg text-sm border border-[#dbeafe] bg-white text-[#172554] disabled:opacity-40 hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
      >
        →
      </button>
      <span className="text-xs text-slate-500 ml-2">{total} results</span>
    </nav>
  )
}
