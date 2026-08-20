export type AnalyticsEvent =
  | 'hero_register_click'
  | 'header_register_click'
  | 'mobile_sticky_register_click'
  | 'ask_question_click'
  | 'registration_form_start'
  | 'registration_success'
  | 'registration_error'
  | 'contact_form_start'
  | 'contact_success'
  | 'contact_error'
  | 'footer_register_click'

declare global {
  interface Window {
    brokerBootcampAnalytics?: (event: AnalyticsEvent, properties?: Record<string, unknown>) => void
  }
}

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  window.dispatchEvent(
    new CustomEvent('brokerbootcamp:analytics', { detail: { event, properties } }),
  )

  if (import.meta.env.VITE_ANALYTICS_PROVIDER && window.brokerBootcampAnalytics) {
    window.brokerBootcampAnalytics(event, properties)
  }
}
