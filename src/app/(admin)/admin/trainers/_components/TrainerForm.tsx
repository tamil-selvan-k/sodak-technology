'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { TrainerWithStacks } from '@/modules/trainers/trainers.types'
import type { Stack } from '@prisma/client'
import Button from '@/components/ui/Button'

interface Props {
  trainer?: TrainerWithStacks
  stacks: Stack[]
}

export default function TrainerForm({ trainer, stacks }: Props) {
  const router = useRouter()
  const isEdit = !!trainer

  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const selectedStackIds = trainer?.stacks.map(s => s.stack.id) ?? []
  const [checkedStacks, setCheckedStacks] = useState<string[]>(selectedStackIds)

  function toggleStack(id: string) {
    setCheckedStacks(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const fd = new FormData(e.currentTarget)

    const body = {
      name:             (fd.get('name') as string).trim(),
      designation:      (fd.get('designation') as string).trim() || undefined,
      currentCompany:   (fd.get('currentCompany') as string).trim() || undefined,
      yearsExperience:  fd.get('yearsExperience') ? Number(fd.get('yearsExperience')) : undefined,
      linkedinUrl:      (fd.get('linkedinUrl') as string).trim() || undefined,
      githubUrl:        (fd.get('githubUrl') as string).trim() || undefined,
      photoUrl:         (fd.get('photoUrl') as string).trim() || undefined,
      expertiseTags:    (fd.get('expertiseTags') as string).split(',').map(t => t.trim()).filter(Boolean),
      bioHtml:          (fd.get('bioHtml') as string).trim() || undefined,
      isMentor:         fd.get('isMentor') === 'on',
      isFeatured:       fd.get('isFeatured') === 'on',
      consentOnFile:    fd.get('consentOnFile') === 'on',
      displayOrder:     fd.get('displayOrder') ? Number(fd.get('displayOrder')) : undefined,
      stackIds:         checkedStacks,
    }

    const url    = isEdit ? `/api/v1/trainers/${trainer.id}` : '/api/v1/trainers'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setSaving(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? 'Save failed')
      return
    }

    router.push('/admin/trainers')
    router.refresh()
  }

  const field = 'w-full px-3 py-2 text-sm rounded-lg focus:outline-none'
  const fieldStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0' }
  const label = 'block text-xs font-semibold uppercase tracking-wide mb-1.5'
  const labelStyle: React.CSSProperties = { color: '#94a3b8' }
  const cardStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '24px', marginBottom: 0 }
  const sectionHead: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>{error}</div>
      )}

      <div style={cardStyle}>
        <p style={sectionHead}>Basic Info</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={label} style={labelStyle} htmlFor="name">Name *</label>
            <input id="name" name="name" required defaultValue={trainer?.name} className={field} style={fieldStyle} placeholder="Full name" />
          </div>
          <div>
            <label className={label} style={labelStyle} htmlFor="designation">Designation</label>
            <input id="designation" name="designation" defaultValue={trainer?.designation ?? ''} className={field} style={fieldStyle} placeholder="e.g. Senior Engineer" />
          </div>
          <div>
            <label className={label} style={labelStyle} htmlFor="currentCompany">Current Company</label>
            <input id="currentCompany" name="currentCompany" defaultValue={trainer?.currentCompany ?? ''} className={field} style={fieldStyle} placeholder="e.g. Zoho" />
          </div>
          <div>
            <label className={label} style={labelStyle} htmlFor="yearsExperience">Years Experience</label>
            <input id="yearsExperience" name="yearsExperience" type="number" min={0} max={50} defaultValue={trainer?.yearsExperience ?? ''} className={field} style={fieldStyle} />
          </div>
          <div>
            <label className={label} style={labelStyle} htmlFor="displayOrder">Display Order</label>
            <input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={trainer?.displayOrder ?? 0} className={field} style={fieldStyle} />
          </div>
          <div>
            <label className={label} style={labelStyle} htmlFor="linkedinUrl">LinkedIn URL</label>
            <input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={trainer?.linkedinUrl ?? ''} className={field} style={fieldStyle} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className={label} style={labelStyle} htmlFor="githubUrl">GitHub URL</label>
            <input id="githubUrl" name="githubUrl" type="url" defaultValue={trainer?.githubUrl ?? ''} className={field} style={fieldStyle} placeholder="https://github.com/..." />
          </div>
          <div className="col-span-2">
            <label className={label} style={labelStyle} htmlFor="photoUrl">Photo URL</label>
            <input id="photoUrl" name="photoUrl" type="url" defaultValue={trainer?.photoUrl ?? ''} className={field} style={fieldStyle} placeholder="https://... (S3 upload in Phase 3)" />
          </div>
          <div className="col-span-2">
            <label className={label} style={labelStyle} htmlFor="expertiseTags">Expertise Tags</label>
            <input
              id="expertiseTags"
              name="expertiseTags"
              defaultValue={trainer?.expertiseTags.join(', ') ?? ''}
              className={field}
              style={fieldStyle}
              placeholder="React, Node.js, PostgreSQL (comma-separated)"
            />
          </div>
          <div className="col-span-2">
            <label className={label} style={labelStyle} htmlFor="bioHtml">Bio (HTML allowed)</label>
            <textarea id="bioHtml" name="bioHtml" rows={5} defaultValue={trainer?.bioHtml ?? ''} className={`${field} resize-y`} style={fieldStyle} placeholder="<p>...</p>" />
          </div>
        </div>
      </div>

      {/* Stacks */}
      <div style={cardStyle}>
        <p style={sectionHead}>Tech Stacks</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stacks.map(s => (
            <label key={s.id} className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={checkedStacks.includes(s.id)}
                onChange={() => toggleStack(s.id)}
                className="w-4 h-4 accent-[var(--gold-500)]"
              />
              <span className="text-sm" style={{ color: '#cbd5e1' }}>{s.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Flags */}
      <div style={cardStyle}>
        <p style={sectionHead}>Flags</p>
        <div className="space-y-3">
          {[
            { name: 'isMentor',      label: 'Is Mentor',       defaultChecked: trainer?.isMentor ?? false },
            { name: 'isFeatured',    label: 'Featured',        defaultChecked: trainer?.isFeatured ?? false },
            { name: 'consentOnFile', label: 'Consent on file (required to publish)', defaultChecked: trainer?.consentOnFile ?? false },
          ].map(f => (
            <label key={f.name} className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name={f.name}
                defaultChecked={f.defaultChecked}
                className="w-4 h-4 accent-[var(--gold-500)]"
              />
              <span className="text-sm" style={{ color: '#cbd5e1' }}>{f.label}</span>
            </label>
          ))}
        </div>
        <p style={{ marginTop: 16, fontSize: 12, color: '#fbbf24', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, padding: '10px 14px' }}>
          A trainer cannot be published until <strong>Consent on file</strong> is checked.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="gold" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Trainer'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
