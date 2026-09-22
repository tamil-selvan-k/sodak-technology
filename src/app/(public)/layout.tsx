import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FloatButtons from '@/components/layout/FloatButtons'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatButtons />
    </>
  )
}
