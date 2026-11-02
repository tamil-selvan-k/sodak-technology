import { NextResponse } from 'next/server'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

export const dynamic = 'force-dynamic'

export async function GET() {
  const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png')
  const logoBuffer = fs.readFileSync(logoPath)

  const size = 64
  const mask = Buffer.from(
    `<svg><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`,
  )

  const circular = await sharp(logoBuffer)
    .resize(size, size, { fit: 'cover' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()

  return new NextResponse(circular as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })
}
