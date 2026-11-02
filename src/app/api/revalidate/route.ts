import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST(req: NextRequest) {
  const provided = req.headers.get('x-revalidate-secret')
  const expected = process.env.REVALIDATE_SECRET
  if (!provided || !expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const enc = (s: string) => Buffer.from(s, 'utf8')
  let valid = false
  try {
    valid = timingSafeEqual(enc(provided), enc(expected))
  } catch {
    // buffers differ in length — not equal
  }
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const tag = req.nextUrl.searchParams.get('tag')
  if (!tag) {
    return NextResponse.json({ error: 'Missing tag' }, { status: 400 })
  }
  revalidateTag(tag)
  return NextResponse.json({ revalidated: true, tag })
}
