import Link from 'next/link'
import { auth } from '@/lib/auth'

export const metadata = { title: 'New Institution — SODAK Admin' }

export default async function AdminNewInstitutionPage() {
  await auth()

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/institutions" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Institutions
        </Link>
      </div>

      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>New Institution</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Add a partner college or company</p>
      </div>

      <form
        action="/api/v1/institutions"
        method="POST"
        style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 32, maxWidth: 720 }}
      >
        <div style={{ display: 'grid', gap: 20 }}>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
              Institution Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Anna University"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Type</label>
              <select
                name="type"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
              >
                <option value="">Select type</option>
                <option value="college">College</option>
                <option value="university">University</option>
                <option value="company">Company</option>
                <option value="government">Government</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>City / Location</label>
              <input
                name="location"
                type="text"
                placeholder="e.g. Chennai"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Website URL</label>
            <input
              name="websiteUrl"
              type="url"
              placeholder="https://..."
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
              <input
                type="checkbox"
                name="logoPermission"
                id="logoPermission"
                value="true"
                style={{ width: 16, height: 16, accentColor: '#2563EB' }}
              />
              <label htmlFor="logoPermission" style={{ fontSize: 13, color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
                Logo Permission Granted
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
              <input
                type="checkbox"
                name="showOnHome"
                id="showOnHome"
                value="true"
                style={{ width: 16, height: 16, accentColor: '#2563EB' }}
              />
              <label htmlFor="showOnHome" style={{ fontSize: 13, color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
                Show on Homepage
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Notes</label>
            <textarea
              name="notes"
              rows={4}
              placeholder="Any additional notes about this institution..."
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
            <Link
              href="/admin/institutions"
              style={{ padding: '9px 20px', fontSize: 13, fontWeight: 600, background: '#f1f5f9', color: '#374151', borderRadius: 8, textDecoration: 'none' }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              style={{ padding: '9px 22px', fontSize: 13, fontWeight: 700, background: '#2563EB', color: '#ffffff', borderRadius: 8, border: 'none', cursor: 'pointer' }}
            >
              Save Institution
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}
