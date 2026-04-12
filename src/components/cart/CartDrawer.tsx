import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { cartApi } from '@/services'
import { fmt, primaryImage, variantLabel } from '@/utils'
import { Spinner } from '@/components/ui/Spinner'
import { toast } from '@/components/ui/Toast'

const FREE_AT = 100

export default function CartDrawer() {
  const isOpen  = useCartStore((s) => s.isOpen)
  const close   = useCartStore((s) => s.close)
  const setCart = useCartStore((s) => s.setCart)

  console.log('CartDrawer isOpen:', isOpen)

  const { isAuthenticated } = useAuthStore()
  const qc = useQueryClient()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn:  cartApi.get,
    enabled:  isAuthenticated,
  })

  useEffect(() => {
    if (cart) setCart(cart)
  }, [cart, setCart])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const updateM = useMutation({
    mutationFn: ({ sku, qty }: { sku: string; qty: number }) =>
      cartApi.update(sku, qty),
    onSuccess: (c) => qc.setQueryData(['cart'], c),
    onError:   () => toast('Could not update', 'error'),
  })

  const removeM = useMutation({
    mutationFn: (sku: string) => cartApi.remove(sku),
    onSuccess:  (c) => {
      qc.setQueryData(['cart'], c)
      toast('Item removed', 'info')
    },
  })

  const subtotal = cart?.items.reduce(
    (s, i) => s + i.product.price * i.quantity, 0
  ) ?? 0

  const toFree = Math.max(0, FREE_AT - subtotal)

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
          onClick={close}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white flex flex-col shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <h2
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            className="text-xl font-medium"
          >
            Your Bag
            {!!cart?.items.length && (
              <span className="text-sm text-stone-400 font-normal ml-2">
                ({cart.items.length})
              </span>
            )}
          </h2>
          <button onClick={close} className="p-2 text-stone-400 hover:text-stone-900">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
              <ShoppingBag size={44} className="text-stone-200 mb-5" strokeWidth={1} />
              <h3
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
                className="text-xl mb-2"
              >
                Sign in to view your bag
              </h3>
              <p className="text-sm text-stone-500 mb-6">
                Your cart is saved to your account
              </p>
              <Link to="/login" onClick={close} className="btn btn-primary w-full">
                Sign In
              </Link>
              <Link to="/register" onClick={close} className="btn btn-ghost btn-sm mt-2 w-full">
                Create Account
              </Link>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : !cart?.items.length ? (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
              <ShoppingBag size={44} className="text-stone-200 mb-5" strokeWidth={1} />
              <h3
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
                className="text-xl mb-2"
              >
                Your bag is empty
              </h3>
              <p className="text-sm text-stone-500 mb-6">
                Add something beautiful to get started
              </p>
              <Link to="/shop" onClick={close} className="btn btn-primary w-full">
                Browse Collection
              </Link>
            </div>
          ) : (
            <>
              {toFree > 0 ? (
                <div className="px-6 py-3 bg-stone-50 border-b border-stone-100">
                  <p className="text-xs text-stone-600 mb-1">
                    Add <strong>{fmt(toFree)}</strong> for free shipping
                  </p>
                  <div className="h-1 bg-stone-200">
                    <div
                      className="h-full bg-brand-500 transition-all"
                      style={{ width: `${Math.min(100, (subtotal / FREE_AT) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100">
                  <p className="text-xs text-emerald-700 font-medium">
                    🎉 You have free shipping!
                  </p>
                </div>
              )}

              <ul className="divide-y divide-stone-100">
                {cart.items.map((item) => {
                  const img     = primaryImage(item.product)
                  const variant = item.product.variants.find(
                    (v) => v.sku === item.variantSku
                  )
                  const label = variant ? variantLabel(variant) : ''

                  return (
                    <li key={item.variantSku} className="flex gap-4 px-6 py-5">
                      <Link
                        to={`/products/${item.product.slug}`}
                        onClick={close}
                        className="flex-shrink-0"
                      >
                        <div className="w-20 h-24 bg-stone-100 overflow-hidden">
                          {img && (
                            <img
                              src={img.url}
                              alt={img.alt}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.product.slug}`}
                          onClick={close}
                          className="text-sm font-medium text-stone-900 hover:text-stone-500 transition-colors line-clamp-2 leading-snug block"
                        >
                          {item.product.name}
                        </Link>
                        {label && (
                          <p className="text-xs text-stone-400 mt-0.5">{label}</p>
                        )}
                        <p className="text-sm font-semibold mt-1">
                          {fmt(item.product.price * item.quantity)}
                        </p>

                        <div className="flex items-center gap-3 mt-2.5">
                          <div className="flex items-center border border-stone-200">
                            <button
                              onClick={() =>
                                item.quantity > 1
                                  ? updateM.mutate({ sku: item.variantSku, qty: item.quantity - 1 })
                                  : removeM.mutate(item.variantSku)
                              }
                              disabled={updateM.isPending}
                              className="px-2.5 py-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-40"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="px-3 py-1.5 text-sm font-medium min-w-[32px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateM.mutate({ sku: item.variantSku, qty: item.quantity + 1 })
                              }
                              disabled={
                                updateM.isPending ||
                                (variant?.stock ?? 0) <= item.quantity
                              }
                              className="px-2.5 py-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-40"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeM.mutate(item.variantSku)}
                            className="p-1 text-stone-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>

        {isAuthenticated && !!cart?.items.length && (
          <div className="border-t border-stone-100 px-6 py-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Subtotal</span>
              <span className="font-semibold">{fmt(subtotal)}</span>
            </div>
            <p className="text-xs text-stone-400">
              Shipping and taxes at checkout
            </p>
            <div className="space-y-2">
              <Link
                to="/checkout"
                onClick={close}
                className="btn btn-primary w-full gap-2"
              >
                Checkout <ArrowRight size={15} />
              </Link>
              <Link
                to="/cart"
                onClick={close}
                className="btn btn-outline w-full"
              >
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}