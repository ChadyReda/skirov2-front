import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cartApi, orderApi } from '@/services'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { fmt, primaryImage } from '@/utils'
import { Spinner } from '@/components/ui/Spinner'
import { toast } from '@/components/ui/Toast'
import { errMsg } from '@/services/api'
import { ShoppingBag } from 'lucide-react'

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName:  z.string().min(1, 'Required'),
  phone:     z.string().optional(),
  street:    z.string().min(1, 'Required'),
  apartment: z.string().optional(),
  city:      z.string().min(1, 'Required'),
  state:     z.string().min(1, 'Required'),
  zip:       z.string().min(1, 'Required'),
  country:   z.string().min(2, 'Required'),
})
type F = z.infer<typeof schema>

const SHIPPING_COST = 0
const FREE_AT       = 100
const TAX_RATE      = 0

export default function CheckoutPage() {
  const { isAuthenticated, user } = useAuthStore()
  const setCart                   = useCartStore((s) => s.setCart)
  const navigate                  = useNavigate()
  const [step, setStep]           = useState<'address' | 'confirm'>('address')

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn:  cartApi.get,
    enabled:  isAuthenticated,
  })

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: {
      country:   'MA',
      firstName: user?.firstName,
      lastName:  user?.lastName,
    },
  })

  const orderM = useMutation({
    mutationFn: (addr: F) =>
      orderApi.create({
        items: cart!.items.map((i) => ({
          productId:  i.product.id,
          variantSku: i.variantSku,
          quantity:   i.quantity,
        })),
        shippingAddress: addr,
      }),
    onSuccess: () => {
      setCart(null)
      navigate('/?orderSuccess=1')
    },
    onError: (e) => toast(errMsg(e), 'error'),
  })

  if (!isAuthenticated) return (
    <div className="page py-20 text-center">
      <ShoppingBag size={40} className="text-stone-200 mx-auto mb-4" strokeWidth={1} />
      <h2
        style={{ fontFamily: 'Cormorant Garamond, serif' }}
        className="text-2xl mb-3"
      >
        Sign in to checkout
      </h2>
      <Link
        to="/login"
        state={{ from: { pathname: '/checkout' } }}
        className="btn btn-primary"
      >
        Sign In
      </Link>
    </div>
  )

  if (isLoading) return <Spinner full />

  if (!cart?.items.length) return (
    <div className="page py-20 text-center">
      <ShoppingBag size={40} className="text-stone-200 mx-auto mb-4" strokeWidth={1} />
      <h2
        style={{ fontFamily: 'Cormorant Garamond, serif' }}
        className="text-2xl mb-3"
      >
        Your bag is empty
      </h2>
      <Link to="/shop" className="btn btn-primary">
        Continue Shopping
      </Link>
    </div>
  )

  const subtotal = cart.items.reduce(
    (s, i) => s + i.product.price * i.quantity, 0
  )
  const shipping = subtotal >= FREE_AT ? 0 : SHIPPING_COST
  const tax      = +(subtotal * TAX_RATE).toFixed(2)
  const total    = +(subtotal + shipping + tax).toFixed(2)

  return (
    <div className="page py-10">

      {/* Logo + title */}
      <div className="mb-8">
        <Link
          to="/"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
          className="text-2xl tracking-[.12em] uppercase text-stone-900"
        >
          SKIRO
        </Link>
        <h1
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
          className="text-3xl font-normal mt-4"
        >
          Checkout
        </h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4 mb-8">
        {[
          { k: 'address', l: 'Shipping' },
          { k: 'confirm', l: 'Confirm' },
        ].map(({ k, l }, i) => (
          <div key={k} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-stone-200" />}
            <div
              className={`flex items-center gap-2 text-sm font-medium ${
                step === k || (k === 'address' && step === 'confirm')
                  ? 'text-stone-900'
                  : 'text-stone-400'
              }`}
            >
              <span
                className={`w-6 h-6 flex items-center justify-center text-xs border ${
                  step === k
                    ? 'bg-stone-900 text-white border-stone-900'
                    : k === 'address' && step === 'confirm'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-stone-300'
                }`}
              >
                {k === 'address' && step === 'confirm' ? '✓' : i + 1}
              </span>
              {l}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr,400px] gap-12">

        {/* Left — form */}
        <div>
          {step === 'address' ? (

            /* ── STEP 1: Address ── */
            <form
              onSubmit={handleSubmit(() => setStep('confirm'))}
              className="space-y-5"
            >
              <h2 className="font-medium text-stone-900 mb-4">
                Delivery Address
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input
                    {...register('firstName')}
                    className={`input ${errors.firstName ? 'input-err' : ''}`}
                  />
                  {errors.firstName && <p className="ferror">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input
                    {...register('lastName')}
                    className={`input ${errors.lastName ? 'input-err' : ''}`}
                  />
                  {errors.lastName && <p className="ferror">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">Phone Number</label>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="e.g. 0612345678"
                  className="input"
                />
                <p className="text-xs text-stone-400 mt-1">
                  We will use this to confirm your order
                </p>
              </div>

              <div>
                <label className="label">Street Address *</label>
                <input
                  {...register('street')}
                  placeholder="e.g. 12 Rue Mohammed V"
                  className={`input ${errors.street ? 'input-err' : ''}`}
                />
                {errors.street && <p className="ferror">{errors.street.message}</p>}
              </div>

              <div>
                <label className="label">Apartment / Suite</label>
                <input
                  {...register('apartment')}
                  placeholder="Optional"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City *</label>
                  <input
                    {...register('city')}
                    placeholder="e.g. Casablanca"
                    className={`input ${errors.city ? 'input-err' : ''}`}
                  />
                  {errors.city && <p className="ferror">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="label">Region *</label>
                  <input
                    {...register('state')}
                    placeholder="e.g. Grand Casablanca"
                    className={`input ${errors.state ? 'input-err' : ''}`}
                  />
                  {errors.state && <p className="ferror">{errors.state.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">ZIP / Postal Code *</label>
                  <input
                    {...register('zip')}
                    placeholder="e.g. 20000"
                    className={`input ${errors.zip ? 'input-err' : ''}`}
                  />
                  {errors.zip && <p className="ferror">{errors.zip.message}</p>}
                </div>
                <div>
                  <label className="label">Country *</label>
                  <select
                    {...register('country')}
                    className="input appearance-none"
                  >
                    <option value="MA">Morocco</option>
                    <option value="DZ">Algeria</option>
                    <option value="TN">Tunisia</option>
                    <option value="EG">Egypt</option>
                    <option value="AE">UAE</option>
                    <option value="SA">Saudi Arabia</option>
                    <option value="FR">France</option>
                    <option value="ES">Spain</option>
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-2">
                Continue to Confirm →
              </button>
            </form>

          ) : (

            /* ── STEP 2: Confirm ── */
            <div className="space-y-5">
              <h2 className="font-medium text-stone-900 mb-4">
                Confirm Your Order
              </h2>

              {/* Info box */}
              <div className="p-5 bg-stone-50 border border-stone-200 space-y-2">
                <p className="text-sm font-semibold text-stone-800">
                  Cash on Delivery
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">
                  No payment required now. Our team will contact you to confirm your order and arrange delivery.
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800 font-medium">
                  We will call you to confirm before shipping.
                </p>
              </div>

              {/* Address summary */}
              <div className="border border-stone-100 p-5 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
                  Delivery Address
                </p>
                <p className="text-sm font-medium text-stone-900">
                  {getValues('firstName')} {getValues('lastName')}
                </p>
                {getValues('phone') && (
                  <p className="text-sm text-stone-500">
                    {getValues('phone')}
                  </p>
                )}
                <p className="text-sm text-stone-500">
                  {getValues('street')}
                  {getValues('apartment') ? `, ${getValues('apartment')}` : ''}
                </p>
                <p className="text-sm text-stone-500">
                  {getValues('city')}, {getValues('state')} {getValues('zip')}
                </p>
                <p className="text-sm text-stone-500">
                  {getValues('country')}
                </p>
                <button
                  onClick={() => setStep('address')}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium mt-2 block"
                >
                  Edit address
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('address')}
                  className="btn btn-outline"
                >
                  ← Back
                </button>
                <button
                  onClick={() => orderM.mutate(getValues())}
                  disabled={orderM.isPending}
                  className="btn btn-primary flex-1"
                >
                  {orderM.isPending ? 'Placing order…' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — Order summary */}
        <div>
          <div className="bg-white border border-stone-100 p-6 sticky top-28">
            <h3 className="font-medium text-stone-900 mb-5">Order Summary</h3>

            <ul className="divide-y divide-stone-100 mb-5">
              {cart.items.map((item) => {
                const img = primaryImage(item.product)
                return (
                  <li key={item.variantSku} className="flex gap-3 py-3">
                    <div className="relative w-16 h-20 flex-shrink-0 bg-stone-100">
                      {img && (
                        <img
                          src={img.url}
                          alt={img.alt}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-stone-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 line-clamp-2 leading-snug">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {item.variantSku}
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {fmt(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="space-y-2 text-sm border-t border-stone-100 pt-4">
              {[
                ['Subtotal',  fmt(subtotal)],
                ['Shipping',  shipping === 0 ? 'Free' : fmt(shipping)],
                ['Tax (0%)',  fmt(tax)],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-stone-500">{l}</span>
                  <span>{v}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-base border-t border-stone-100 pt-3 mt-1">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-xs text-stone-400">
              🔒 Secure checkout
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}