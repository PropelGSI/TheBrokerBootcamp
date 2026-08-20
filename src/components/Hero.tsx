import { track } from '../lib/analytics'

type HeroProps = {
  onContact: () => void
}

const heroImages = {
  speakers:
    'https://jwteutzqvthyrqtbcgln.supabase.co/storage/v1/object/public/websiteimages/Website%20BrokerBootcamp/speakers.png',
}

export function Hero({ onContact }: HeroProps) {
  return (
    <section
      id="top"
      className="hero"
      aria-labelledby="hero-title"
    >
      <div
        className="hero-grid"
        aria-hidden="true"
      />

      <div className="shell hero-shell">

        {/* =====================================
            LEFT — HERO COPY
        ===================================== */}

        <div className="hero-copy">
          <div className="hero-kicker">
            <span>BROKER BOOTCAMP 001</span>
          </div>

          <p className="hero-presented">
            Presented by She&apos;s That Broker × The Property Geek
          </p>

          <h1 id="hero-title">
            <span>BRAND BEFORE</span>
            <mark>YOU SELL</mark>
          </h1>

          <blockquote>
            “People don&apos;t buy properties first.
            <br />
            They buy people.”
          </blockquote>

          <p className="hero-summary">
            A practical workshop for real estate professionals ready to build
            trust, sharpen their presence, and become more intentional about
            the reputation they create.
          </p>

          <div className="hero-actions">
            <div className="hero-primary-action">
              <a
                className="button button--lime"
                href="#register"
                onClick={() => track('hero_register_click')}
              >
                Register now
                <span aria-hidden="true">↘</span>
              </a>

              <span>Limited slots available</span>
            </div>

            <button
              className="button button--outline-light"
              type="button"
              onClick={() => {
                track('ask_question_click')
                onContact()
              }}
            >
              Ask a question
            </button>
          </div>
        </div>


        {/* =====================================
            RIGHT — FEATURED SPEAKERS
        ===================================== */}

        <div
          className="hero-visual"
          aria-label="Featured speakers Maiko Williams and Jireh Mamaclay"
        >
          <img
            className="hero-speakers-image"
            src={heroImages.speakers}
            alt="Jireh Mamaclay of The Property Geek and Maiko Williams of She's That Broker"
            fetchPriority="high"
          />
        </div>


        {/* =====================================
            EVENT DETAILS
        ===================================== */}

        <dl className="hero-details">
          <div>
            <dt>Date</dt>
            <dd>October 10, 2026</dd>
          </div>

          <div>
            <dt>Time</dt>
            <dd>3:00–6:00 PM</dd>
          </div>

          <div>
            <dt>Location</dt>
            <dd>TO BE ANNOUNCED</dd>
          </div>
        </dl>

      </div>
    </section>
  )
}