import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FloatButtons from '@/components/layout/FloatButtons'
import PageTransition from '@/components/ui/PageTransition'
import ScrollToTop from '@/components/ui/ScrollToTop'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main style={{ paddingTop: 64 }}>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <FloatButtons />
    </>
  )
}
