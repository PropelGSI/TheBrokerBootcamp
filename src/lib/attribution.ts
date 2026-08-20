export type Attribution = {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  referrer: string | null
  page_url: string
}

export function getAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search)

  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    referrer: document.referrer || null,
    page_url: window.location.href,
  }
}
