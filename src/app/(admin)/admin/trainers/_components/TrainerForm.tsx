'use client'

import { useState, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { TrainerWithStacks } from '@/modules/trainers/trainers.types'
import type { Stack } from '@prisma/client'
import Button from '@/components/ui/Button'
import TagInput from '@/components/ui/TagInput'
import ImageUpload from '@/components/ui/ImageUpload'
import { useToast } from '@/components/ui/Toast'

interface Props {
  trainer?: TrainerWithStacks
  stacks: Stack[]
}

export default function TrainerForm({ trainer, stacks }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const isEdit = !!trainer

  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [consent, setConsent] = useState(trainer?.consentOnFile ?? false)

  const [photoUrl, setPhotoUrl] = useState(trainer?.photoUrl ?? '')

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
      photoUrl:         photoUrl || undefined,
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

    toast.success(isEdit ? 'Trainer saved!' : 'Trainer created!')
    router.push('/admin/trainers')
    router.refresh()
  }

  function buildBody() {
    const fd = new FormData(formRef.current!)
    return {
      name:            (fd.get('name') as string).trim(),
      designation:     (fd.get('designation') as string).trim() || undefined,
      currentCompany:  (fd.get('currentCompany') as string).trim() || undefined,
      yearsExperience: fd.get('yearsExperience') ? Number(fd.get('yearsExperience')) : undefined,
      linkedinUrl:     (fd.get('linkedinUrl') as string).trim() || undefined,
      githubUrl:       (fd.get('githubUrl') as string).trim() || undefined,
      photoUrl:        photoUrl || undefined,
      expertiseTags:   (fd.get('expertiseTags') as string).split(',').map(t => t.trim()).filter(Boolean),
      bioHtml:         (fd.get('bioHtml') as string).trim() || undefined,
      isMentor:        fd.get('isMentor') === 'on',
      isFeatured:      fd.get('isFeatured') === 'on',
      consentOnFile:   consent,   // use React state — checkbox is controlled
      displayOrder:    fd.get('displayOrder') ? Number(fd.get('displayOrder')) : undefined,
      stackIds:        checkedStacks,
    }
  }

  async function handlePublish() {
    if (!trainer?.id) return
    setPublishing(true)
    setError(null)

    // Step 1: save the form including consentOnFile: true
    const saveRes = await fetch(`/api/v1/trainers/${trainer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody()),
    })
    if (!saveRes.ok) {
      const data = await saveRes.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? 'Save failed')
      setPublishing(false)
      return
    }

    // Step 2: now publish (DB has consentOnFile: true)
    const pubRes = await fetch(`/api/v1/trainers/${trainer.id}/publish`, { method: 'POST' })
    setPublishing(false)
    if (!pubRes.ok) {
      const data = await pubRes.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? 'Publish failed')
      return
    }
    toast.success('Trainer published!')
    router.push('/admin/trainers')
    router.refresh()
  }

  const cardStyle: React.CSSProperties = { background: '#ffffff', border: '1px solid #DBEAFE', borderRadius: 12, padding: 24 }
  const fieldStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #dbeafe', borderRadius: 8, fontSize: 14, color: '#172554', background: '#fff', outline: 'none', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }
  const sectionHeadStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#172554', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #EFF6FF' }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>{error}</div>
      )}

      <div className="admin-form-grid">

        {/* Left column — primary content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Basic Info card */}
          <div style={cardStyle}>
            <p style={sectionHeadStyle}>Basic Info</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle} htmlFor="name">Name *</label>
                <input id="name" name="name" required defaultValue={trainer?.name} style={fieldStyle} placeholder="Full name" />
              </div>
              <div>
                <label style={labelStyle} htmlFor="designation">Designation</label>
                <input id="designation" name="designation" defaultValue={trainer?.designation ?? ''} style={fieldStyle} placeholder="e.g. Senior Engineer" />
              </div>
              <div>
                <label style={labelStyle} htmlFor="currentCompany">Current Company</label>
                <input id="currentCompany" name="currentCompany" defaultValue={trainer?.currentCompany ?? ''} style={fieldStyle} placeholder="e.g. Zoho" />
              </div>
              <div>
                <label style={labelStyle} htmlFor="yearsExperience">Years Experience</label>
                <input id="yearsExperience" name="yearsExperience" type="number" min={0} max={50} defaultValue={trainer?.yearsExperience ?? ''} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle} htmlFor="displayOrder">Display Order</label>
                <input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={trainer?.displayOrder ?? 0} style={fieldStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <ImageUpload
                  value={photoUrl || undefined}
                  onChange={(url) => setPhotoUrl(url ?? '')}
                  label="Photo"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <TagInput
                  name="expertiseTags"
                  defaultValue={trainer?.expertiseTags ?? []}
                  placeholder="React, Node.js, PostgreSQL…"
                  label="Expertise Tags"
                  labelStyle={{ ...labelStyle, marginBottom: 6 }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle} htmlFor="bioHtml">Bio (HTML allowed)</label>
                <textarea id="bioHtml" name="bioHtml" rows={6} defaultValue={trainer?.bioHtml ?? ''} style={{ ...fieldStyle, resize: 'vertical' }} placeholder="<p>...</p>" />
              </div>
            </div>
          </div>

          {/* Tech Stacks card */}
          <div style={cardStyle}>
            <p style={sectionHeadStyle}>Tech Stacks</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {stacks.map(s => (
                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontSize: 14, color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={checkedStacks.includes(s.id)}
                    onChange={() => toggleStack(s.id)}
                    style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Right sidebar — actions + links + flags */}
        <div className="admin-form-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

          {/* Actions card */}
          <div style={cardStyle}>
            <p style={sectionHeadStyle}>Actions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button type="submit" variant="gold" disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Trainer'}
              </Button>
              {isEdit && !trainer?.isPublished && (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={!consent || publishing || saving}
                  style={{
                    padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                    background: consent ? '#16a34a' : '#e2e8f0',
                    color: consent ? '#ffffff' : '#94a3b8',
                    border: 'none', cursor: consent ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                    opacity: publishing ? 0.7 : 1,
                    width: '100%',
                  }}
                  title={!consent ? 'Check "Consent on file" below to enable publishing' : undefined}
                >
                  {publishing ? 'Publishing…' : 'Save & Publish'}
                </button>
              )}
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </div>

          {/* Links card */}
          <div style={cardStyle}>
            <p style={sectionHeadStyle}>Links</p>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle} htmlFor="linkedinUrl">LinkedIn URL</label>
                <input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={trainer?.linkedinUrl ?? ''} style={fieldStyle} placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label style={labelStyle} htmlFor="githubUrl">GitHub URL</label>
                <input id="githubUrl" name="githubUrl" type="url" defaultValue={trainer?.githubUrl ?? ''} style={fieldStyle} placeholder="https://github.com/..." />
              </div>
            </div>
          </div>

          {/* Flags card */}
          <div style={cardStyle}>
            <p style={sectionHeadStyle}>Flags</p>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                { name: 'isMentor',   label: 'Is Mentor',   defaultChecked: trainer?.isMentor ?? false },
                { name: 'isFeatured', label: 'Featured',    defaultChecked: trainer?.isFeatured ?? false },
              ].map(f => (
                <label key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontSize: 14, color: '#334155' }}>
                  <input
                    type="checkbox"
                    name={f.name}
                    defaultChecked={f.defaultChecked}
                    style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                  />
                  {f.label}
                </label>
              ))}
              {/* Controlled consent checkbox — drives the Publish button */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontSize: 14, color: '#334155' }}>
                <input
                  type="checkbox"
                  name="consentOnFile"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                />
                Consent on file (required to publish)
              </label>
            </div>
            <p style={{ marginTop: 16, fontSize: 12, color: '#d97706', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, padding: '10px 14px' }}>
              A trainer cannot be published until <strong>Consent on file</strong> is checked.
            </p>
          </div>

        </div>
      </div>
    </form>
  )
}
