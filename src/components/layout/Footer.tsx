import { Link } from 'react-router-dom'
import { Instagram } from 'lucide-react'

const FOOTER_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Collection', href: '/shop' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
]

const SOCIAL_LINKS = [
  { Icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/skiro_store925/' },
]

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="page py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="text-xl font-bold tracking-wider uppercase"
            >
              SKIRO SHOP
            </Link>
            <p className="text-stone-400 text-sm mt-2 max-w-xs mx-auto md:mx-0">
              High-quality football jerseys for the true supporters.
            </p>
          </div>

          {/* Links */}
          <div className="md:justify-self-center">
            <h4 className="text-sm uppercase tracking-widest font-semibold mb-4">
              Menu
            </h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-stone-300 hover:text-white transition-colors text-sm"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="md:justify-self-end">
            <h4 className="text-sm uppercase tracking-widest font-semibold mb-4">
              Follow Us
            </h4>
            <div className="flex items-center justify-center md:justify-start gap-4">
              {SOCIAL_LINKS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-stone-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-8 pt-6 text-center">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} SKIRO Shop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}