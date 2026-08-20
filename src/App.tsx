import { useState } from 'react'
import { ContactDialog } from './components/ContactDialog'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Portrait } from './components/Portrait'
import { Reveal } from './components/Reveal'
import { SubmissionForm } from './components/SubmissionForm'
import { Wordmark } from './components/Wordmark'
import { track } from './lib/analytics'

const manifestoLines = [
  'Before the listings.',
  'Before the presentations.',
  'Before the negotiations.',
  'Before the commission.',
]

const faqs = [
  {
    question: 'Who is Brand Before You Sell for?',
    answer:
      'The workshop is intended both for people starting their real estate careers and professionals looking to take their businesses to the next level.',
  },
  {
    question: 'When is the workshop?',
    answer:
      'Brand Before You Sell takes place on October 10, 2026, from 3:00 PM to 6:00 PM.',
  },
  {
    question: 'Where will the workshop be held?',
    answer:
      'The location is still to be announced. Registered attendees will receive the venue and final event details by email.',
  },
  {
    question: 'How much is the workshop and how do I pay?',
    answer:
      'The workshop fee is ₱2,500. After submitting your registration, we’ll send the payment instructions to your email. Your slot is confirmed once payment is received.',
  },
  {
    question: 'Is registration open?',
    answer:
      'Yes. Registration is now open and slots are limited. Complete the registration form, watch your inbox for the payment instructions, and complete payment to confirm your slot.',
  },
]

const images = {
  maiko:
    "https://jwteutzqvthyrqtbcgln.supabase.co/storage/v1/object/public/websiteimages/Website%20BrokerBootcamp/maiko-williams.png",

  jireh:
    "https://jwteutzqvthyrqtbcgln.supabase.co/storage/v1/object/public/websiteimages/Website%20BrokerBootcamp/jireh-mamaclay.png",

    runningClub:
    "https://jwteutzqvthyrqtbcgln.supabase.co/storage/v1/object/public/websiteimages/Website%20BrokerBootcamp/bbrunningclub.png",
  
  heroimage:
  "https://jwteutzqvthyrqtbcgln.supabase.co/storage/v1/object/public/websiteimages/Website%20BrokerBootcamp/STBTPGHERO.png",  

  };


function App() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <div className="site-wrap">
      <Header onContact={() => setContactOpen(true)} />
      <main id="main-content">
        <Hero onContact={() => setContactOpen(true)} />

<section
  className="manifesto section-dark"
  aria-labelledby="manifesto-title"
>
  <div className="shell manifesto-shell">

    {/* Section label */}
    <div className="section-index light-index">
      <span>01</span>
      WHY BRAND COMES FIRST
    </div>

    {/* Main belief */}
    <div className="manifesto-hero">
      <p className="eyebrow">
        TRUST STARTS BEFORE THE TRANSACTION
      </p>

      <Reveal>
        <h2 id="manifesto-title">
          <span className="manifesto-belief-main">
            People don&apos;t buy properties first.
          </span>

          <span className="manifesto-belief-accent">
            They buy people.
          </span>
        </h2>
      </Reveal>
    </div>

    {/* Supporting sequence */}
    <div className="manifesto-lines">
      {manifestoLines.map((line, index) => (
        <Reveal key={line} delay={index * 90}>
          <div className="manifesto-line">
            <span
              className="manifesto-line-icon"
              aria-hidden="true"
            >
              →
            </span>

            <p>{line}</p>
          </div>
        </Reveal>
      ))}
    </div>

    {/* Final payoff */}
    <Reveal delay={360}>
      <div className="manifesto-payoff">
        <p className="manifesto-payoff-label">
          BEFORE THE TRANSACTION
        </p>

        <p className="manifesto-payoff-text">
          People decide whether they{" "}
          <span>trust you.</span>
        </p>
      </div>
    </Reveal>

  </div>
