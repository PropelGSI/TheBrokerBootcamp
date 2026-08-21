import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'

import { track } from '../lib/analytics'

import {
  submitForm,
  uploadPaymentProof,
  type SubmissionType,
} from '../lib/submissions'

import {
  EVENT,
  EVENT_DATE_SHORT,
  EVENT_TIME,
  EVENT_PRICE,
} from '../config/event'

import {
  PAYMENT,
  PAYMENT_READY,
} from '../config/payment'


/* ============================================================
   TYPES
============================================================ */

type FormErrors = Record<string, string>

type SubmissionFormProps = {
  type: SubmissionType
  idPrefix: string
  compact?: boolean
  onSuccess?: () => void
}

type RegistrationStep = 1 | 2 | 3

type RegistrationSummary = {
  name: string
  email: string
  number: string
  role: string
  company: string
}


/* ============================================================
   VALIDATION
============================================================ */

const emailPattern =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MAX_PROOF_SIZE =
  8 * 1024 * 1024

const acceptedProofTypes = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
])


function value(
  form: FormData,
  key: string,
) {
  return String(
    form.get(key) || '',
  ).trim()
}


function validateRegistrationDetails(
  data: FormData,
): FormErrors {
  const errors: FormErrors = {}

  const fullName =
    value(data, 'name')

  const email =
    value(data, 'email')

  const number =
    value(data, 'number')

  const role =
    value(data, 'role')


  if (fullName.length < 2) {
    errors.name =
      'Enter your full name.'
  }


  if (!emailPattern.test(email)) {
    errors.email =
      'Enter a valid email address.'
  }


  if (number.length < 7) {
    errors.number =
      'Enter a valid mobile or Viber number.'
  }


  if (!role) {
    errors.role =
      'Select your current role.'
  }


  return errors
}


function validateContact(
  data: FormData,
): FormErrors {
  const errors: FormErrors = {}

  const fullName =
    value(data, 'name')

  const email =
    value(data, 'email')

  const message =
    value(data, 'message')


  if (fullName.length < 2) {
    errors.name =
      'Enter your full name.'
  }


  if (!emailPattern.test(email)) {
    errors.email =
      'Enter a valid email address.'
  }


  if (message.length < 10) {
    errors.message =
      'Please enter a question with at least 10 characters.'
  }


  if (data.get('consent') !== 'true') {
    errors.consent =
      'Please confirm your privacy consent.'
  }


  return errors
}


/* ============================================================
   FIELD ERROR
============================================================ */

function FieldError({
  id,
  message,
}: {
  id: string
  message?: string
}) {
  if (!message) return null

  return (
    <span
      className="field-error"
      id={id}
      role="alert"
    >
      {message}
    </span>
  )
}


/* ============================================================
   COMPONENT
============================================================ */

