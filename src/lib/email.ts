import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM ?? 'SODAK Technology <hello@sodakedutech.in>'

export type EmailTemplate =
  | 'lead-notification'
  | 'lead-acknowledgement'
  | 'trainer-live'
  | 'password-reset'
  | 'webinar-acknowledgement'
  | 'internship-acknowledgement'
  | 'brochure-download'

interface SendOptions {
  to: string | string[]
  template: EmailTemplate
  data: Record<string, unknown>
}

const subjects: Record<EmailTemplate, string> = {
  'lead-notification':          'New enquiry received — SODAK Technology',
  'lead-acknowledgement':       'Thanks for reaching out — SODAK Technology',
  'trainer-live':               'Your trainer profile is now live',
  'password-reset':             'Reset your SODAK Technology password',
  'webinar-acknowledgement':    'You\'re registered — SODAK Technology Webinar',
  'internship-acknowledgement': 'Application received — SODAK Technology',
  'brochure-download':          'Your program brochure — SODAK Technology',
}

export async function sendEmail({ to, template, data }: SendOptions) {
  const html = renderTemplate(template, data)
  return resend.emails.send({
    from: FROM,
    to,
    subject: subjects[template],
    html,
  })
}

function baseLayout(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Gold top bar -->
        <tr><td style="background:#c8a035;height:4px;border-radius:6px 6px 0 0;font-size:0;">&nbsp;</td></tr>

        <!-- Logo area -->
        <tr><td style="background:#ffffff;padding:24px 32px 20px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
          <span style="font-size:20px;font-weight:800;color:#0a0f1e;letter-spacing:-0.02em;">SODAK Technology</span>
          <span style="display:block;font-size:12px;color:#64748b;margin-top:2px;">Campus Placement Training</span>
        </td></tr>

        <!-- Body card -->
        <tr><td style="background:#0f1729;padding:32px;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#080c17;padding:20px 32px;border:1px solid rgba(255,255,255,0.06);border-top:none;border-radius:0 0 6px 6px;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;color:#475569;">© SODAK Technology, Chennai, Tamil Nadu</p>
          <p style="margin:0;font-size:11px;color:#334155;">You received this email because of your interaction with SODAK Technology.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function h(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function ctaButton(label: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="background:#c8a035;border-radius:6px;">
      <a href="${h(url)}" style="display:inline-block;padding:12px 28px;color:#0a0f1e;font-size:14px;font-weight:700;text-decoration:none;">${h(label)}</a>
    </td></tr>
  </table>`
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;font-size:12px;color:#64748b;font-weight:600;white-space:nowrap;width:120px;">${h(label)}</td>
    <td style="padding:8px 12px;font-size:13px;color:#cbd5e1;">${h(value)}</td>
  </tr>`
}

function renderTemplate(template: EmailTemplate, data: Record<string, unknown>): string {
  switch (template) {

    case 'lead-notification': {
      const name    = String(data.name    ?? '')
      const email   = String(data.email   ?? '')
      const message = String(data.message ?? '')
      const role    = String(data.role    ?? '')
      const now     = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
      const adminUrl = String(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sodakedutech.in') + '/admin/leads'

      const content = `
        <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;">🔔 New Enquiry Received</h1>
        <p style="margin:0 0 24px;font-size:13px;color:#94a3b8;">A new contact form submission is waiting in your inbox.</p>

        <table cellpadding="0" cellspacing="0" width="100%" style="background:rgba(200,160,53,0.08);border:1px solid rgba(200,160,53,0.25);border-radius:8px;margin-bottom:24px;">
          <tbody>
            ${infoRow('Name', name)}
            ${infoRow('Email', email)}
            ${role ? infoRow('Role', role) : ''}
            ${infoRow('Received', now)}
          </tbody>
        </table>

        ${message ? `<p style="margin:0 0 8px;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Message</p>
        <div style="background:rgba(255,255,255,0.04);border-left:3px solid #c8a035;padding:14px 16px;border-radius:0 6px 6px 0;margin-bottom:24px;">
          <p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.7;">${h(message)}</p>
        </div>` : ''}

        ${ctaButton('View in Admin →', adminUrl)}
      `
      return baseLayout(content, 'New Enquiry — SODAK Technology')
    }

    case 'lead-acknowledgement': {
      const name = String(data.name ?? '')
      const content = `
        <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;">Hi ${h(name)}, thanks for reaching out! 👋</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">We've received your enquiry and will review it shortly. Expect a reply within <strong style="color:#ffffff;">24 hours</strong> on working days.</p>

        <p style="margin:0 0 12px;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">What happens next</p>
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
          ${['We review your enquiry and understand your requirements', 'A 30-minute call to align on program, batch size and timeline', 'Custom proposal sent to you within 2 business days'].map((step, i) => `
          <tr>
            <td style="padding:8px 0;vertical-align:top;width:28px;">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#c8a035;color:#0a0f1e;font-size:11px;font-weight:700;border-radius:50%;">${i + 1}</span>
            </td>
            <td style="padding:8px 0 8px 10px;font-size:13px;color:#94a3b8;line-height:1.6;">${h(step)}</td>
          </tr>`).join('')}
        </table>

        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Need to reach us faster?</p>
          <p style="margin:0;font-size:13px;color:#94a3b8;">📞 <a href="tel:+918939366259" style="color:#c8a035;text-decoration:none;">+91 89393 66259</a> &nbsp;|&nbsp; ✉ <a href="mailto:hello@sodakedutech.in" style="color:#c8a035;text-decoration:none;">hello@sodakedutech.in</a></p>
        </div>
      `
      return baseLayout(content, 'Thanks for reaching out — SODAK Technology')
    }

    case 'trainer-live': {
      const name = String(data.name ?? '')
      const url  = String(data.url  ?? '')
      const content = `
        <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;">🎉 Your profile is now live!</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">Hi ${h(name)}, your trainer profile on SODAK Technology is published and visible to colleges and students across Tamil Nadu.</p>
        ${ctaButton('View Your Profile →', url)}
        <p style="margin:16px 0 0;font-size:13px;color:#64748b;">Share your profile link with your network to increase your reach and visibility.</p>
      `
      return baseLayout(content, 'Your trainer profile is now live — SODAK Technology')
    }

    case 'password-reset': {
      const url = String(data.url ?? '')
      const content = `
        <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;">Reset your password</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">We received a request to reset your SODAK Technology admin password. Click the button below to set a new one.</p>
        ${ctaButton('Reset Password →', url)}
        <div style="background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);border-radius:6px;padding:12px 16px;margin-top:8px;">
          <p style="margin:0;font-size:13px;color:#eab308;">⏱ This link expires in <strong>15 minutes</strong>.</p>
        </div>
        <p style="margin:20px 0 0;font-size:12px;color:#475569;">If you didn't request a password reset, you can safely ignore this email. Your password will not change.</p>
      `
      return baseLayout(content, 'Reset your SODAK Technology password')
    }

    case 'webinar-acknowledgement': {
      const name        = String(data.name        ?? '')
      const title       = String(data.title       ?? '')
      const scheduledAt = String(data.scheduledAt ?? '')
      const joinUrl     = String(data.joinUrl     ?? '')
      const content = `
        <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;">✅ You're registered!</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">Hi ${h(name)}, your spot is confirmed for the webinar below.</p>

        <table cellpadding="0" cellspacing="0" width="100%" style="background:rgba(200,160,53,0.08);border:1px solid rgba(200,160,53,0.25);border-radius:8px;margin-bottom:24px;">
          <tbody>
            ${infoRow('Webinar', title)}
            ${infoRow('Date & Time', scheduledAt)}
          </tbody>
        </table>

        ${joinUrl ? ctaButton('Join Webinar →', joinUrl) : ''}
        <p style="margin:${joinUrl ? '0' : '0'} 0 0;font-size:13px;color:#64748b;">We'll send a reminder closer to the date. Add it to your calendar so you don't miss it.</p>
      `
      return baseLayout(content, "You're registered — SODAK Technology Webinar")
    }

    case 'internship-acknowledgement': {
      const name = String(data.name ?? '')
      const role = String(data.role ?? '')
      const content = `
        <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;">Application received 📩</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">Hi ${h(name)}, we've received your application for <strong style="color:#ffffff;">${h(role)}</strong>. Thank you for your interest in SODAK Technology.</p>

        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 6px;font-size:13px;color:#cbd5e1;font-weight:600;">What happens next</p>
          <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.7;">Our team reviews applications within <strong style="color:#ffffff;">5 business days</strong>. Shortlisted candidates will be contacted for a brief screening call.</p>
        </div>

        <p style="margin:0;font-size:13px;color:#64748b;">Questions? Email us at <a href="mailto:hello@sodakedutech.in" style="color:#c8a035;text-decoration:none;">hello@sodakedutech.in</a>.</p>
      `
      return baseLayout(content, 'Application received — SODAK Technology')
    }

    case 'brochure-download': {
      const name         = String(data.name         ?? '')
      const programTitle = String(data.programTitle ?? '')
      const downloadUrl  = String(data.downloadUrl  ?? '')
      const content = `
        <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;">Your brochure is ready 📄</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">Hi ${h(name)}, here's the program brochure you requested for <strong style="color:#ffffff;">${h(programTitle)}</strong>.</p>
        ${ctaButton('Download Brochure →', downloadUrl)}
        <div style="background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);border-radius:6px;padding:12px 16px;margin-top:8px;">
          <p style="margin:0;font-size:13px;color:#eab308;">⏱ This download link expires in <strong>1 hour</strong>.</p>
        </div>
        <p style="margin:20px 0 0;font-size:13px;color:#64748b;">Want to discuss the program? Call us at <a href="tel:+918939366259" style="color:#c8a035;text-decoration:none;">+91 89393 66259</a> or reply to this email.</p>
      `
      return baseLayout(content, 'Your program brochure — SODAK Technology')
    }
  }
}