</section>

        <section id="workshop" className="workshop section-light" aria-labelledby="workshop-title">
          <div className="shell">
            <div className="section-index"><span>02</span>THE WORKSHOP</div>
            <div className="workshop-grid">
              <Reveal className="workshop-heading">
                <p className="eyebrow">BRAND BEFORE YOU SELL</p>
                <h2 id="workshop-title">Build the reputation that arrives before you do.</h2>
              </Reveal>
              <Reveal className="workshop-body" delay={100}>
                <p className="body-lead">Brand Before You Sell is a practical workshop designed to help real estate professionals become more memorable, more credible, and more intentional about the way they build trust in today&apos;s market.</p>
                <p>Rather than chasing attention, the workshop explores how to build a reputation that attracts the right clients and creates opportunities that compound over time.</p>
                <p>The workshop is intended both for people starting their careers and professionals looking to take their businesses to the next level.</p>
              </Reveal>
            </div>
            <div className="workshop-values" aria-label="The workshop outcomes">
              <div><span>01</span><strong>BE MEMORABLE</strong></div>
              <div><span>02</span><strong>BUILD CREDIBILITY</strong></div>
              <div><span>03</span><strong>GROW WITH INTENT</strong></div>
            </div>
          </div>
        </section>

        <section id="speakers" className="speakers" aria-labelledby="speakers-title">
          <div className="shell">
            <div className="section-index"><span>03</span>MEET YOUR SPEAKERS</div>
            <Reveal className="speakers-heading">
              <p className="eyebrow">TWO VOICES. ONE STANDARD.</p>
              <h2 id="speakers-title">Practical perspective from people who teach real estate every day.</h2>
            </Reveal>

            <div className="speaker-grid">
              <Reveal>
                              <article className="speaker-card">
              <div className="speaker-image-wrap speaker-image-wrap--white">
                <Portrait
                  src={images.maiko}
                  alt="Maiko Williams, She's That Broker"
                  initials="MW"
                />
                <span className="speaker-number">01</span>
              </div>

                  <div className="speaker-meta">
                    <span>SHE&apos;S THAT BROKER</span>
                    <span>LICENSED BROKER</span>
                  </div>

                  <h3>Maiko Williams</h3>

                  <p>
                    One of the Philippines&apos; leading real estate content creators and
                    a licensed broker, helping thousands of Filipinos better understand
                    real estate through practical, educational content.
                  </p>
                </article>
              </Reveal>

              <Reveal delay={120}>
                <article className="speaker-card speaker-card--offset">
                  <div className="speaker-image-wrap speaker-image-wrap--lime">
                    <Portrait
                      src={images.jireh}
                      alt="Jireh Mamaclay, The Property Geek"
                      initials="JM"
                    />

                    <span className="speaker-number">02</span>
                  </div>

                  <div className="speaker-meta">
                    <span>THE PROPERTY GEEK</span>
                    <span>REAL ESTATE EDUCATOR</span>
                  </div>

                  <h3>Jireh Mamaclay</h3>

                  <p>
                    A respected real estate educator known for simplifying complex real
                    estate concepts and helping brokers communicate with greater clarity
                    and confidence.
                  </p>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

<section
  id="details"
  className="event-details section-lime"
  aria-labelledby="details-title"
>
  <div className="shell details-grid">

    {/* Left side */}
    <div className="details-copy">
      <div className="section-index">
        <span>04</span>
        SAVE THE DATE
      </div>

      <Reveal>
        <p className="eyebrow">BROKER BOOTCAMP 001</p>

        <h2 id="details-title">
          <span>One afternoon.</span>
          <span>A stronger foundation.</span>
        </h2>

        <p className="details-note">
          Venue details will be announced soon. Capacity is limited to keep the workshop interactive and valuable for every participant.
        </p>
      </Reveal>
    </div>

    {/* Event information */}
    <dl className="detail-list">

      <Reveal>
        <div className="detail-card">
          <dt>Date</dt>
          <dd>
            October
            <br />
            10, 2026
          </dd>
        </div>
      </Reveal>

      <Reveal delay={70}>
        <div className="detail-card">
          <dt>Time</dt>
          <dd>
            3:00 PM
            <br />
            — 6:00 PM
          </dd>
        </div>
      </Reveal>

      <Reveal delay={140}>
        <div className="detail-card">
          <dt>Location</dt>
          <dd>
            TO BE
            <br />
            ANNOUNCED
          </dd>
        </div>
      </Reveal>

      <Reveal delay={210}>
        <div className="detail-card detail-card--availability">
          <dt>Workshop Fee</dt>

          <dd>
            ₱2,500
          </dd>

          <span className="availability-cue">
            Payment after registration
            <span aria-hidden="true"> ↓</span>
          </span>
        </div>
      </Reveal>

    </dl>

  </div>
