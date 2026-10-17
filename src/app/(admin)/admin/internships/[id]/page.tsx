import { notFound } from 'next/navigation'
import { getInternshipByIdAdmin } from '@/modules/internships/internships.service'
import InternshipEditForm from './_components/InternshipEditForm'

interface Props { params: { id: string } }

export default async function AdminEditInternshipPage({ params }: Props) {
  const internship = await getInternshipByIdAdmin(params.id).catch(() => null)
  if (!internship) notFound()

  return (
    <main className="admin-main">
      <InternshipEditForm internship={internship} />
    </main>
  )
}
