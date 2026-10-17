import { notFound } from 'next/navigation'
import { getWebinarById } from '@/modules/webinars/webinars.service'
import WebinarEditForm from './_components/WebinarEditForm'

interface Props { params: { id: string } }

export default async function AdminEditWebinarPage({ params }: Props) {
  const webinar = await getWebinarById(params.id).catch(() => null)
  if (!webinar) notFound()

  return (
    <main className="admin-main">
      <WebinarEditForm webinar={webinar} />
    </main>
  )
}
