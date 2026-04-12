import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { fmt, primaryImage, discountPct } from '@/utils'

interface Props {
  product: Product
  delay?: number
}

export function ProductCard({ product, delay = 0 }: Props) {
  const img = primaryImage(product)
  const disc = discountPct(product)
  const stock = product.variants?.reduce((s, v) => s + v.stock, 0) ?? 0
  const outOfStock = stock === 0

  return (
    <article
      className="group animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Link to={`/products/${product.slug}`}>
        <div className="relative overflow-hidden bg-stone-900 aspect-[3/4] rounded-lg">
          {/* Image */}
          {img ? (
            <img
              src={img.url}
              alt={img.alt || product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-800">
              <span className="text-stone-500 text-xs">No Image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3">
            {disc > 0 && (
              <span className="bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                Promotion
              </span>
            )}
            {outOfStock && (
              <span className="bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                Épuisé
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="pt-3 bg-black">
        <h3 className="text-sm font-medium text-white hover:text-white/80 transition-colors mb-1.5 line-clamp-2 leading-snug">
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">
            {fmt(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-stone-400 line-through">
              {fmt(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}