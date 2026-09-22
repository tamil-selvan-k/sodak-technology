import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Standard AWS S3 — no custom endpoint needed; SDK resolves per-region automatically.
const client = new S3Client({
  region: process.env.AWS_REGION ?? 'ap-south-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET          = process.env.AWS_S3_BUCKET!
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN   // optional CDN domain

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  await client.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }),
  )
  return publicUrl(key)
}

export async function deleteFile(key: string): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

export async function signedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(client, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn })
}

export function publicUrl(key: string): string {
  if (CLOUDFRONT_DOMAIN) return `https://${CLOUDFRONT_DOMAIN}/${key}`
  // Fall back to direct S3 URL — suitable for dev/staging without CloudFront
  return `https://${BUCKET}.s3.${process.env.AWS_REGION ?? 'ap-south-1'}.amazonaws.com/${key}`
}
