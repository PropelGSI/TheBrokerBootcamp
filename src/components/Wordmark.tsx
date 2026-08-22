type WordmarkProps = {
  inverted?: boolean
}

const LOGO_BLACK =
  'https://jwteutzqvthyrqtbcgln.supabase.co/storage/v1/object/public/websiteimages/Website%20BrokerBootcamp/thebrokerbootcampblack.png'

const LOGO_WHITE =
  'https://jwteutzqvthyrqtbcgln.supabase.co/storage/v1/object/public/websiteimages/Website%20BrokerBootcamp/brokerbootcampwhite.png'


export function Wordmark({
  inverted = false,
}: WordmarkProps) {

  return (
    <a
      href="#top"
      className={`wordmark ${
        inverted
          ? 'wordmark--inverted'
          : ''
      }`}
      aria-label="The Broker Bootcamp — back to top"
    >
      <img
        src={
          inverted
            ? LOGO_WHITE
            : LOGO_BLACK
        }
        alt="The Broker Bootcamp"
      />
    </a>
  )
}