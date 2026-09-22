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

  const field = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[var(--gold-500)]'
  const label = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1'

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Basic Info</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={label} htmlFor="name">Name *</label>
            <input id="name" name="name" required defaultValue={trainer?.name} className={field} placeholder="Full name" />
          </div>
          <div>
            <label className={label} htmlFor="designation">Designation</label>
            <input id="designation" name="designation" defaultValue={trainer?.designation ?? ''} className={field} placeholder="e.g. Senior Engineer" />
          </div>
          <div>
            <label className={label} htmlFor="currentCompany">Current Company</label>
            <input id="currentCompany" name="currentCompany" defaultValue={trainer?.currentCompany ?? ''} className={field} placeholder="e.g. Zoho" />
          </div>
          <div>
            <label className={label} htmlFor="yearsExperience">Years Experience</label>
            <input id="yearsExperience" name="yearsExperience" type="number" min={0} max={50} defaultValue={trainer?.yearsExperience ?? ''} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="displayOrder">Display Order</label>
            <input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={trainer?.displayOrder ?? 0} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="linkedinUrl">LinkedIn URL</label>
            <input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={trainer?.linkedinUrl ?? ''} className={field} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className={label} htmlFor="githubUrl">GitHub URL</label>
            <input id="githubUrl" name="githubUrl" type="url" defaultValue={trainer?.githubUrl ?? ''} className={field} placeholder="https://github.com/..." />
          </div>
          <div className="col-span-2">
            <label className={label} htmlFor="photoUrl">Photo URL</label>
            <input id="photoUrl" name="photoUrl" type="url" defaultValue={trainer?.photoUrl ?? ''} className={field} placeholder="https://... (S3 upload in Phase 3)" />
          </div>
          <div className="col-span-2">
            <label className={label} htmlFor="expertiseTags">Expertise Tags</label>
            <input
              id="expertiseTags"
              name="expertiseTags"
              defaultValue={trainer?.expertiseTags.join(', ') ?? ''}
              className={field}
              placeholder="React, Node.js, PostgreSQL (comma-separated)"
            />
          </div>
          <div className="col-span-2">
            <label className={label} htmlFor="bioHtml">Bio (HTML allowed)</label>
            <textarea id="bioHtml" name="bioHtml" rows={5} defaultValue={trainer?.bioHtml ?? ''} className={`${field} resize-y`} placeholder="<p>...</p>" />
          </div>
        </div>
      </div>

      {/* Stacks */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Tech Stacks</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stacks.map(s => (
            <label key={s.id} className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={checkedStacks.includes(s.id)}
                onChange={() => toggleStack(s.id)}
                className="w-4 h-4 accent-[var(--gold-500)]"
              />
              <span className="text-sm text-slate-700">{s.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Flags */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Flags</h2>
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
              <span className="text-sm text-slate-700">{f.label}</span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
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
