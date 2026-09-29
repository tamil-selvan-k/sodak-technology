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
  // Prevent webpack from bundling native .node binaries — covers main pkg + all platform-specific sub-packages
  serverExternalPackages: ['@node-rs/argon2'],
  webpack(config, { isServer }) {
    if (isServer) {
      // Externalize all @node-rs/argon2 platform variants (win32, linux, darwin) via regex
      const existing = Array.isArray(config.externals) ? config.externals : config.externals ? [config.externals] : []
      config.externals = [...existing, /@node-rs\/argon2/]
    }
    return config
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
