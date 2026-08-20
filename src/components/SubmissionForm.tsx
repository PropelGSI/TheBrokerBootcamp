import { useRef, useState, type FormEvent } from 'react'
import { track } from '../lib/analytics'
import { submitForm, type SubmissionType } from '../lib/submissions'

type FormErrors = Record<string, string>

type SubmissionFormProps = {
  type: SubmissionType
  idPrefix: string
  compact?: boolean
  onSuccess?: () => void
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function value(form: FormData, key: string) {
  return String(form.get(key) || '').trim()
}

function validate(type: SubmissionType, data: FormData): FormErrors {
  const errors: FormErrors = {}
  const fullName = value(data, 'name')
  const email = value(data, 'email')

  if (fullName.length < 2) errors.name = 'Enter your full name.'
  if (!emailPattern.test(email)) errors.email = 'Enter a valid email address.'
  if (data.get('consent') !== 'true') errors.consent = 'Please confirm your privacy consent.'

  if (type === 'registration') {
    if (value(data, 'number').length < 7) errors.number = 'Enter a valid mobile or Viber number.'
    if (!value(data, 'role')) errors.role = 'Select your current role.'
  } else if (value(data, 'message').length < 10) {
    errors.message = 'Please enter a question with at least 10 characters.'
  }

  return errors
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <span className="field-error" id={id} role="alert">{message}</span>
}

export function SubmissionForm({ type, idPrefix, compact = false, onSuccess }: SubmissionFormProps) {
  const [errors, setErrors] = useState<FormErrors>({})
  const [generalError, setGeneralError] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const started = useRef(false)

  const isRegistration = type === 'registration'
  const successMessage = isRegistration
    ? 'Your registration has been received. We’ll contact you using the details you provided with your confirmation, venue, and final attendance information.'
    : 'Thank you. Your question has been sent to the Broker Bootcamp team.'

  const markStarted = () => {
    if (started.current) return
    started.current = true
    track(isRegistration ? 'registration_form_start' : 'contact_form_start')
  }

  const clearError = (field: string) => {
    if (!errors[field]) return
    setErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const formData = new FormData(formElement)
    const validationErrors = validate(type, formData)

    setGeneralError('')
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      const firstInvalid = formElement.querySelector<HTMLElement>(`[name="${Object.keys(validationErrors)[0]}"]`)
      firstInvalid?.focus()
      return
    }

    setStatus('loading')

    try {
      const result = await submitForm({
        submission_type: type,
        name: value(formData, 'name'),
        email: value(formData, 'email'),
        number: value(formData, 'number') || null,
        role: value(formData, 'role') || null,
        company: value(formData, 'company') || null,
        how_heard: value(formData, 'how_heard') || null,
        message: value(formData, 'message') || null,
        consent: formData.get('consent') === 'true',
        website: value(formData, 'website'),
      })

      if (!result.ok) {
        setStatus('idle')
        setGeneralError(result.message || 'We could not send your details. Please try again.')
        setErrors(result.fieldErrors || {})
        track(isRegistration ? 'registration_error' : 'contact_error', { code: result.code })
        return
      }

      formElement.reset()
      setStatus('success')
      track(isRegistration ? 'registration_success' : 'contact_success')
      onSuccess?.()
    } catch {
      setStatus('idle')
      setGeneralError('We could not connect right now. Please check your connection and try again.')
      track(isRegistration ? 'registration_error' : 'contact_error', { code: 'network_error' })
    }
  }

  if (status === 'success') {
    return (
      <div className="success-message" role="status" aria-live="polite">
        <span aria-hidden="true">✓</span>
        <h3>{isRegistration ? 'Registration received.' : 'Question sent.'}</h3>
        <p>{successMessage}</p>
        {!compact && (
          <button className="text-action" type="button" onClick={() => setStatus('idle')}>
            {isRegistration ? 'Add another registration' : 'Ask another question'}
          </button>
        )}
      </div>
    )
  }

  return (
    <form
      className={`submission-form ${compact ? 'submission-form--compact' : ''}`}
      onSubmit={handleSubmit}
      onFocus={markStarted}
      onChange={(event) => {
        const target = event.target
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLSelectElement ||
          target instanceof HTMLTextAreaElement
        ) {
          clearError(target.name)
        }
      }}
      noValidate
    >
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${idPrefix}-website`}>Website</label>
        <input id={`${idPrefix}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="form-grid">
        <div className="field field--full">
          <label htmlFor={`${idPrefix}-name`}>Full name <span aria-hidden="true">*</span></label>
          <input
            id={`${idPrefix}-name`}
            name="name"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${idPrefix}-name-error` : undefined}
            required
          />
          <FieldError id={`${idPrefix}-name-error`} message={errors.name} />
        </div>

        <div className="field">
          <label htmlFor={`${idPrefix}-email`}>Email address <span aria-hidden="true">*</span></label>
          <input
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${idPrefix}-email-error` : undefined}
            required
          />
          <FieldError id={`${idPrefix}-email-error`} message={errors.email} />
        </div>

        <div className="field">
          <label htmlFor={`${idPrefix}-number`}>
            {isRegistration ? 'Mobile or Viber number' : 'Mobile number'} {isRegistration && <span aria-hidden="true">*</span>}
          </label>
          <input
            id={`${idPrefix}-number`}
            name="number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.number)}
            aria-describedby={errors.number ? `${idPrefix}-number-error` : undefined}
            required={isRegistration}
          />
          <FieldError id={`${idPrefix}-number-error`} message={errors.number} />
        </div>

        {isRegistration ? (
          <>
            <div className="field">
              <label htmlFor={`${idPrefix}-role`}>Current role <span aria-hidden="true">*</span></label>
              <select
                id={`${idPrefix}-role`}
                name="role"
                defaultValue=""
                aria-invalid={Boolean(errors.role)}
                aria-describedby={errors.role ? `${idPrefix}-role-error` : undefined}
                required
              >
                <option value="" disabled>Select your role</option>
                <option>Licensed broker</option>
                <option>Real estate salesperson</option>
                <option>Property consultant or agent</option>
                <option>Real estate student</option>
                <option>Other</option>
              </select>
              <FieldError id={`${idPrefix}-role-error`} message={errors.role} />
            </div>

            <div className="field">
              <label htmlFor={`${idPrefix}-company`}>Brokerage or company <span>(optional)</span></label>
              <input id={`${idPrefix}-company`} name="company" type="text" autoComplete="organization" />
            </div>

            <div className="field field--full">
              <label htmlFor={`${idPrefix}-how-heard`}>How did you hear about Broker Bootcamp? <span>(optional)</span></label>
              <input id={`${idPrefix}-how-heard`} name="how_heard" type="text" />
            </div>
          </>
        ) : (
          <div className="field field--full">
            <label htmlFor={`${idPrefix}-message`}>Your question <span aria-hidden="true">*</span></label>
            <textarea
              id={`${idPrefix}-message`}
              name="message"
              rows={compact ? 4 : 6}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? `${idPrefix}-message-error` : undefined}
              required
            />
            <FieldError id={`${idPrefix}-message-error`} message={errors.message} />
          </div>
        )}
      </div>

      <div className="consent-field">
        <input
          id={`${idPrefix}-consent`}
          name="consent"
          type="checkbox"
          value="true"
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? `${idPrefix}-consent-error` : undefined}
          required
        />
        <label htmlFor={`${idPrefix}-consent`}>
          I consent to the Broker Bootcamp team using my details to respond to this submission and share relevant event updates. <span aria-hidden="true">*</span>
        </label>
      </div>
      <FieldError id={`${idPrefix}-consent-error`} message={errors.consent} />

      {generalError && <div className="form-alert" role="alert">{generalError}</div>}

      <button className="button button--dark form-submit" type="submit" disabled={status === 'loading'}>
        {status === 'loading'
          ? 'Sending…'
          : isRegistration
            ? 'Complete registration'
            : 'Send my question'}
        {status !== 'loading' && <span aria-hidden="true">↗</span>}
      </button>
    </form>
  )
}
