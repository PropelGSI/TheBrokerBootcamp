import { useEffect, useState } from 'react'
import { track } from '../lib/analytics'
import { Wordmark } from './Wordmark'

type HeaderProps = {
  onContact: () => void
}

const navItems = [
  { label: 'Workshop', href: '#workshop' },
  { label: 'Speakers', href: '#speakers' },
  { label: 'Details', href: '#details' },
  { label: 'FAQ', href: '#faq' },
]

export function Header({ onContact }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <div className="announcement">
        <span>FIRST WORKSHOP</span>
        <span aria-hidden="true">•</span>
        <strong>SEPTEMBER 19, 2026</strong>
        <span aria-hidden="true">•</span>
        <span>LIMITED SLOTS</span>
      </div>
      <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
        <div className="shell nav-shell">
          <Wordmark />

          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
          </nav>

          <div className="desktop-actions">
            <button className="text-action" type="button" onClick={onContact}>Get in touch</button>
            <a
              className="button button--small button--dark"
              href="#register"
              onClick={() => track('header_register_click')}
            >
              Register
            </a>
          </div>

          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
          </button>
        </div>

        <nav
          id="mobile-navigation"
          className={`mobile-nav ${menuOpen ? 'mobile-nav--open' : ''}`}
          aria-label="Mobile navigation"
          aria-hidden={!menuOpen}
        >
          {navItems.map((item, index) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              <span>0{index + 1}</span>{item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              closeMenu()
              onContact()
            }}
          >
            <span>05</span>Get in touch
          </button>
          <a
            className="button button--lime"
            href="#register"
            onClick={() => {
              closeMenu()
              track('header_register_click')
            }}
          >
            Register
          </a>
        </nav>
      </header>
    </>
  )
}