export function SubmissionForm({
  type,
  idPrefix,
  compact = false,
  onSuccess,
}: SubmissionFormProps) {

  const formRef =
    useRef<HTMLFormElement>(null)

  const started =
    useRef(false)


  const [errors, setErrors] =
    useState<FormErrors>({})

  const [generalError, setGeneralError] =
    useState('')

  const [status, setStatus] =
    useState<
      'idle' |
      'loading' |
      'success'
    >('idle')

  const [
    registrationStep,
    setRegistrationStep,
  ] =
    useState<RegistrationStep>(1)

  const [proofFile, setProofFile] =
    useState<File | null>(null)

  const [
    uploadedProofPath,
    setUploadedProofPath,
  ] =
    useState<string | null>(null)

  const [
    registrationSummary,
    setRegistrationSummary,
  ] =
    useState<RegistrationSummary>({
      name: '',
      email: '',
      number: '',
      role: '',
      company: '',
    })


  const isRegistration =
    type === 'registration'


  const successMessage =
    isRegistration
      ? 'We’ve received your registration and proof of payment. Our team will verify your payment and send your confirmed attendance details by email.'
      : 'Thank you. Your question has been sent to the Broker Bootcamp team.'


  /* ==========================================================
     ANALYTICS
  ========================================================== */

  const markStarted = () => {
    if (started.current) return

    started.current = true

    track(
      isRegistration
        ? 'registration_form_start'
        : 'contact_form_start',
    )
  }


  /* ==========================================================
     ERROR HELPERS
  ========================================================== */

  const clearError = (
    field: string,
  ) => {
    if (!errors[field]) return

    setErrors((current) => {
      const next = {
        ...current,
      }

      delete next[field]

      return next
    })
  }


  const focusFirstError = (
    formElement: HTMLFormElement,
    validationErrors: FormErrors,
  ) => {
    const firstField =
      Object.keys(validationErrors)[0]

    if (!firstField) return

    formElement
      .querySelector<HTMLElement>(
        `[name="${firstField}"]`,
      )
      ?.focus()
  }


  /* ==========================================================
     STEP 01 → PAYMENT
  ========================================================== */

  const goToPayment = () => {
    const formElement =
      formRef.current

    if (!formElement) return


    const formData =
      new FormData(formElement)


    const validationErrors =
      validateRegistrationDetails(
        formData,
      )


    setGeneralError('')
    setErrors(validationErrors)


    if (
      Object.keys(
        validationErrors,
      ).length > 0
    ) {
      focusFirstError(
        formElement,
        validationErrors,
      )

      return
    }


    setRegistrationSummary({
      name:
        value(formData, 'name'),

      email:
        value(formData, 'email'),

      number:
        value(formData, 'number'),

      role:
        value(formData, 'role'),

      company:
        value(formData, 'company'),
    })


    setRegistrationStep(2)


    track(
      'registration_payment_step',
    )
  }


  /* ==========================================================
     STEP 02 → CONFIRM
  ========================================================== */

  const goToConfirmation = () => {
    setGeneralError('')


    if (!PAYMENT_READY) {
      setGeneralError(
        'Payment details are not available yet.',
      )

      return
    }


    setRegistrationStep(3)


    track(
      'registration_confirmation_step',
    )
  }


  /* ==========================================================
     PAYMENT PROOF
  ========================================================== */

  const handleProofChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0] ||
      null


    setUploadedProofPath(null)

    clearError(
      'payment_proof',
    )


    if (!file) {
      setProofFile(null)
      return
    }


    if (
      !acceptedProofTypes.has(
        file.type,
      )
    ) {
      setProofFile(null)

      event.target.value = ''

      setErrors((current) => ({
        ...current,

        payment_proof:
          'Please upload a JPG, PNG or PDF.',
      }))

      return
    }


    if (
      file.size >
      MAX_PROOF_SIZE
    ) {
      setProofFile(null)

      event.target.value = ''

      setErrors((current) => ({
        ...current,

        payment_proof:
          'The file must be smaller than 8 MB.',
      }))

      return
    }


    setProofFile(file)
  }


  /* ==========================================================
     SUBMIT
  ========================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()


    const formElement =
      event.currentTarget


    if (
      isRegistration &&
      registrationStep === 1
    ) {
      goToPayment()
      return
    }


    if (
      isRegistration &&
      registrationStep === 2
    ) {
      goToConfirmation()
      return
    }


    const formData =
      new FormData(formElement)


    const validationErrors =
      isRegistration
        ? validateRegistrationDetails(
            formData,
          )
        : validateContact(
            formData,
          )


    if (
      isRegistration &&
      formData.get('consent') !==
        'true'
    ) {
      validationErrors.consent =
        'Please confirm your privacy consent.'
    }


    if (
      isRegistration &&
      !proofFile &&
      !uploadedProofPath
    ) {
      validationErrors.payment_proof =
        'Upload your proof of payment.'
    }


    setGeneralError('')
    setErrors(validationErrors)


    if (
      Object.keys(
        validationErrors,
      ).length > 0
    ) {
      focusFirstError(
        formElement,
        validationErrors,
      )

      return
    }


    setStatus('loading')


    try {

      let paymentProofPath =
        uploadedProofPath


      /* ------------------------------------------------------
         UPLOAD PROOF
      ------------------------------------------------------ */

      if (
        isRegistration &&
        proofFile &&
        !paymentProofPath
      ) {

        const upload =
          await uploadPaymentProof(
            proofFile,
            value(
              formData,
              'name',
            ),
          )


        if (!upload.ok) {
          setStatus('idle')

          setGeneralError(
            upload.message,
          )

          track(
            'registration_error',
            {
              code:
                upload.code,
            },
          )

          return
        }


        paymentProofPath =
          upload.path


        setUploadedProofPath(
          upload.path,
        )
      }


      /* ------------------------------------------------------
         SEND FORM
      ------------------------------------------------------ */

      const result =
        await submitForm({

          submission_type:
            type,

          name:
            value(
              formData,
              'name',
            ),

          email:
            value(
              formData,
              'email',
            ),

          number:
            value(
              formData,
              'number',
            ) || null,

          role:
            value(
              formData,
              'role',
            ) || null,

          company:
            value(
              formData,
              'company',
            ) || null,

          how_heard:
            value(
              formData,
              'how_heard',
            ) || null,

          message:
            value(
              formData,
              'message',
            ) || null,

          consent:
            formData.get(
              'consent',
            ) === 'true',

          website:
            value(
              formData,
              'website',
            ),

          payment_proof_path:
            paymentProofPath,
        })


      if (!result.ok) {
        setStatus('idle')

        setGeneralError(
          result.message ||
            'We could not send your details. Please try again.',
        )

        setErrors(
          result.fieldErrors ||
            {},
        )

        track(
          isRegistration
            ? 'registration_error'
            : 'contact_error',
          {
            code:
              result.code,
          },
        )

        return
      }


      formElement.reset()

      setProofFile(null)

      setUploadedProofPath(null)

      setStatus('success')


      track(
        isRegistration
          ? 'registration_success'
          : 'contact_success',
      )


      onSuccess?.()

    } catch {

      setStatus('idle')


      setGeneralError(
        'We could not connect right now. Please check your connection and try again.',
      )


      track(
        isRegistration
          ? 'registration_error'
          : 'contact_error',
        {
          code:
            'network_error',
        },
      )
    }
  }


  /* ==========================================================
     RESET
  ========================================================== */

  const startAnotherSubmission =
    () => {

      setStatus('idle')

      setRegistrationStep(1)

      setErrors({})

      setGeneralError('')

      setProofFile(null)

      setUploadedProofPath(null)

      setRegistrationSummary({
        name: '',
        email: '',
        number: '',
        role: '',
        company: '',
      })

      started.current = false
    }


  /* ==========================================================
     SUCCESS
  ========================================================== */

  if (status === 'success') {

    return (

      <div
        className="success-message"
        role="status"
        aria-live="polite"
      >

        <span aria-hidden="true">
          ✓
        </span>


        <h3>
          {isRegistration
            ? 'Registration received.'
            : 'Question sent.'}
        </h3>


        <p>
          {successMessage}
        </p>


        {!compact && (

          <button
            className="text-action"
            type="button"
            onClick={
              startAnotherSubmission
            }
          >
            {isRegistration
              ? 'Add another registration'
              : 'Ask another question'}
          </button>

        )}

      </div>

    )
  }


  /* ==========================================================
     FORM
  ========================================================== */

  return (

    <form
      ref={formRef}
      className={
        `submission-form ${
          compact
            ? 'submission-form--compact'
            : ''
        }`
      }
      onSubmit={handleSubmit}
      onFocus={markStarted}
      onChange={(event) => {

        const target =
          event.target


        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLSelectElement ||
          target instanceof HTMLTextAreaElement
        ) {
          clearError(
            target.name,
          )
        }

      }}
      noValidate
    >


      {/* ======================================================
          HONEYPOT
      ====================================================== */}

      <div
        className="honeypot"
        aria-hidden="true"
      >

        <label
          htmlFor={`${idPrefix}-website`}
        >
          Website
        </label>

        <input
          id={`${idPrefix}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />

      </div>


      {/* ======================================================
          REGISTRATION PROGRESS
      ====================================================== */}

      {isRegistration && (

        <div
          className="registration-wizard-progress"
          aria-label={
            `Registration step ${registrationStep} of 3`
          }
        >

          <div
            className={
              registrationStep === 1
                ? 'is-active'
                : registrationStep > 1
                  ? 'is-complete'
                  : ''
            }
          >
            <span>01</span>
            <strong>DETAILS</strong>
          </div>


          <div
            className={
              registrationStep === 2
                ? 'is-active'
                : registrationStep > 2
                  ? 'is-complete'
                  : ''
            }
          >
            <span>02</span>
            <strong>PAYMENT</strong>
          </div>


          <div
            className={
              registrationStep === 3
                ? 'is-active'
                : ''
            }
          >
            <span>03</span>
            <strong>CONFIRM</strong>
          </div>

        </div>

      )}


      {/* ======================================================
          STEP 01 — DETAILS
      ====================================================== */}

      {isRegistration && (

        <div
          className="wizard-panel"
          hidden={
            registrationStep !== 1
          }
        >

          <div className="wizard-heading">

            <span>
              01 / 03
            </span>

            <h3>
              Tell us about yourself.
            </h3>

            <p>
              Enter the details we&apos;ll
              use for your registration
              and event confirmation.
            </p>

          </div>


          <div className="form-grid">


            <div className="field field--full">

              <label
                htmlFor={`${idPrefix}-name`}
              >
                Full name{' '}
                <span aria-hidden="true">
                  *
                </span>
              </label>

              <input
                id={`${idPrefix}-name`}
                name="name"
                type="text"
                autoComplete="name"
                aria-invalid={
                  Boolean(
                    errors.name,
                  )
                }
                aria-describedby={
                  errors.name
                    ? `${idPrefix}-name-error`
                    : undefined
                }
                required
              />

              <FieldError
                id={`${idPrefix}-name-error`}
                message={
                  errors.name
                }
              />

            </div>


            <div className="field">

              <label
                htmlFor={`${idPrefix}-email`}
              >
                Email address{' '}
                <span aria-hidden="true">
                  *
                </span>
              </label>

              <input
                id={`${idPrefix}-email`}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-invalid={
                  Boolean(
                    errors.email,
                  )
                }
                aria-describedby={
                  errors.email
                    ? `${idPrefix}-email-error`
                    : undefined
                }
                required
              />

              <FieldError
                id={`${idPrefix}-email-error`}
                message={
                  errors.email
                }
              />

            </div>


            <div className="field">

              <label
                htmlFor={`${idPrefix}-number`}
              >
                Mobile or Viber number{' '}
                <span aria-hidden="true">
                  *
                </span>
              </label>

              <input
                id={`${idPrefix}-number`}
                name="number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={
                  Boolean(
                    errors.number,
                  )
                }
                aria-describedby={
                  errors.number
                    ? `${idPrefix}-number-error`
                    : undefined
                }
                required
              />

              <FieldError
                id={`${idPrefix}-number-error`}
                message={
                  errors.number
                }
              />

            </div>


            <div className="field">

              <label
                htmlFor={`${idPrefix}-role`}
              >
                Current role{' '}
                <span aria-hidden="true">
                  *
                </span>
              </label>

              <select
                id={`${idPrefix}-role`}
                name="role"
                defaultValue=""
                aria-invalid={
                  Boolean(
                    errors.role,
                  )
                }
                aria-describedby={
                  errors.role
                    ? `${idPrefix}-role-error`
                    : undefined
                }
                required
              >

                <option
                  value=""
                  disabled
                >
                  Select your role
                </option>

                <option>
                  Licensed broker
                </option>

                <option>
                  Real estate salesperson
                </option>

                <option>
                  Property consultant or agent
                </option>

                <option>
                  Real estate student
                </option>

                <option>
                  Other
                </option>

              </select>

              <FieldError
                id={`${idPrefix}-role-error`}
                message={
                  errors.role
                }
              />

            </div>


            <div className="field">

              <label
                htmlFor={`${idPrefix}-company`}
              >
                Brokerage or company{' '}
                <span>
                  (optional)
                </span>
              </label>

              <input
                id={`${idPrefix}-company`}
                name="company"
                type="text"
                autoComplete="organization"
              />

            </div>


            <div className="field field--full">

              <label
                htmlFor={`${idPrefix}-how-heard`}
              >
                How did you hear about Broker Bootcamp?{' '}
                <span>
                  (optional)
                </span>
              </label>

              <input
                id={`${idPrefix}-how-heard`}
                name="how_heard"
                type="text"
              />

            </div>

          </div>


          <div className="wizard-actions wizard-actions--end">

            <button
              className="button button--dark"
              type="button"
              onClick={
                goToPayment
              }
            >
              Continue to payment

              <span aria-hidden="true">
                →
              </span>
            </button>

          </div>

        </div>

      )}


      {/* ======================================================
          STEP 02 — PAYMENT
      ====================================================== */}

      {isRegistration && (

        <div
          className="wizard-panel"
          hidden={
            registrationStep !== 2
          }
        >

          <div className="wizard-heading">

            <span>
              02 / 03
            </span>

            <h3>
              Complete your payment.
            </h3>

            <p>
              Choose either GCash or GoTyme Bank
              and pay the workshop fee using the QR code.
            </p>

          </div>


          <div className="payment-total">

            <span>
              WORKSHOP FEE
            </span>

            <strong>
              {EVENT_PRICE}
            </strong>

          </div>


          {!PAYMENT_READY && (

            <div
              className="payment-not-ready"
              role="status"
            >
              Payment details are being finalized.
            </div>

          )}


          <div className="payment-methods-grid">


            {/* GCASH */}

            {PAYMENT.gcash.enabled && (

              <article className="payment-method">

                <div className="payment-method-heading">

                  <span className="payment-method-number">
                    01
                  </span>

                  <strong>
                    GCash
                  </strong>

                </div>


                <a
                  className="payment-qr-link"
                  href={
                    PAYMENT.gcash.qrImageUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open GCash QR code full size"
                >

                  <img
                    className="payment-qr"
                    src={
                      PAYMENT.gcash.qrImageUrl
                    }
                    alt="GCash payment QR code"
                  />

                </a>


                <div className="payment-method-bottom">

                  <div className="payment-scan-copy">

                    <strong>
                      Scan this QR code to pay
                    </strong>

                    <span>
                      Use your GCash app.
                    </span>

                  </div>


                  <a
                    className="payment-enlarge"
                    href={
                      PAYMENT.gcash.qrImageUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View full size

                    <span aria-hidden="true">
                      ↗
                    </span>
                  </a>

                </div>

              </article>

            )}


            {/* GOTYME */}

            {PAYMENT.bank.enabled && (

              <article className="payment-method">

                <div className="payment-method-heading">

                  <span className="payment-method-number">
                    02
                  </span>

                  <strong>
                    GoTyme Bank
                  </strong>

                </div>


                <a
                  className="payment-qr-link"
                  href={
                    PAYMENT.bank.qrImageUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open GoTyme Bank QR code full size"
                >

                  <img
                    className="payment-qr"
                    src={
                      PAYMENT.bank.qrImageUrl
                    }
                    alt="GoTyme Bank payment QR code"
                  />

                </a>


                <div className="payment-method-bottom">

                  <div className="payment-scan-copy">

                    <strong>
                      Scan this QR code to pay
                    </strong>

                    <span>
                      Use your banking or e-wallet app.
                    </span>

                  </div>


                  <a
                    className="payment-enlarge"
                    href={
                      PAYMENT.bank.qrImageUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View full size

                    <span aria-hidden="true">
                      ↗
                    </span>
                  </a>

                </div>

              </article>

            )}

          </div>


          <p className="payment-instruction">
            Once payment is complete, continue to the next step
            and upload your payment confirmation.
          </p>


          {generalError && (

            <div
              className="form-alert"
              role="alert"
            >
              {generalError}
            </div>

          )}


          <div className="wizard-actions">

            <button
              className="wizard-back"
              type="button"
              onClick={() => {
                setGeneralError('')
                setRegistrationStep(1)
              }}
            >
              ← Back
            </button>


            <button
              className="button button--dark"
              type="button"
              disabled={
                !PAYMENT_READY
              }
              onClick={
                goToConfirmation
              }
            >
              I&apos;ve paid

              <span aria-hidden="true">
                →
              </span>
            </button>

          </div>

        </div>

      )}


      {/* ======================================================
          STEP 03 — CONFIRM
      ====================================================== */}

      {isRegistration && (

        <div
          className="wizard-panel"
          hidden={
            registrationStep !== 3
          }
        >

          <div className="wizard-heading">

            <span>
              03 / 03
            </span>

            <h3>
              Confirm your registration.
            </h3>

            <p>
              Upload your proof of payment
              and review your registration
              before submitting.
            </p>

          </div>


          <div className="registration-summary">


            <div>

              <span>
                ATTENDEE
              </span>

              <strong>
                {
                  registrationSummary
                    .name
                }
              </strong>

              <small>
                {
                  registrationSummary
                    .email
                }
              </small>

            </div>


            <div>

              <span>
                WORKSHOP
              </span>

              <strong>
                {EVENT.name}
              </strong>

              <small>
                {EVENT_DATE_SHORT}
                {' · '}
                {EVENT_TIME}
              </small>

            </div>


            <div>

              <span>
                WORKSHOP FEE
              </span>

              <strong>
                {EVENT_PRICE}
              </strong>

            </div>

          </div>


          <div className="proof-field">

            <span className="proof-label">
              PROOF OF PAYMENT *
            </span>


            <label
              className={
                `proof-upload ${
                  proofFile
                    ? 'proof-upload--selected'
                    : ''
                }`
              }
              htmlFor={`${idPrefix}-payment-proof`}
            >

              <input
                id={`${idPrefix}-payment-proof`}
                name="payment_proof"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={
                  handleProofChange
                }
              />


              <span>
                {proofFile
                  ? 'PAYMENT PROOF SELECTED'
                  : 'UPLOAD PAYMENT PROOF'}
              </span>


              <strong>
                {proofFile
                  ? proofFile.name
                  : 'Choose JPG, PNG or PDF'}
              </strong>


              <small>
                Maximum file size: 8 MB
              </small>

            </label>


            <FieldError
              id={`${idPrefix}-payment-proof-error`}
              message={
                errors.payment_proof
              }
            />

          </div>


          <div className="consent-field">

            <input
              id={`${idPrefix}-consent`}
              name="consent"
              type="checkbox"
              value="true"
              aria-invalid={
                Boolean(
                  errors.consent,
                )
              }
              aria-describedby={
                errors.consent
                  ? `${idPrefix}-consent-error`
                  : undefined
              }
              required
            />


            <label
              htmlFor={`${idPrefix}-consent`}
            >
              I consent to the Broker Bootcamp
              team using my details to process
              this registration, verify my
              payment, and share relevant event
              updates.{' '}

              <span aria-hidden="true">
                *
              </span>
            </label>

          </div>


          <FieldError
            id={`${idPrefix}-consent-error`}
            message={
              errors.consent
            }
          />


          {generalError && (

            <div
              className="form-alert"
              role="alert"
            >
              {generalError}
            </div>

          )}


          <div className="wizard-actions">

            <button
              className="wizard-back"
              type="button"
              disabled={
                status === 'loading'
              }
              onClick={() => {
                setGeneralError('')
                setRegistrationStep(2)
              }}
            >
              ← Back
            </button>


            <button
              className="button button--dark"
              type="submit"
              disabled={
                status === 'loading'
              }
            >

              {status === 'loading'
                ? 'Submitting…'
                : 'Complete registration'}


              {status !== 'loading' && (

                <span aria-hidden="true">
                  ↗
                </span>

              )}

            </button>

          </div>

        </div>

      )}


      {/* ======================================================
          CONTACT FORM
      ====================================================== */}

      {!isRegistration && (

        <>

          <div className="form-grid">


            <div className="field field--full">

              <label
                htmlFor={`${idPrefix}-name`}
              >
                Full name{' '}
                <span aria-hidden="true">
                  *
                </span>
              </label>

              <input
                id={`${idPrefix}-name`}
                name="name"
                type="text"
                autoComplete="name"
                aria-invalid={
                  Boolean(
                    errors.name,
                  )
                }
                aria-describedby={
                  errors.name
                    ? `${idPrefix}-name-error`
                    : undefined
                }
                required
              />

              <FieldError
                id={`${idPrefix}-name-error`}
                message={
                  errors.name
                }
              />

            </div>


            <div className="field">

              <label
                htmlFor={`${idPrefix}-email`}
              >
                Email address{' '}
                <span aria-hidden="true">
                  *
                </span>
              </label>

              <input
                id={`${idPrefix}-email`}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-invalid={
                  Boolean(
                    errors.email,
                  )
                }
                aria-describedby={
                  errors.email
                    ? `${idPrefix}-email-error`
                    : undefined
                }
                required
              />

              <FieldError
                id={`${idPrefix}-email-error`}
                message={
                  errors.email
                }
              />

            </div>


            <div className="field">

              <label
                htmlFor={`${idPrefix}-number`}
              >
                Mobile number
              </label>

              <input
                id={`${idPrefix}-number`}
                name="number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
              />

            </div>


            <div className="field field--full">

              <label
                htmlFor={`${idPrefix}-message`}
              >
                Your question{' '}
                <span aria-hidden="true">
                  *
                </span>
              </label>

              <textarea
                id={`${idPrefix}-message`}
                name="message"
                rows={
                  compact
                    ? 4
                    : 6
                }
                aria-invalid={
                  Boolean(
                    errors.message,
                  )
                }
                aria-describedby={
                  errors.message
                    ? `${idPrefix}-message-error`
                    : undefined
                }
                required
              />

              <FieldError
                id={`${idPrefix}-message-error`}
                message={
                  errors.message
                }
              />

            </div>

          </div>


          <div className="consent-field">

            <input
              id={`${idPrefix}-consent`}
              name="consent"
              type="checkbox"
              value="true"
              aria-invalid={
                Boolean(
                  errors.consent,
                )
              }
              aria-describedby={
                errors.consent
                  ? `${idPrefix}-consent-error`
                  : undefined
              }
              required
            />


            <label
              htmlFor={`${idPrefix}-consent`}
            >
              I consent to the Broker Bootcamp
              team using my details to respond
              to this submission and share
              relevant event updates.{' '}

              <span aria-hidden="true">
                *
              </span>
            </label>

          </div>


          <FieldError
            id={`${idPrefix}-consent-error`}
            message={
              errors.consent
            }
          />


          {generalError && (

            <div
              className="form-alert"
              role="alert"
            >
              {generalError}
            </div>

          )}


          <button
            className="button button--dark form-submit"
            type="submit"
            disabled={
              status === 'loading'
            }
          >

            {status === 'loading'
              ? 'Sending…'
              : 'Send my question'}


            {status !== 'loading' && (

              <span aria-hidden="true">
                ↗
              </span>

            )}

          </button>

        </>

      )}

    </form>
  )
}