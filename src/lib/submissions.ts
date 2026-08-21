import { getAttribution } from './attribution'
import { PAYMENT_PROOF_BUCKET } from '../config/payment'


/* ============================================================
   TYPES
============================================================ */

export type SubmissionType =
  | 'registration'
  | 'contact'


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

  /*
    Used internally by the registration form only.

    IMPORTANT:
    This is NOT sent to Airtable.
  */
  payment_proof_path: string | null
}


type ApiResponse = {
  ok?: boolean
  code?: string
  error?: string
  message?: string
  fieldErrors?: Record<string, string>
}


type PaymentProofUploadResult =
  | {
      ok: true
      path: string
    }
  | {
      ok: false
      code: string
      message: string
    }


/* ============================================================
   CONFIG
============================================================ */

const EVENT_SLUG =
  'brand-before-you-sell-2026'

const SOURCE =
  'thebrokerbootcamp.com'

const SHARED_INQUIRIES_FUNCTION =
  'supabase-inquiries-to-airtable'


/* ============================================================
   HELPERS
============================================================ */

function createSafeName(
  name: string,
) {
  return name
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .replace(
      /[^a-zA-Z0-9]+/g,
      '-',
    )
    .replace(
      /^-+|-+$/g,
      '',
    )
    .toUpperCase()
    .slice(0, 50)
}


function createTimestamp() {
  const now =
    new Date()


  const year =
    now.getFullYear()


  const month =
    String(
      now.getMonth() + 1,
    ).padStart(
      2,
      '0',
    )


  const day =
    String(
      now.getDate(),
    ).padStart(
      2,
      '0',
    )


  const hours =
    String(
      now.getHours(),
    ).padStart(
      2,
      '0',
    )


  const minutes =
    String(
      now.getMinutes(),
    ).padStart(
      2,
      '0',
    )


  const seconds =
    String(
      now.getSeconds(),
    ).padStart(
      2,
      '0',
    )


  return (
    `${year}${month}${day}` +
    `-${hours}${minutes}${seconds}`
  )
}


/* ============================================================
   AIRTABLE MESSAGE

   IMPORTANT:
   No payment proof information is included here.
============================================================ */

function buildMessage(
  payload: SubmissionPayload,
) {
  if (
    payload.submission_type ===
    'contact'
  ) {
    return (
      payload.message ||
      ''
    )
  }


  return [
    'Brand Before You Sell registration',

    `Current role: ${
      payload.role ||
      'Not provided'
    }`,

    `How they heard about Broker Bootcamp: ${
      payload.how_heard ||
      'Not provided'
    }`,
  ].join(
    '\n',
  )
}


/* ============================================================
   AIRTABLE INTERNAL NOTES

   IMPORTANT:
   No receipt filename, path or attachment information
   is included here.
============================================================ */

