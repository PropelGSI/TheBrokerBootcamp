type WordmarkProps = {
  inverted?: boolean
}

export function Wordmark({ inverted = false }: WordmarkProps) {
  return (
    <a
      href="#top"
      className={`wordmark ${inverted ? 'wordmark--inverted' : ''}`}
      aria-label="The Broker Bootcamp — back to top"
    >
      <span>THE BROKER</span>
      <strong>BOOTCAMP</strong>
    </a>
  )
}
