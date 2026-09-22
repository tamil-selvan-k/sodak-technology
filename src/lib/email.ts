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

function renderTemplate(template: EmailTemplate, data: Record<string, unknown>): string {
  // Minimal inline templates — replace with React Email or Handlebars as needed.
  switch (template) {
    case 'lead-notification':
      return `<p>New enquiry from <strong>${data.name}</strong> (${data.email}).</p><p>${data.message}</p>`
    case 'lead-acknowledgement':
      return `<p>Hi ${data.name}, thanks for reaching out. We'll get back to you shortly.</p>`
    case 'trainer-live':
      return `<p>Your profile is now live at ${data.url}</p>`
    case 'password-reset':
      return `<p>Reset your password: <a href="${data.url}">${data.url}</a>. Expires in 15 minutes.</p>`
    case 'webinar-acknowledgement':
      return `<p>Hi ${data.name}, you're registered for <strong>${data.title}</strong> on ${data.scheduledAt}.</p>`
    case 'internship-acknowledgement':
      return `<p>Hi ${data.name}, we've received your application for <strong>${data.role}</strong>. We'll be in touch.</p>`
    case 'brochure-download':
      return `<p>Hi ${data.name}, download the <strong>${data.programTitle}</strong> brochure: <a href="${data.downloadUrl}">Download PDF</a>. Link expires in 1 hour.</p>`
  }
}
