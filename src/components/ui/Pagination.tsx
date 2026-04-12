import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Pagination } from '@/types'

interface Props {
  p: Pagination
  onChange: (page: number) => void
}

export function Pager({ p, onChange }: Props) {
  if (p.totalPages <= 1) return null

  const pages = Array.from({ length: p.totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12">
      <button
        onClick={() => onChange(p.page - 1)}
        disabled={!p.hasPrev}
        className="flex items-center gap-1 px-3 py-2 border border-stone-200 text-sm text-stone-500 hover:text-stone-900 disabled:opacity-40 transition-colors"
      >
        <ChevronLeft size={14} /> Prev
      </button>

      {pages.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-9 h-9 text-sm border transition-colors ${
            n === p.page
              ? 'bg-stone-900 text-white border-stone-900'
              : 'border-stone-200 text-stone-600 hover:border-stone-400'
          }`}
        >
          {n}
        </button>
      ))}

      <button
        onClick={() => onChange(p.page + 1)}
        disabled={!p.hasNext}
        className="flex items-center gap-1 px-3 py-2 border border-stone-200 text-sm text-stone-500 hover:text-stone-900 disabled:opacity-40 transition-colors"
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  )
}