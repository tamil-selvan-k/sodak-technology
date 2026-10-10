import Link from 'next/link'
import { auth } from '@/lib/auth'

export const metadata = { title: 'New Job — SODAK Admin' }

export default async function AdminNewCareerPage() {
  await auth()

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/careers" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Careers
        </Link>
      </div>

      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Add Job Opening</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Post a new career opportunity</p>
      </div>

      <form
        action="/api/v1/careers"
        method="POST"
        style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 32, maxWidth: 720 }}
      >
        <div style={{ display: 'grid', gap: 20 }}>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
              Job Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Full Stack Developer"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Department</label>
              <input
                name="department"
                type="text"
                placeholder="e.g. Engineering"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Location</label>
              <input
                name="location"
                type="text"
                placeholder="e.g. Chennai / Remote"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Employment Type</label>
              <select
                name="employmentType"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
              >
                <option value="">Select type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Closes On</label>
              <input
                name="closesOn"
                type="date"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
              Job Description
            </label>
            <textarea
              name="descriptionHtml"
              rows={6}
              placeholder="Describe the role, responsibilities, and requirements..."
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
            <Link
              href="/admin/careers"
              style={{ padding: '9px 20px', fontSize: 13, fontWeight: 600, background: '#f1f5f9', color: '#374151', borderRadius: 8, textDecoration: 'none' }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              style={{ padding: '9px 22px', fontSize: 13, fontWeight: 700, background: '#2563EB', color: '#ffffff', borderRadius: 8, border: 'none', cursor: 'pointer' }}
            >
              Save Job
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}
