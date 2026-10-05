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
  poweredByHeader: false,

  // Next.js 14 key for externalising native binaries from the server bundle
  experimental: {
    serverComponentsExternalPackages: ['@node-rs/argon2', 'sharp'],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      // Belt-and-suspenders: regex externals cover all platform-specific sub-packages
      const existing = Array.isArray(config.externals) ? config.externals : config.externals ? [config.externals] : []
      config.externals = [...existing, /@node-rs\/argon2/, /^sharp$/]
    }
    return config
  },
  images: {
    remotePatterns: [
      ...(process.env.AWS_CLOUDFRONT_DOMAIN
        ? [{ protocol: 'https', hostname: process.env.AWS_CLOUDFRONT_DOMAIN }]
        : []),
      ...(process.env.AWS_S3_BUCKET
        ? [{
            protocol: 'https',
            hostname: `${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION ?? 'ap-south-1'}.amazonaws.com`,
          }]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control',     value: 'on' },
        ],
      },
    ]
  },
  async redirects() {
    return getRedirects()
  },
}

export default nextConfig
