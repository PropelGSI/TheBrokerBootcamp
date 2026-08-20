import { useState } from 'react'

type PortraitProps = {
  src: string
  alt: string
  initials: string
  className?: string
  eager?: boolean
}

export function Portrait({ src, alt, initials, className = '', eager = false }: PortraitProps) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={`portrait ${className}`}>
      {!failed && (
        <img
          className={loaded ? 'portrait-img--loaded' : ''}
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
        />
      )}
      {!loaded && (
        <div className="portrait-placeholder" role="img" aria-label={`${alt}. Portrait coming soon.`}>
          <span>{initials}</span>
          <small>PORTRAIT<br />COMING SOON</small>
        </div>
      )}
    </div>
  )
}
