import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import {
  EVENT,
  EVENT_DATE_LONG,
  EVENT_TIME,
  EVENT_PRICE,
  EVENT_LOCATION,
  EVENT_START_ISO,
  EVENT_END_ISO,
} from './src/config/event'


const SITE_URL = 'https://www.thebrokerbootcamp.com'

const PAGE_TITLE =
  `${EVENT.name} | The Broker Bootcamp`

const PAGE_DESCRIPTION =
  `A practical personal-brand workshop for real estate professionals. ` +
  `Join ${EVENT.name} on ${EVENT_DATE_LONG}, from ${EVENT_TIME}. ` +
  `Workshop fee ${EVENT_PRICE}. Limited slots available.`

const OG_IMAGE =
  `${SITE_URL}/og.svg`

const OG_IMAGE_ALT =
  `${EVENT.name} — The Broker Bootcamp, ${EVENT_DATE_LONG}`


function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}


function createEventJsonLd() {
  const event: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'EducationEvent',

    name: EVENT.name,

    description:
      'A practical workshop designed to help real estate professionals become more memorable, credible, and intentional about the way they build trust in today’s market.',

    startDate: EVENT_START_ISO,
    endDate: EVENT_END_ISO,

    eventStatus:
      'https://schema.org/EventScheduled',

    eventAttendanceMode:
      'https://schema.org/OfflineEventAttendanceMode',

    url: SITE_URL,

    organizer: [
      {
        '@type': 'Organization',
        name: "She's That Broker",
      },
      {
        '@type': 'Organization',
        name: 'The Property Geek',
      },
    ],

    performer: [
      {
        '@type': 'Person',
        name: 'Maiko Williams',
      },
      {
        '@type': 'Person',
        name: 'Jireh Mamaclay',
      },
    ],

    offers: {
      '@type': 'Offer',
      price: EVENT.price,
      priceCurrency: 'PHP',
      availability:
        'https://schema.org/LimitedAvailability',
      url: `${SITE_URL}/#register`,
    },
  }


  /*
    Don't tell Google that "To Be Announced"
    is an actual venue.
  */
  if (
    EVENT_LOCATION.toLowerCase() !==
    'to be announced'
  ) {
    event.location = {
      '@type': 'Place',
      name: EVENT_LOCATION,
    }
  }


  return event
}


const eventSeoPlugin = {
  name: 'broker-bootcamp-event-seo',

  transformIndexHtml(html: string) {
    const jsonLd = JSON.stringify(
      createEventJsonLd(),
      null,
      2,
    ).replace(/</g, '\\u003c')


    const seo = `
    <title>${escapeHtml(PAGE_TITLE)}</title>

    <meta
      name="description"
      content="${escapeHtml(PAGE_DESCRIPTION)}"
    />

    <meta name="robots" content="index, follow" />

    <link
      rel="canonical"
      href="${SITE_URL}/"
    />


    <!-- Open Graph -->

    <meta property="og:type" content="website" />

    <meta
      property="og:site_name"
      content="The Broker Bootcamp"
    />

    <meta
      property="og:title"
      content="${escapeHtml(PAGE_TITLE)}"
    />

    <meta
      property="og:description"
      content="${escapeHtml(PAGE_DESCRIPTION)}"
    />

    <meta
      property="og:url"
      content="${SITE_URL}/"
    />

    <meta
      property="og:image"
      content="${OG_IMAGE}"
    />

    <meta
      property="og:image:width"
      content="1200"
    />

    <meta
      property="og:image:height"
      content="630"
    />

    <meta
      property="og:image:alt"
      content="${escapeHtml(OG_IMAGE_ALT)}"
    />


    <!-- Twitter -->

    <meta
      name="twitter:card"
      content="summary_large_image"
    />

    <meta
      name="twitter:title"
      content="${escapeHtml(PAGE_TITLE)}"
    />

    <meta
      name="twitter:description"
      content="${escapeHtml(PAGE_DESCRIPTION)}"
    />

    <meta
      name="twitter:image"
      content="${OG_IMAGE}"
    />


    <!-- Event structured data -->

    <script type="application/ld+json">
${jsonLd}
    </script>
    `


    return html.replace(
      '<!-- EVENT_SEO -->',
      seo,
    )
  },
}


export default defineConfig({
  plugins: [
    react(),
    eventSeoPlugin,
  ],

  build: {
    target: 'es2022',
    sourcemap: true,
  },
})