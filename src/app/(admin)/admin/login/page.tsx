import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LoginForm from './_components/LoginForm'

export default async function AdminLoginPage() {
  const session = await auth()
  if (session) redirect('/admin')
  return <LoginForm />
}
