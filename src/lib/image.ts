import sharp from 'sharp'
import { randomUUID } from 'crypto'
import { uploadFile } from './storage'

export type ImageVariant = 'original' | 'lg' | 'md' | 'sm' | 'thumb' | 'lg_avif' | 'md_avif'

const SIZES: Record<Exclude<ImageVariant, 'original' | 'lg_avif' | 'md_avif'>, number> = {
  lg:    1200,
  md:    800,
  sm:    400,
  thumb: 200,
}

export interface ProcessedImage {
  variant: ImageVariant
  url: string
  width: number
  height: number
}

export async function processAndUploadImage(
  buffer: Buffer,
  originalName: string,
): Promise<ProcessedImage[]> {
  const base = randomUUID()
  const ext  = originalName.split('.').pop()?.toLowerCase() ?? 'jpg'
  const results: ProcessedImage[] = []

  // original — normalise 'jpg' → 'jpeg' for correct MIME type
  const origKey  = `images/${base}/original.${ext}`
  const origMime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
  const origUrl  = await uploadFile(origKey, buffer, origMime)
  const origMeta = await sharp(buffer).metadata()
  results.push({ variant: 'original', url: origUrl, width: origMeta.width ?? 0, height: origMeta.height ?? 0 })

  // resized variants — WebP for all
  for (const [variant, width] of Object.entries(SIZES) as [Exclude<ImageVariant, 'original'>, number][]) {
    const resized = await sharp(buffer).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
    const meta    = await sharp(resized).metadata()
    const key     = `images/${base}/${variant}.webp`
    const url     = await uploadFile(key, resized, 'image/webp')
    results.push({ variant, url, width: meta.width ?? 0, height: meta.height ?? 0 })
  }

  // AVIF for lg and md (better compression for above-fold images)
  for (const variant of ['lg', 'md'] as const) {
    const width   = SIZES[variant]
    const avif    = await sharp(buffer).resize({ width, withoutEnlargement: true }).avif({ quality: 60 }).toBuffer()
    const meta    = await sharp(avif).metadata()
    const key     = `images/${base}/${variant}.avif`
    const url     = await uploadFile(key, avif, 'image/avif')
    results.push({ variant: `${variant}_avif` as ImageVariant, url, width: meta.width ?? 0, height: meta.height ?? 0 })
  }

  return results
}
