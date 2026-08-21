export const EVENT = {
  name: 'Brand Before You Sell',

  date: '2026-10-10',

  time: {
    start: '3:00 PM',
    end: '6:00 PM',
  },

  price: 2500,

  locationLines: [
    'To Be',
    'Announced',
  ],
} as const


/* ============================================================
   DATE FORMATTING
============================================================ */

const eventDate = new Date(`${EVENT.date}T12:00:00+08:00`)

export const EVENT_DATE_SHORT = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'Asia/Manila',
})
  .format(eventDate)
  .toUpperCase()


export const EVENT_MONTH = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  timeZone: 'Asia/Manila',
})
  .format(eventDate)
  .toUpperCase()


export const EVENT_DAY = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  timeZone: 'Asia/Manila',
}).format(eventDate)

export const EVENT_YEAR = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  timeZone: 'Asia/Manila',
}).format(eventDate)

export const EVENT_DAY_YEAR = `${EVENT_DAY} ${EVENT_YEAR}`


/* ============================================================
   TIME
============================================================ */

export const EVENT_TIME = `${EVENT.time.start}–${EVENT.time.end}`


/* ============================================================
   PRICE
============================================================ */

export const EVENT_PRICE = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
}).format(EVENT.price)

/* ============================================================
   SEO / MACHINE-READABLE VALUES
============================================================ */

export const EVENT_DATE_LONG = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'Asia/Manila',
}).format(eventDate)


/*
  If you are using:
  locationLines: ['To Be', 'Announced']

  use this:
*/
export const EVENT_LOCATION = EVENT.locationLines.join(' ')


/*
  Convert "3:00 PM" → "15:00"
*/
function to24Hour(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)

  if (!match) {
    throw new Error(`Invalid event time: ${value}`)
  }

  let hour = Number(match[1])
  const minute = match[2]
  const period = match[3].toUpperCase()

  if (period === 'AM' && hour === 12) hour = 0
  if (period === 'PM' && hour !== 12) hour += 12

  return `${String(hour).padStart(2, '0')}:${minute}`
}


export const EVENT_START_ISO =
  `${EVENT.date}T${to24Hour(EVENT.time.start)}:00+08:00`

export const EVENT_END_ISO =
  `${EVENT.date}T${to24Hour(EVENT.time.end)}:00+08:00`