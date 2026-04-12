import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlist'
import { ProductCard } from '@/components/shop/ProductCard'
import { Empty } from '@/components/ui/Empty'

export default function WishlistPage() {
  const { items, clear } = useWishlistStore()

  return (
    <div className="page py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            className="text-3xl font-normal"
          >
            My Wishlist
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clear}
            className="text-xs text-stone-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <Empty
          icon={<Heart size={44} strokeWidth={1} />}
          title="Your wishlist is empty"
          desc="Save items you love by clicking the heart icon on any product."
          action={
            <Link to="/shop" className="btn btn-primary">
              Browse Collection
            </Link>
          }
        />
      ) : (
        <div className="product-grid">
          {items.map((p, i) => (
            <ProductCard key={p.id || p._id} product={p} delay={i * 60} />
          ))}
        </div>
      )}
    </div>
  )
}