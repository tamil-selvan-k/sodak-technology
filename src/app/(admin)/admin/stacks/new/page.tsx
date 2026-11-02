import { auth } from '@/lib/auth'
import StackForm from './_components/StackForm'

export const metadata = { title: 'New Stack — SODAK Admin' }

export default async function AdminNewStackPage() {
  await auth()
  return (
    <main className="admin-main">
      <StackForm />
    </main>
  )
}
