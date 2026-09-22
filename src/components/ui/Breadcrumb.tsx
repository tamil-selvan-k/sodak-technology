import Link from 'next/link'

interface Crumb { label: string; href?: string }

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1
        return (
          <span key={idx} className="flex items-center gap-1.5 text-sm">
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="text-slate-400 hover:text-[var(--gold-400)] transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-[var(--gold-500)] font-semibold' : 'text-slate-400'}>
                {crumb.label}
              </span>
            )}
            {!isLast && <span className="text-slate-600 text-xs">›</span>}
          </span>
        )
      })}
    </nav>
  )
}
