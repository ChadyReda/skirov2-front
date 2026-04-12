import { Star } from 'lucide-react'

interface Props {
  rating: number
  count?: number
  size?: number
}

export function Stars({ rating, count, size = 14 }: Props) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={
            n <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-stone-200 text-stone-200'
          }
        />
      ))}
      {count !== undefined && (
        <span className="text-xs text-stone-400 ml-0.5">({count})</span>
      )}
    </div>
  )
}