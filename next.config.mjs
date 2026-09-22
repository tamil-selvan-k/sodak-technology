// @ts-check

async function getRedirects() {
  try {
    const { db } = await import('./src/lib/db.js')
    const rows = await db.redirect.findMany()
    return rows.map(r => ({
      source:      r.source,
      destination: r.destination,
      permanent:   r.isPermanent,
    }))
  } catch {
    return []
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Prevent webpack from bundling native .node binaries — required for @node-rs/argon2 on Next.js 14
    serverComponentsExternalPackages: ['@node-rs/argon2', '@node-rs/argon2-win32-x64-msvc'],
  },
  images: {
    remotePatterns: [
      ...(process.env.AWS_CLOUDFRONT_DOMAIN
        ? [{ protocol: 'https', hostname: process.env.AWS_CLOUDFRONT_DOMAIN }]
        : []),
      {
        protocol: 'https',
        hostname: `${process.env.AWS_S3_BUCKET ?? ''}.s3.${process.env.AWS_REGION ?? 'ap-south-1'}.amazonaws.com`,
      },
    ],
  },
  async redirects() {
    return getRedirects()
  },
}

export default nextConfig