</section>

<section
  id="register"
  className="registration"
  aria-labelledby="registration-title"
>
  <div className="shell registration-grid">

    {/* Left copy */}
    <div className="registration-copy">
      <div className="section-index light-index">
        <span>05</span>
        REGISTRATION
      </div>

      <Reveal>
        <p className="eyebrow">START YOUR REGISTRATION</p>

        <h2 id="registration-title">
          Registration is now open.
        </h2>

        <p className="registration-intro">
          Register for Brand Before You Sell below. After submitting the form,
          we&apos;ll email you the payment instructions and event details.
          Your slot is confirmed once payment is received.
        </p>

        <div className="registration-callout">
          <span className="registration-fee-label">
            WORKSHOP FEE
          </span>

          <strong className="registration-fee-price">
            ₱2,500
          </strong>

          <p className="registration-fee-note">
            Payment instructions will be sent by email after registration.
            Your slot is confirmed once payment is received.
          </p>
        </div>

        <div className="registration-flow">
          <div className="registration-flow-step">
            <span>01</span>
            <p>Complete the form</p>
          </div>

          <div className="registration-flow-connector" />

          <div className="registration-flow-step">
            <span>02</span>
            <p>Receive payment details</p>
          </div>

          <div className="registration-flow-connector" />

          <div className="registration-flow-step">
            <span>03</span>
            <p>Confirm your slot</p>
          </div>
        </div>
      </Reveal>
            </div>

    {/* Registration form */}
    <div className="form-card">
      <SubmissionForm
        type="registration"
        idPrefix="registration"
      />
    </div>

  </div>
</section>

<section
  className="beginning section-light"
  aria-labelledby="beginning-title"
>
  <div className="shell">

    <div className="section-index">
      <span>06</span>
      THE COMMUNITY
    </div>

    {/* Top: message + experiences */}
    <div className="beginning-top">

      {/* Left — 2/3 */}
      <Reveal className="beginning-heading-block">
        <p className="eyebrow">
          THE BROKER BOOTCAMP
        </p>

        <h2 id="beginning-title">
          This Is Just
          <br />
          the Beginning.
        </h2>

        <div className="beginning-copy">
          <p className="body-lead">
            Brand Before You Sell is the first of many Broker Bootcamp
            experiences designed to help raise the standard of the real
            estate profession.
          </p>

          <p>
            The community is for professionals who believe success is earned
            through trust, integrity, and continuous growth.
          </p>
        </div>
      </Reveal>

      {/* Right — 1/3 */}
      <aside
        className="beginning-rail"
        aria-label="Broker Bootcamp community experiences"
      >
        <div className="beginning-rail-card beginning-rail-card--white">
          <span>01</span>
          <strong>WORKSHOPS</strong>
        </div>

        <div className="beginning-rail-card beginning-rail-card--dark">
          <span>02</span>
          <strong>COMMUNITY RUNS</strong>
        </div>

        <div className="beginning-rail-card beginning-rail-card--lime">
          <span>03</span>
          <strong>NETWORKING</strong>
        </div>

        <div className="beginning-rail-card beginning-rail-card--dark">
          <span>04</span>
          <strong>LEARNING SESSIONS</strong>
        </div>
      </aside>

    </div>

    {/* Full-width community proof */}
    <Reveal
      className="beginning-community-visual"
      delay={120}
    >
      <figure className="beginning-visual">

        <div className="beginning-group-image">
          <img
            src={images.runningClub}
            alt="Broker Bootcamp community members at a recent Running Club event"
            loading="lazy"
          />
        </div>

        <figcaption>
          <span>BROKER BOOTCAMP RUNNING CLUB</span>
          <span>COMMUNITY 001</span>
        </figcaption>

      </figure>
    </Reveal>

    {/* Closing statement */}
