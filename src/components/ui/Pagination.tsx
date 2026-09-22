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
        className="px-3 py-1.5 rounded-md text-sm border border-[var(--dm-border)] disabled:opacity-40 hover:border-[var(--gold-500)] transition-colors"
      >
        ←
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => goTo(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`px-3 py-1.5 rounded-md text-sm border transition-colors
            ${p === page
              ? 'bg-[var(--gold-500)] text-[var(--navy-950)] border-[var(--gold-500)] font-semibold'
              : 'border-[var(--dm-border)] hover:border-[var(--gold-500)]'}`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= pages}
        className="px-3 py-1.5 rounded-md text-sm border border-[var(--dm-border)] disabled:opacity-40 hover:border-[var(--gold-500)] transition-colors"
      >
        →
      </button>
      <span className="text-xs text-slate-400 ml-2">{total} results</span>
    </nav>
  )
}
