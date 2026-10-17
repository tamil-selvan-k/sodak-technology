import { notFound } from 'next/navigation'
import { getJobById } from '@/modules/careers/careers.service'
import CareerEditForm from './_components/CareerEditForm'

interface Props { params: { id: string } }

export default async function AdminEditCareerPage({ params }: Props) {
  const job = await getJobById(params.id).catch(() => null)
  if (!job) notFound()

  return (
    <main className="admin-main">
      <CareerEditForm job={job} />
    </main>
  )
}
