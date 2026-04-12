import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminApi } from '@/services'
import { fmt, fmtDateShort, statusBadge, cap } from '@/utils'
import { Spinner } from '@/components/ui/Spinner'
import { Users, Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn:  adminApi.stats,
  })

  if (isLoading) return <Spinner full />
  if (!data)     return null

  const { overview, recentOrders, topProducts, ordersByStatus, lowStockProducts } = data

  const CARDS = [
    {
      label: 'Total Revenue',
      value: fmt(overview.totalRevenue),
      sub:   `${fmt(overview.monthlyRevenue)} this month`,
      Icon:  TrendingUp,
      color: 'text-emerald-500',
    },
    {
      label: 'Total Orders',
      value: overview.totalOrders,
      sub:   `${overview.weeklyOrders} this week`,
      Icon:  ShoppingCart,
      color: 'text-blue-500',
    },
    {
      label: 'Products',
      value: overview.totalProducts,
      sub:   'Active listings',
      Icon:  Package,
      color: 'text-purple-500',
    },
    {
      label: 'Customers',
      value: overview.totalUsers,
      sub:   'Registered accounts',
      Icon:  Users,
      color: 'text-brand-500',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-stone-400 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {CARDS.map(({ label, value, sub, Icon, color }) => (
          <div
            key={label}
            className="bg-stone-900 border border-stone-800 p-5 rounded-lg"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-stone-400 font-medium">
                {label}
              </p>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-stone-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 p-5 rounded-lg">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white text-sm uppercase tracking-widest">
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs text-stone-400 hover:text-white"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-4 py-2 border-b border-stone-800 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {o.orderNumber}
                  </p>
                  <p className="text-xs text-stone-400">
                    {fmtDateShort(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={statusBadge(o.status)}>
                    {cap(o.status)}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {fmt(o.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Orders by status */}
          <div className="bg-stone-900 border border-stone-800 p-5 rounded-lg">
            <h2 className="font-semibold text-white text-sm uppercase tracking-widest mb-4">
              Orders by Status
            </h2>
            <div className="space-y-2">
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={statusBadge(status)}>{cap(status)}</span>
                  <span className="text-sm font-semibold text-stone-300">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Low stock */}
          {lowStockProducts.length > 0 && (
            <div className="bg-red-900/30 border border-red-800/50 p-5 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-red-400" />
                <h2 className="font-semibold text-red-300 text-sm uppercase tracking-widest">
                  Low Stock
                </h2>
              </div>
              <div className="space-y-2">
                {lowStockProducts.slice(0, 5).map((p) => (
                  <div
                    key={p._id}
                    className="flex justify-between items-center"
                  >
                    <p className="text-xs text-red-300 truncate max-w-[160px]">
                      {p.name}
                    </p>
                    <span className="text-xs font-bold text-red-200">
                      {p.variants.reduce((s, v) => s + v.stock, 0)} left
                    </span>
                  </div>
                ))}
              </div>
              <Link
                to="/admin/products"
                className="text-xs text-red-300 hover:text-red-100 font-medium mt-3 block"
              >
                Manage inventory →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-stone-900 border border-stone-800 p-5 mt-6 rounded-lg">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-white text-sm uppercase tracking-widest">
            Top Products
          </h2>
          <Link
            to="/admin/products"
            className="text-xs text-stone-400 hover:text-white"
          >
            Manage →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800">
                {['Product', 'Price', 'Sold', 'Rating'].map((h) => (
                  <th
                    key={h}
                    className="text-left pb-2 text-xs text-stone-400 font-medium uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {topProducts.map((p) => (
                <tr key={p._id}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-stone-800 rounded-md flex-shrink-0 overflow-hidden">
                        {p.images[0] && (
                          <img
                            src={p.images[0].url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <span className="font-medium text-white text-sm line-clamp-1">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-stone-400">{fmt(p.price)}</td>
                  <td className="py-3 pr-4 text-stone-400">{p.totalSold}</td>
                  <td className="py-3 text-stone-400">
                    ⭐ {p.averageRating.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}