<Reveal className="closing-quote">
  <blockquote>
    Great brokers aren&apos;t built alone.
    <span>
      <mark>They&apos;re built together, over time.</mark>
    </span>
  </blockquote>
</Reveal>

  </div>
</section>

        <section id="faq" className="faq section-dark" aria-labelledby="faq-title">
          <div className="shell faq-grid">
            <div className="faq-heading">
              <div className="section-index light-index"><span>07</span>GOOD TO KNOW</div>
              <h2 id="faq-title">Questions, answered.</h2>
            </div>
            <div className="faq-list">
              {faqs.map((item, index) => (
                <details key={item.question}>
                  <summary><span>0{index + 1}</span>{item.question}<i aria-hidden="true">+</i></summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="contact section-light" aria-labelledby="contact-title">
          <div className="shell contact-grid">
            <div className="contact-copy">
              <div className="section-index"><span>08</span>GET IN TOUCH</div>
              <Reveal>
                <p className="eyebrow">STILL CURIOUS?</p>
                <h2 id="contact-title">Ask the Broker Bootcamp team.</h2>
                <p>Have a question about the workshop? Send it our way and we&apos;ll get back to you using the details you provide.</p>
              </Reveal>
            </div>
            <div className="contact-form-wrap">
              <SubmissionForm type="contact" idPrefix="page-contact" />
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="shell footer-shell">

          {/* =====================================
              MAIN FOOTER STATEMENT
          ===================================== */}

          <div className="footer-main">

            <div className="footer-message">
              <Wordmark inverted />

              <p className="footer-eyebrow">
                THE BROKER BOOTCAMP
              </p>

              <h2 className="footer-statement">
                <span>KEEP BUILDING.</span>
                <span>KEEP SHOWING UP.</span>
                <span>
                  KEEP RAISING
                  <mark>THE STANDARD.</mark>
                </span>
              </h2>
            </div>


            {/* =====================================
                NEXT EVENT / CTA
            ===================================== */}

            <div className="footer-event">

              <div className="footer-event-heading">
                <span>UP NEXT</span>
                <strong>001</strong>
              </div>

              <div className="footer-event-details">

                <div>
                  <span>DATE</span>
                  <strong>October 10, 2026</strong>
                </div>

                <div>
                  <span>TIME</span>
                  <strong>3:00–6:00 PM</strong>
                </div>

                <div>
                  <span>LOCATION</span>
                  <strong>TO BE ANNOUNCED</strong>
                </div>

                <div>
                  <span>WORKSHOP FEE</span>
                  <strong>₱2,500</strong>
                </div>

              </div>

              <a
                className="button button--lime footer-register"
                href="#register"
                onClick={() => track('footer_register_click')}
              >
                Register now
                <span aria-hidden="true">↗</span>
              </a>

            </div>

          </div>


          {/* =====================================
              PRESENTED BY
          ===================================== */}

          <div className="footer-presented">
            <span>PRESENTED BY</span>

            <strong>
              She&apos;s That Broker
              <span aria-hidden="true"> × </span>
              The Property Geek
            </strong>
          </div>


          {/* =====================================
              BOTTOM BAR
          ===================================== */}

          <div className="footer-bottom">
            <span>© 2026 THE BROKER BOOTCAMP</span>

            <span>BRAND BEFORE YOU SELL</span>

            <a href="#top">
              BACK TO TOP ↑
            </a>
          </div>

        </div>
      </footer>

      <a
        className="mobile-register"
        href="#register"
        onClick={() => track('mobile_sticky_register_click')}
      >
        <span>LIMITED SLOTS</span><strong>REGISTER ↗</strong>
      </a>

      <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  )
}

export default App
