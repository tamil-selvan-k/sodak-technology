import { notFound } from 'next/navigation'
import { getInstitutionById } from '@/modules/institutions/institutions.service'
import InstitutionEditForm from './_components/InstitutionEditForm'

interface Props { params: { id: string } }

export default async function AdminEditInstitutionPage({ params }: Props) {
  const institution = await getInstitutionById(params.id).catch(() => null)
  if (!institution) notFound()

  return (
    <main className="admin-main">
      <InstitutionEditForm institution={institution} />
    </main>
  )
}
