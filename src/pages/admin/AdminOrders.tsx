import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '@/services'
import { fmt, fmtDate, statusBadge, cap } from '@/utils'
import { Spinner } from '@/components/ui/Spinner'
import { Pager } from '@/components/ui/Pagination'
import { toast } from '@/components/ui/Toast'
import { errMsg } from '@/services/api'
import { Search, X, Phone } from 'lucide-react'

const STATUSES = [
  '',
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

export default function AdminOrders() {
  const [page,   setPage]   = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey:        ['admin-orders', page, status, search],
    queryFn:         () =>
      orderApi.adminList({
        page,
        limit:  15,
        ...(status && { status }),
        ...(search && { search }),
      }),
    placeholderData: (p) => p,
  })

  const statusM = useMutation({
    mutationFn: (d: { id: string; s: string }) =>
      orderApi.updateStatus(d.id, d.s),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      toast('Status updated', 'success')
      if (selectedOrder) {
        setSelectedOrder((prev: any) => ({ ...prev, status: selectedOrder.status }))
      }
    },
    onError: (e) => toast(errMsg(e), 'error'),
  })

  if (isLoading) return <Spinner full />

  return (
    <div className="p-4 md:p-8 bg-stone-900 text-white min-h-screen">

      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          {data && (
            <p className="text-stone-400 text-sm mt-1">
              {data.pagination.total} total
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 border border-stone-700 bg-transparent px-3 flex-1 min-w-[200px]">
          <Search size={15} className="text-stone-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Order # or email…"
            className="flex-1 py-2.5 text-sm outline-none bg-transparent text-white"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={13} className="text-stone-400" />
            </button>
          )}
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="input-dark py-2.5 text-sm w-full md:w-44 appearance-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s ? cap(s) : 'All Statuses'}
            </option>
          ))}
        </select>
      </div>

      {/* Table - Mobile list / Desktop table */}
      <div className="bg-transparent border border-stone-800 overflow-hidden rounded-lg">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-800 bg-stone-800/30">
              <tr>
                {['Order #', 'Date', 'Customer', 'Items', 'Total', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-4 text-xs font-medium uppercase tracking-widest text-stone-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {data?.data.map((o) => (
                <tr 
                  key={o.id} 
                  className="hover:bg-stone-800/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedOrder(o)}
                >
                  <td className="px-4 py-4 font-mono text-xs font-medium text-white">{o.orderNumber}</td>
                  <td className="px-4 py-4 text-stone-400 text-xs">{fmtDate(o.createdAt)}</td>
                  <td className="px-4 py-4 text-stone-200 font-medium text-xs">
                    {o.user && typeof o.user === 'object' ? `${o.user.firstName} ${o.user.lastName}` : o.guestEmail || 'Guest'}
                  </td>
                  <td className="px-4 py-4 text-stone-300 text-xs">{o.items.length} items</td>
                  <td className="px-4 py-4 font-semibold text-white">{fmt(o.total)}</td>
                  <td className="px-4 py-4">
                    <span className={statusBadge(o.status)}>{cap(o.status)}</span>
                  </td>
                  <td className="px-4 py-4">
                    <button 
                      className="text-xs text-brand-500 hover:text-brand-400 font-medium"
                      onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-stone-800">
          {data?.data.map((o) => (
            <div 
              key={o.id} 
              className="p-4 active:bg-stone-800 transition-colors cursor-pointer"
              onClick={() => setSelectedOrder(o)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-mono text-xs font-bold text-white mb-1">{o.orderNumber}</p>
                  <p className="text-[10px] text-stone-500">{fmtDate(o.createdAt)}</p>
                </div>
                <span className={statusBadge(o.status)}>{cap(o.status)}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-stone-300">
                    {o.user && typeof o.user === 'object' ? `${o.user.firstName} ${o.user.lastName}` : o.guestEmail || 'Guest'}
                  </p>
                  <p className="text-[10px] text-stone-500 mt-1">{o.items.length} items</p>
                </div>
                <p className="font-bold text-white">{fmt(o.total)}</p>
              </div>
            </div>
          ))}
        </div>

        {!data?.data.length && (
          <div className="p-10 text-center text-stone-400 text-sm">
            No orders found.
          </div>
        )}
      </div>

      {data?.pagination && <Pager p={data.pagination} onChange={setPage} />}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-stone-900 border border-stone-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-stone-900 border-b border-stone-800 p-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold">Order Details</h2>
                <p className="text-xs font-mono text-stone-400">{selectedOrder.orderNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-stone-800 rounded-full transition-colors text-stone-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8">
              {/* Status Update */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-stone-800/30 border border-stone-800 rounded-lg">
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-1">Current Status</p>
                  <span className={statusBadge(selectedOrder.status)}>{cap(selectedOrder.status)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => statusM.mutate({ id: selectedOrder.id, s: e.target.value })}
                    disabled={statusM.isPending}
                    className="input-dark text-sm py-2 px-3 focus:ring-1 focus:ring-brand-500"
                  >
                    {STATUSES.filter(Boolean).map((s) => (
                      <option key={s} value={s}>{cap(s)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-3">Customer info</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      {selectedOrder.user && typeof selectedOrder.user === 'object' 
                        ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}` 
                        : 'Guest Order'}
                    </p>
                    <p className="text-sm text-stone-400">{selectedOrder.guestEmail || selectedOrder.user?.email}</p>
                    {selectedOrder.shippingAddress?.phone && (
                      <a 
                        href={`tel:${selectedOrder.shippingAddress.phone}`}
                        className="flex items-center gap-2 text-sm text-brand-500 mt-2 font-medium"
                      >
                        <Phone size={14} />
                        {selectedOrder.shippingAddress.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-3">Shipping Address</p>
                  {selectedOrder.shippingAddress ? (
                    <div className="text-sm text-stone-300 space-y-0.5">
                      <p>{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                      <p>{selectedOrder.shippingAddress.street}</p>
                      {selectedOrder.shippingAddress.apartment && <p>{selectedOrder.shippingAddress.apartment}</p>}
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-stone-500 italic text-xs">No address provided</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-3">Order Items ({selectedOrder.items.length})</p>
                <div className="border border-stone-800 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-800/30 text-stone-400 border-b border-stone-800">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-xs">Item</th>
                        <th className="text-center px-4 py-3 font-medium text-xs text-center">Qty</th>
                        <th className="text-right px-4 py-3 font-medium text-xs">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {selectedOrder.items.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-white text-xs">{item.name}</p>
                            <p className="text-[10px] text-stone-500 mt-0.5">{item.variantLabel}</p>
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-stone-300">x{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-xs font-mono font-medium text-white">{fmt(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-stone-800/30">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-right text-stone-400 text-xs">Total Amount</td>
                        <td className="px-4 py-3 text-right font-bold text-white text-base">{fmt(selectedOrder.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 bg-stone-800/20 border-t border-stone-800 text-right">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="btn btn-outline h-9 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}