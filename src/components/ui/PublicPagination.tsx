import Link from 'next/link'

interface Props {
  page: number
  pages: number
  total: number
  basePath: string
  searchParams?: Record<string, string>
}

function linkStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 16px', fontSize: 13, fontWeight: 600, borderRadius: '1.5rem',
    border: `1px solid ${active ? '#2563eb' : '#dbeafe'}`,
    background: active ? '#2563eb' : '#ffffff',
    color: active ? '#ffffff' : '#1e40af',
    textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
    transition: 'all 0.15s',
  }
}

export default function PublicPagination({ page, pages, basePath, searchParams = {} }: Props) {
  if (pages <= 1) return null

  function href(p: number) {
    const params = new URLSearchParams({ ...searchParams, page: String(p) })
    return `${basePath}?${params.toString()}`
  }

  const pageNums: number[] = []
  if (pages <= 7) {
    for (let i = 1; i <= pages; i++) pageNums.push(i)
  } else if (page <= 4) {
    for (let i = 1; i <= 7; i++) pageNums.push(i)
  } else if (page >= pages - 3) {
    for (let i = pages - 6; i <= pages; i++) pageNums.push(i)
  } else {
    for (let i = page - 3; i <= page + 3; i++) pageNums.push(i)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 48, flexWrap: 'wrap' }}>
      {page > 1 && (
        <Link href={href(page - 1)} style={linkStyle(false)}>← Prev</Link>
      )}
      {pageNums.map(p => (
        <Link key={p} href={href(p)} style={linkStyle(p === page)}>{p}</Link>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} style={linkStyle(false)}>Next →</Link>
      )}
    </div>
  )
}
