import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface Crumb {
  label: string
  href?: string
}

interface Props {
  crumbs: Crumb[]
}

export function Breadcrumb({ crumbs }: Props) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-stone-400 mb-6">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={11} />}
          {c.href ? (
            <Link
              to={c.href}
              className="hover:text-stone-700 transition-colors"
            >
              {c.label}
            </Link>
          ) : (
            <span className="text-stone-700">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}