import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FloatButtons from '@/components/layout/FloatButtons'
import PageTransition from '@/components/ui/PageTransition'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 64 }}>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <FloatButtons />
    </>
  )
}
