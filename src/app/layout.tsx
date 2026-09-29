import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import NavigationProgress from '@/components/ui/NavigationProgress'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sodakedutech.in'),
  title: { default: 'SODAK Technology — Campus Placement Training', template: '%s — SODAK Technology' },
  description: 'Campus placement training by engineers from Amazon, Zoho, TCS and Accenture. Placement-first. Practice-led. Industry-backed.',
  openGraph: {
    type: 'website',
    siteName: 'SODAK Technology',
    locale: 'en_IN',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body>
        <NavigationProgress />
        {children}
      </body>
    </html>
  )
}