function buildInternalNotes(
  payload: SubmissionPayload,
) {
  const attribution =
    getAttribution()


  return [
    `Privacy consent: ${
      payload.consent
        ? 'Confirmed'
        : 'Not confirmed'
    }`,

    `Page: ${
      attribution.page_url
    }`,

    attribution.referrer
      ? `Referrer: ${attribution.referrer}`
      : null,

    attribution.utm_source
      ? `UTM source: ${attribution.utm_source}`
      : null,

    attribution.utm_medium
      ? `UTM medium: ${attribution.utm_medium}`
      : null,

    attribution.utm_campaign
      ? `UTM campaign: ${attribution.utm_campaign}`
      : null,

    attribution.utm_content
      ? `UTM content: ${attribution.utm_content}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')
}


/* ============================================================
   PAYMENT PROOF UPLOAD

   Stored privately in Supabase.

   Example filename:

   JOEL-STUURMAN_20260821-103522_7F3A91.jpg
============================================================ */

export async function uploadPaymentProof(
  file: File,
  registrantName: string,
): Promise<PaymentProofUploadResult> {

  const supabaseUrl =
    import.meta.env
      .VITE_SUPABASE_URL
      ?.replace(
        /\/$/,
        '',
      )


  const anonKey =
    import.meta.env
      .VITE_SUPABASE_ANON_KEY


  if (
    !supabaseUrl ||
    !anonKey
  ) {
    return {
      ok: false,

      code:
        'not_configured',

      message:
        'Payment uploads are not configured yet.',
    }
  }


  /* ----------------------------------------------------------
     ALLOWED FILE TYPES
  ---------------------------------------------------------- */

  const extensions: Record<
    string,
    string
  > = {
    'image/jpeg':
      'jpg',

    'image/png':
      'png',

    'application/pdf':
      'pdf',
  }


  const extension =
    extensions[
      file.type
    ]


  if (!extension) {
    return {
      ok: false,

      code:
        'invalid_file_type',

      message:
        'Please upload a JPG, PNG or PDF.',
    }
  }


  /* ----------------------------------------------------------
     FILE SIZE
  ---------------------------------------------------------- */

  const maxFileSize =
    8 *
    1024 *
    1024


  if (
    file.size >
    maxFileSize
  ) {
    return {
      ok: false,

      code:
        'file_too_large',

      message:
        'The payment proof must be smaller than 8 MB.',
    }
  }


  /* ----------------------------------------------------------
     IDENTIFIABLE PRIVATE FILENAME
  ---------------------------------------------------------- */

  const safeName =
    createSafeName(
      registrantName,
    ) ||
    'REGISTRANT'


  const timestamp =
    createTimestamp()


  const uniqueCode =
    crypto
      .randomUUID()
      .replace(
        /-/g,
        '',
      )
      .slice(
        0,
        6,
      )
      .toUpperCase()


  const filename =
    `${safeName}_` +
    `${timestamp}_` +
    `${uniqueCode}.` +
    `${extension}`


  const path =
    `${EVENT_SLUG}/${filename}`


  const encodedPath =
    path
      .split('/')
      .map(
        (part) =>
          encodeURIComponent(
            part,
          ),
      )
      .join('/')


  /* ----------------------------------------------------------
     UPLOAD TO PRIVATE SUPABASE STORAGE
  ---------------------------------------------------------- */

  const response =
    await fetch(
      `${supabaseUrl}/storage/v1/object/${PAYMENT_PROOF_BUCKET}/${encodedPath}`,
      {
        method:
          'POST',

        headers: {
          apikey:
            anonKey,

          Authorization:
            `Bearer ${anonKey}`,

          'Content-Type':
            file.type,

          'x-upsert':
            'false',
        },

        body:
          file,
      },
    )


  if (
    !response.ok
  ) {
    const data =
      await response
        .json()
        .catch(
          () =>
            null,
        )


    return {
      ok: false,

      code:
        'upload_failed',

      message:
        data?.message ||
        data?.error ||
        'We could not upload your payment proof. Please try again.',
    }
  }


  return {
    ok: true,
    path,
  }
}


/* ============================================================
   FORM SUBMISSION
============================================================ */

export async function submitForm(
  payload: SubmissionPayload,
): Promise<ApiResponse> {

  const supabaseUrl =
    import.meta.env
      .VITE_SUPABASE_URL
      ?.replace(
        /\/$/,
        '',
      )


  const anonKey =
    import.meta.env
      .VITE_SUPABASE_ANON_KEY


  if (
    !supabaseUrl ||
    !anonKey
  ) {
    return {
      ok: false,

      code:
        'not_configured',

      message:
        'Online submissions are being configured. Please try again soon.',
    }
  }


  /*
    Honeypot submissions get a neutral success response.
  */

  if (
    payload.website
  ) {
    return {
      ok: true,
    }
  }


  /* ----------------------------------------------------------
     AIRTABLE / EXISTING EDGE FUNCTION PAYLOAD

     Notice:
     payment_proof_path DOES NOT appear anywhere below.
  ---------------------------------------------------------- */

  const inquiryPayload = {

    name:
      payload.name,

    email:
      payload.email,

    number:
      payload.number,

    company:
      payload.company,

    message:
      buildMessage(
        payload,
      ),

    internal_notes:
      buildInternalNotes(
        payload,
      ),

    event_slug:
      EVENT_SLUG,

    property_slug:
      null,

    source:
      SOURCE,

    entry_type:
      payload
        .submission_type ===
      'registration'
        ? 'registration'
        : 'contact_request',

    inquiry_type:
      payload
        .submission_type ===
      'registration'
        ? 'event_registration'
        : 'event_contact',
  }


  const response =
    await fetch(
      `${supabaseUrl}/functions/v1/${SHARED_INQUIRIES_FUNCTION}`,
      {
        method:
          'POST',

        headers: {
          'Content-Type':
            'application/json',

          apikey:
            anonKey,

          Authorization:
            `Bearer ${anonKey}`,
        },

        body:
          JSON.stringify({
            mode:
              'submit_inquiry',

            payload:
              inquiryPayload,
          }),
      },
    )


  const data =
    (
      await response
        .json()
        .catch(
          () =>
            null,
        )
    ) as ApiResponse | null


  if (
    !response.ok
  ) {
    return {
      ok: false,

      code:
        data?.code ||
        'request_failed',

      message:
        data?.message ||
        data?.error ||
        'We could not send your details. Please try again.',

      fieldErrors:
        data?.fieldErrors,
    }
  }


  return {
    ok: true,
  }
}