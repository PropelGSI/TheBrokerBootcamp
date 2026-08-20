import { useEffect, useRef } from 'react'
import { SubmissionForm } from './SubmissionForm'

type ContactDialogProps = {
  open: boolean
  onClose: () => void
}

export function ContactDialog({ open, onClose }: ContactDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="contact-dialog"
      aria-labelledby="contact-dialog-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
    >
      <div className="dialog-panel">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close contact form">×</button>
        <p className="eyebrow">ASK THE TEAM</p>
        <h2 id="contact-dialog-title">Have a question?</h2>
        <p>Send it our way. We’ll use the details you provide to get back to you.</p>
        <SubmissionForm type="contact" idPrefix="dialog-contact" compact />
      </div>
    </dialog>
  )
}
