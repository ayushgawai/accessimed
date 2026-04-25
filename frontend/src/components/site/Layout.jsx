import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

function Button({ children, href, variant = 'primary' }) {
  const base =
    'inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary'
  const styles =
    variant === 'primary'
      ? 'bg-primary text-bg shadow-glow hover:bg-[#5ce0d6]'
      : 'border border-secondary/30 bg-surface/70 text-textPrimary hover:border-secondary/50 hover:bg-surface'
  return (
    <a href={href} className={`${base} ${styles}`}>
      {children}
    </a>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary']),
}

export function AnnouncementBar() {
  return (
    <div className="border-b border-secondary/15 bg-surface/75 py-2">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 text-center text-xs text-secondary sm:text-sm">
        <span className="rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 font-semibold text-primary">
          Built for WCAG 2.1 AA
        </span>
        <p className="text-textSecondary">AI-powered WCAG compliance for healthcare websites.</p>
      </div>
    </div>
  )
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navLinks = ['Platform', 'Workflow', 'Dashboard', 'Compliance', 'FAQ', 'Contact']

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition ${scrolled ? 'border-b border-secondary/20 bg-bg/90 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <a href="#top" className="flex items-center gap-2 font-display text-lg font-bold text-textPrimary">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 text-primary">
            A
          </span>
          AccessiMed
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-textSecondary transition hover:text-textPrimary">
              {link}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button href="#dashboard" variant="secondary">View Demo</Button>
          <Button href="#final-cta">Start Scan</Button>
        </div>

        <button
          type="button"
          className="rounded-lg border border-secondary/30 px-3 py-2 text-sm text-textPrimary md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-secondary/20 bg-surface/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="rounded-lg px-3 py-2 text-sm text-textSecondary hover:bg-bg/60 hover:text-textPrimary">
                {link}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button href="#dashboard" variant="secondary">View Demo</Button>
              <Button href="#final-cta">Start Scan</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export function Section({ id, eyebrow, title, subtitle, children, className = '' }) {
  return (
    <section id={id} className={`mx-auto max-w-7xl px-4 py-20 sm:px-6 ${className}`}>
      {(eyebrow || title || subtitle) && (
        <header className="mb-10 max-w-3xl">
          {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-secondary">{eyebrow}</p>}
          {title && <h2 className="font-display text-3xl font-bold text-textPrimary sm:text-4xl">{title}</h2>}
          {subtitle && <p className="mt-3 text-textSecondary">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  )
}

Section.propTypes = {
  id: PropTypes.string.isRequired,
  eyebrow: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

export function Footer() {
  const cols = {
    Product: ['Platform', 'Dashboard', 'AI Fixes', 'Reports', 'GitHub PRs'],
    Resources: ['Workflow', 'FAQ', 'Accessibility Statement', 'Documentation', 'Contact'],
    Company: ['About', 'Privacy', 'Terms', 'Compliance', 'Support'],
  }
  return (
    <footer id="contact" className="border-t border-secondary/15 bg-surface/45">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-bold text-textPrimary">AccessiMed</p>
          <p className="mt-3 text-sm text-textSecondary">
            AI-powered accessibility compliance platform for healthcare teams that need precise, fast WCAG remediation.
          </p>
        </div>
        {Object.entries(cols).map(([title, items]) => (
          <div key={title}>
            <p className="text-sm font-semibold text-textPrimary">{title}</p>
            <ul className="mt-3 space-y-2 text-sm text-textSecondary">
              {items.map((item) => (
                <li key={item}><a href="#" className="hover:text-textPrimary">{item}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-secondary/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-textSecondary sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AccessiMed. All rights reserved.</p>
          <p>Built with accessibility in mind.</p>
        </div>
      </div>
    </footer>
  )
}

export { Button }
