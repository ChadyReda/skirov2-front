import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag, Heart, ChevronDown, ChevronUp } from 'lucide-react'
import { productApi, cartApi, reviewApi } from '@/services'
import { Spinner } from '@/components/ui/Spinner'
import { Stars } from '@/components/ui/Stars'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { ProductCard } from '@/components/shop/ProductCard'
import { fmt, discountPct, fmtDate } from '@/utils'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { toast } from '@/components/ui/Toast'
import type { ProductVariant } from '@/types'
import { z } from 'zod'


export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [imgIdx, setImgIdx] = useState(0)
  const [selSize, setSelSize] = useState<string | null>(null)
  const [selColor, setSelColor] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [expanded, setExpanded] = useState<string[]>(['details'])

  const { isAuthenticated } = useAuthStore()
  const openCart = useCartStore((s) => s.open)
  const { items: wishlist, toggle: toggleWish } = useWishlistStore()
  const qc = useQueryClient()

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.bySlug(slug!),
    enabled: !!slug,
  })

  const { data: related } = useQuery({
    queryKey: ['related', product?.id],
    queryFn: () => productApi.related(product!.id),
    enabled: !!product,
  })

  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => reviewApi.list(product!.id),
    enabled: !!product,
  })

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    body: '',
  })
  const [showReviewForm, setShowReviewForm] = useState(false)

  const reviewSchema = z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().min(1, { message: 'Title is required' }).max(100),
    body: z.string().min(10, { message: 'Review must be at least 10 characters' }).max(1000),
  })

  const reviewM = useMutation({
    mutationFn: (data: z.infer<typeof reviewSchema>) =>
      reviewApi.create(product!.id, data),
    onSuccess: () => {
      toast('Review submitted! Thank you 🎉', 'success')
      setShowReviewForm(false)
      setReviewForm({ rating: 5, title: '', body: '' })
      refetchReviews()
    },
    onError: (e: any) => toast(e.response?.data?.message || 'Could not submit review', 'error'),
  })

  const handleSubmitReview = () => {
    const res = reviewSchema.safeParse(reviewForm)
    if (!res.success) {
      const err = res.error.issues[0]
      const field = err.path[0].toString().charAt(0).toUpperCase() + err.path[0].toString().slice(1)
      toast(`${field}: ${err.message}`, 'error')
      return
    }
    reviewM.mutate(res.data)
  }

  const addM = useMutation({
    mutationFn: ({ sku, qty }: { sku: string; qty: number }) =>
      cartApi.add(product!.id, sku, qty),
    onSuccess: (c) => {
      qc.setQueryData(['cart'], c)
      toast('Added to bag 🛍️', 'success')
      openCart()
    },
    onError: (e: Error) => toast(e.message, 'error'),
  })

  if (isLoading) return <Spinner full />
  if (error || !product)
    return (
      <div className="bg-black text-white page py-20 text-center">
        <p className="text-stone-400">Product not found.</p>
        <Link to="/shop" className="btn btn-outline-white btn-sm mt-4">
          Back to Shop
        </Link>
      </div>
    )

  const colors = [...new Set(
    product.variants.filter((v) => v.color).map((v) => v.color as string)
  )]
  const sizes = [...new Set(
    product.variants.filter((v) => v.size).map((v) => v.size as string)
  )]

  const getVariant = (): ProductVariant | null =>
    product.variants.find(
      (v) =>
        (!selSize || v.size === selSize) &&
        (!selColor || v.color === selColor)
    ) ?? null

  const variant = getVariant()
  const inStock = variant
    ? variant.stock > 0
    : product.variants.some((v) => v.stock > 0)
  const discount = discountPct(product)

  const inWish = wishlist.some((p) => p._id === product.id)

  const handleAdd = () => {
    if (!isAuthenticated) {
      toast('Please sign in to add to cart', 'info')
      return
    }
    const hasColors = colors.length > 0
    const hasSizes = sizes.length > 0

    if (hasColors && !selColor) {
      toast('Please select a color', 'info')
      return
    }
    if (hasSizes && !selSize) {
      toast('Please select a size', 'info')
      return
    }

    let sku = variant?.sku
    if (!sku) {
      if (product.variants.length === 1) {
        sku = product.variants[0].sku
      } else {
        toast('Please select your options', 'info')
        return
      }
    }
    addM.mutate({ sku, qty })
  }

  const toggle = (k: string) =>
    setExpanded((p) =>
      p.includes(k) ? p.filter((x) => x !== k) : [...p, k]
    )

  // Show image matching selected color if available
  const colorImage = selColor
    ? product.images.find((im) =>
      im.alt?.toLowerCase().includes(selColor.toLowerCase())
    )
    : null
  const img = colorImage || product.images[imgIdx]

  return (
    <div className="bg-black text-white">
      <div className="page py-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden bg-stone-900 rounded-lg">
              {img && (
                <img
                  src={img.url}
                  alt={img.alt || product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((im, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-20 h-24 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${i === imgIdx
                        ? 'border-white'
                        : 'border-stone-700 hover:border-stone-400'
                      }`}
                  >
                    <img
                      src={im.url}
                      alt={im.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:py-4">
            <p className="eyebrow text-stone-400 mb-2">
              {product.category.name}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {product.name}
            </h1>

            {product.reviewCount > 0 && (
              <div className="flex items-center gap-3 mb-5">
                <Stars
                  rating={product.averageRating}
                  count={product.reviewCount}
                />
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-semibold">{fmt(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-lg text-stone-500 line-through">
                  {fmt(product.compareAtPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  -{discount}%
                </span>
              )}
            </div>

            <p className="text-stone-300 text-sm leading-relaxed mb-6">
              {product.shortDescription}
            </p>

            {/* Color picker */}
            {colors.length > 0 && (
              <div className="mb-5">
                <p className="label text-stone-300 mb-2">
                  Color{selColor && ` — ${selColor}`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => {
                    const v = product.variants.find((vv) => vv.color === c)
                    const hasHex = v?.colorHex && v.colorHex.trim() !== ''
                    return (
                      <button
                        key={c}
                        onClick={() => setSelColor(c === selColor ? null : c)}
                        title={c}
                        className={`transition-all border-2 rounded-md ${c === selColor
                            ? 'border-white scale-110'
                            : 'border-stone-700 hover:border-stone-400'
                          } ${hasHex
                            ? 'w-8 h-8 rounded-full'
                            : 'px-3 py-1.5 text-xs bg-stone-800'
                          }`}
                        style={hasHex ? { background: v!.colorHex! } : {}}
                      >
                        {!hasHex && c}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size picker */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <p className="label text-stone-300 mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const v = product.variants.find(
                      (vv) =>
                        vv.size === s && (!selColor || vv.color === selColor)
                    )
                    const out = v ? v.stock === 0 : true
                    return (
                      <button
                        key={s}
                        onClick={() => !out && setSelSize(s === selSize ? null : s)}
                        disabled={out}
                        className={`px-4 py-2 text-sm border rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${s === selSize
                            ? 'bg-white text-black border-white'
                            : 'border-stone-700 bg-stone-800 text-white hover:border-stone-400'
                          }`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Qty + Add */}
            <div className="flex gap-3 mb-4">
              <div className="flex items-center border border-stone-700 rounded-md">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-3 text-stone-400 hover:text-white"
                >
                  −
                </button>
                <span className="px-4 text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3 py-3 text-stone-400 hover:text-white"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={!inStock || addM.isPending}
                className="btn btn-outline-white flex-1 gap-2"
              >
                <ShoppingBag size={16} />
                {addM.isPending
                  ? 'Adding…'
                  : !inStock
                    ? 'Out of Stock'
                    : 'Add to Bag'}
              </button>

            </div>

            {variant && variant.stock <= 5 && variant.stock > 0 && (
              <p className="text-sm text-red-500 font-medium mb-4">
                Only {variant.stock} left
              </p>
            )}

            {/* Accordion */}
            <div className="border-t border-stone-800">
              {[
                {
                  k: 'details',
                  label: 'Product Details',
                  content: product.description,
                },
                {
                  k: 'shipping',
                  label: 'Shipping & Returns',
                  content: 'Free Shipping & No Return',
                },
                {
                  k: 'care',
                  label: 'Care Instructions',
                  content:
                    'Please refer to the care label on your garment for best results.',
                },
              ].map(({ k, label, content }) => (
                <div key={k} className="border-b border-stone-800 py-3">
                  <button
                    onClick={() => toggle(k)}
                    className="flex items-center justify-between w-full text-sm font-medium py-1"
                  >
                    {label}
                    {expanded.includes(k) ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                  {expanded.includes(k) && (
                    <div className="text-sm text-stone-400 leading-relaxed mt-3 prose prose-sm prose-invert max-w-none">
                      <p>{content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Reviews */}
        <section className="mt-16 border-t border-stone-800 pt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Customer Reviews</h2>
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Stars
                    rating={product.averageRating}
                    size={16}
                  />
                  <span className="text-sm text-stone-400">
                    {product.averageRating.toFixed(1)} out of 5 (
                    {product.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>
            {isAuthenticated && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="btn btn-outline-white btn-sm"
              >
                Write a Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 mb-8">
              <h3 className="font-medium mb-5">Write Your Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="label text-stone-300">Rating *</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() =>
                          setReviewForm((p) => ({ ...p, rating: n }))
                        }
                        className="p-1"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill={n <= reviewForm.rating ? '#f59e0b' : 'none'}
                          stroke={n <= reviewForm.rating ? '#f59e0b' : '#57534e'}
                          strokeWidth="1.5"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label text-stone-300">Review Title *</label>
                  <input
                    value={reviewForm.title}
                    onChange={(e) =>
                      setReviewForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Summarize your experience"
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="label text-stone-300">Your Review *</label>
                  <textarea
                    value={reviewForm.body}
                    onChange={(e) =>
                      setReviewForm((p) => ({ ...p, body: e.target.value }))
                    }
                    placeholder="Tell others about your experience..."
                    rows={4}
                    className="input-dark resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="btn btn-outline-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewM.isPending}
                    className="btn btn-primary"
                  >
                    {reviewM.isPending ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!reviews?.length ? (
            <div className="text-center py-12 text-stone-500">
              <p className="text-sm">
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="border-b border-stone-800 pb-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Stars
                          rating={review.rating}
                          size={13}
                        />
                        {review.isVerifiedPurchase && (
                          <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-white text-sm">
                        {review.title}
                      </p>
                    </div>
                    <p className="text-xs text-stone-500 whitespace-nowrap">
                      {fmtDate(review.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-stone-300 leading-relaxed mb-2">
                    {review.body}
                  </p>
                  <p className="text-xs text-stone-500">
                    By {review.user.firstName}{' '}
                    {review.user.lastName.charAt(0)}.
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related */}
        {related?.length ? (
          <section className="mt-20">
            <h2 className="text-3xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p, i) => (
                <ProductCard key={p._id} product={p} delay={i * 80} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}