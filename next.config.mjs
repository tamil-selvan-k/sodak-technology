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
    serverComponentsExternalPackages: ['@node-rs/argon2', 'sharp', 'isomorphic-dompurify', 'jsdom'],
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
    const isDev = process.env.NODE_ENV === 'development'

    // In dev, Next.js uses eval() for HMR — 'unsafe-eval' is required there.
    // In production, use strict-inline only (no eval).
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com"
      : "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com"

    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "frame-src https://challenges.cloudflare.com",
      "connect-src 'self' https:",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options',              value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options',        value: 'nosniff' },
          { key: 'Referrer-Policy',               value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',            value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control',        value: 'on' },
          { key: 'Strict-Transport-Security',     value: 'max-age=31536000; includeSubDomains' },
          { key: 'Content-Security-Policy',       value: csp },
        ],
      },
    ]
  },
  async redirects() {
    return getRedirects()
  },
}

export default nextConfig
