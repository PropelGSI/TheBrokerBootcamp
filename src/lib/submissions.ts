import { getAttribution } from './attribution'

export type SubmissionType = 'registration' | 'contact'

export type SubmissionPayload = {
  submission_type: SubmissionType
  name: string
  email: string
  number: string | null
  role: string | null
  company: string | null
  how_heard: string | null
  message: string | null
  consent: boolean
  website: string
}

type ApiResponse = {
  ok?: boolean
  code?: string
  error?: string
  message?: string
  fieldErrors?: Record<string, string>
}

const EVENT_SLUG = 'brand-before-you-sell-2026'
const SOURCE = 'thebrokerbootcamp.com'
const SHARED_INQUIRIES_FUNCTION = 'supabase-inquiries-to-airtable'

function buildMessage(payload: SubmissionPayload) {
  if (payload.submission_type === 'contact') return payload.message || ''

  return [
    'Brand Before You Sell registration',
    `Current role: ${payload.role || 'Not provided'}`,
    `How they heard about Broker Bootcamp: ${payload.how_heard || 'Not provided'}`,
  ].join('\n')
}

function buildInternalNotes(payload: SubmissionPayload) {
  const attribution = getAttribution()

  return [
    `Privacy consent: ${payload.consent ? 'Confirmed' : 'Not confirmed'}`,
    `Page: ${attribution.page_url}`,
    attribution.referrer ? `Referrer: ${attribution.referrer}` : null,
    attribution.utm_source ? `UTM source: ${attribution.utm_source}` : null,
    attribution.utm_medium ? `UTM medium: ${attribution.utm_medium}` : null,
    attribution.utm_campaign ? `UTM campaign: ${attribution.utm_campaign}` : null,
    attribution.utm_content ? `UTM content: ${attribution.utm_content}` : null,
  ].filter(Boolean).join('\n')
}

export async function submitForm(payload: SubmissionPayload): Promise<ApiResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return {
      ok: false,
      code: 'not_configured',
      message: 'Online submissions are being configured. Please try again soon.',
    }
  }

  // Honeypot submissions receive a neutral success response without being sent.
  if (payload.website) return { ok: true }

  const inquiryPayload = {
    name: payload.name,
    email: payload.email,
    number: payload.number,
    company: payload.company,
    message: buildMessage(payload),
    internal_notes: buildInternalNotes(payload),
    event_slug: EVENT_SLUG,
    property_slug: null,
    source: SOURCE,
    entry_type: payload.submission_type === 'registration' ? 'registration' : 'contact_request',
    inquiry_type: payload.submission_type === 'registration' ? 'event_registration' : 'event_contact',
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${SHARED_INQUIRIES_FUNCTION}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      mode: 'submit_inquiry',
      payload: inquiryPayload,
    }),
  })

  const data = (await response.json().catch(() => null)) as ApiResponse | null

  if (!response.ok) {
    return {
      ok: false,
      code: data?.code || 'request_failed',
      message: data?.message || data?.error || 'We could not send your details. Please try again.',
      fieldErrors: data?.fieldErrors,
    }
  }

  return { ok: true }
}
