import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { uploadFile, publicUrl } from '@/lib/storage'
import { processAndUploadImage } from '@/lib/image'
import { randomUUID } from 'crypto'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
const MAX_BYTES = 10 * 1024 * 1024

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') ?? 1)
  const take = 40
  const skip = (page - 1) * take

  const [total, files] = await Promise.all([
    db.mediaFile.count({ where: { deletedAt: null } }),
    db.mediaFile.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, skip, take }),
  ])
  return NextResponse.json({ data: files, meta: { total, page, perPage: take, pages: Math.ceil(total / take) } })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || !hasRole(session, 'contributor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'No file provided' } }, { status: 400 })
  if (!ALLOWED_MIME_TYPES.includes(file.type)) return NextResponse.json({ error: { code: 'INVALID_MIME_TYPE' } }, { status: 415 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: { code: 'FILE_TOO_LARGE' } }, { status: 413 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const uuid = randomUUID()
  const ext = file.name.split('.').pop() ?? 'bin'

  let key: string
  let fileUrl: string
  let variants: Record<string, string> = {}

  if (file.type.startsWith('image/')) {
    // processAndUploadImage uploads the original + all resized variants — avoid a redundant raw
    // upload to save S3 PUT quota (free tier: 2,000 PUT/month).
    const processed = await processAndUploadImage(buffer, file.name)
    // Convert ProcessedImage[] → { variantName: url } map for DB storage
    variants = Object.fromEntries(processed.map(p => [p.variant, p.url]))
    // Use the processed original as the canonical URL
    key     = `images/${uuid}/original.${ext}`
    fileUrl = variants['original'] ?? publicUrl(key)
  } else {
    // Non-image files (e.g. PDF) — upload directly
    key     = `media/${uuid}.${ext}`
    fileUrl = await uploadFile(key, buffer, file.type)
  }

  const record = await db.mediaFile.create({
    data: { key, url: fileUrl, mimeType: file.type, sizeBytes: file.size, originalName: file.name, variants, uploadedById: session.user.id },
  })

  return NextResponse.json({ data: record }, { status: 201 })
}
