import type { Metadata } from 'next'
import { Open_Sans, Instrument_Sans } from 'next/font/google'
import './globals.css'
import NavigationProgress from '@/components/ui/NavigationProgress'

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-open-sans',
  display: 'swap',
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-sans',
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
    <html lang="en" className={`${openSans.variable} ${instrumentSans.variable}`}>
      <body>
        <NavigationProgress />
        {children}
      </body>
    </html>
  )
}
