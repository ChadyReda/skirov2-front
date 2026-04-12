import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { orderApi } from '@/services'
import { fmt, fmtDate, statusBadge, cap } from '@/utils'
import { Spinner } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'
import { Pager } from '@/components/ui/Pagination'
import { Package, CheckCircle } from 'lucide-react'

// ── ORDERS LIST ───────────────────────────────────
export function OrdersPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn:  () => orderApi.mine(page),
  })

  if (isLoading) return <Spinner full />

  return (
    <div className="page py-12">
      <h1
        style={{ fontFamily: 'Cormorant Garamond, serif' }}
        className="text-3xl font-normal mb-8"
      >
        My Orders
      </h1>

      {!data?.data.length ? (
        <Empty
          icon={<Package size={44} />}
          title="No orders yet"
          desc="Your order history will appear here."
          action={
            <Link to="/shop" className="btn btn-primary">
              Start Shopping
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {data.data.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block bg-white border border-stone-100 p-5 hover:border-stone-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-stone-900 text-base">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      {fmtDate(order.createdAt)}
                    </p>
                    <p className="text-sm text-stone-500 mt-0.5">
                      {order.items.length}{' '}
                      {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold text-lg">{fmt(order.total)}</p>
                    <span className={`${statusBadge(order.status)} inline-block`}>
                      {cap(order.status)}
                    </span>
                  </div>
                </div>

                {/* Item thumbnails */}
                <div className="flex gap-2 mt-3">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div
                      key={i}
                      className="w-12 h-14 bg-stone-100 flex-shrink-0 overflow-hidden"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-12 h-14 bg-stone-100 flex items-center justify-center text-xs text-stone-400">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {data.pagination && (
            <Pager p={data.pagination} onChange={setPage} />
          )}
        </>
      )}
    </div>
  )
}

// ── ORDER DETAIL ──────────────────────────────────
export function OrderDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const [sp]      = useSearchParams()
  const isSuccess = sp.get('success') === '1'

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => orderApi.byId(id!),
    enabled:  !!id,
    retry:    1,
  })

  if (isLoading) return <Spinner full />

  if (error || !order) return (
    <div className="page py-20 text-center">
      <Package size={44} className="text-stone-200 mx-auto mb-4" strokeWidth={1} />
      <h2
        style={{ fontFamily: 'Cormorant Garamond, serif' }}
        className="text-2xl mb-3"
      >
        Order not found
      </h2>
      <p className="text-stone-400 text-sm mb-6">
        This order may not exist or you don't have access to it.
      </p>
      <div className="flex gap-3 justify-center">
        <Link to="/orders" className="btn btn-outline btn-sm">
          My Orders
        </Link>
        <Link to="/shop" className="btn btn-primary btn-sm">
          Continue Shopping
        </Link>
      </div>
    </div>
  )

  return (
    <div className="page py-12 max-w-3xl">

      {/* Success banner */}
      {isSuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-5 mb-8">
          <CheckCircle size={24} className="text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800">Order placed successfully!</p>
            <p className="text-sm text-emerald-700">
              Our team will contact you soon to confirm your order.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            className="text-3xl font-normal"
          >
            {order.orderNumber}
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            {fmtDate(order.createdAt)}
          </p>
        </div>
        <span className={`${statusBadge(order.status)} text-sm px-3 py-1`}>
          {cap(order.status)}
        </span>
      </div>

      {/* Info cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">

        {/* Shipping address */}
        <div className="bg-white border border-stone-100 p-5">
          <h3 className="font-medium text-stone-900 mb-3 text-sm uppercase tracking-widest">
            Shipping Address
          </h3>
          {order.shippingAddress ? (
            <address className="not-italic text-sm text-stone-600 leading-relaxed">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              <br />
              {order.shippingAddress.street}
              {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.zip}
              <br />
              {order.shippingAddress.country}
            </address>
          ) : (
            <p className="text-sm text-stone-400">No address on file</p>
          )}
        </div>

        {/* Payment summary */}
        <div className="bg-white border border-stone-100 p-5">
          <h3 className="font-medium text-stone-900 mb-3 text-sm uppercase tracking-widest">
            Order Summary
          </h3>
          <div className="space-y-1.5 text-sm">
            {[
              ['Subtotal', fmt(order.subtotal)],
              ['Shipping', Number(order.shippingCost) === 0 ? 'Free' : fmt(order.shippingCost)],
              ['Tax',      fmt(order.tax)],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-stone-500">{l}</span>
                <span>{v}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold border-t border-stone-100 pt-2 mt-1">
              <span>Total</span>
              <span>{fmt(order.total)}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100">
            <p className="text-xs text-stone-400">
              Payment method:{' '}
              <span className="text-stone-600 font-medium">
                Cash on Delivery
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border border-stone-100 p-5">
        <h3 className="font-medium text-stone-900 mb-4 text-sm uppercase tracking-widest">
          Order Items
        </h3>
        <ul className="divide-y divide-stone-100">
          {order.items.map((item, i) => (
            <li key={i} className="flex gap-4 py-4">
              <div className="w-16 h-20 bg-stone-100 flex-shrink-0 overflow-hidden">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-900 leading-snug">
                  {item.name}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">{item.variantLabel}</p>
                <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold whitespace-nowrap">
                {fmt(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        <Link to="/orders" className="btn btn-outline btn-sm">
          ← All Orders
        </Link>
        <Link to="/shop" className="btn btn-primary btn-sm">
          Continue Shopping
        </Link>
      </div>

    </div>
  )
}