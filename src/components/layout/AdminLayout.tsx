import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, ShoppingCart,
  Users, ArrowLeft, LogOut, Menu, X,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/services'
import { toast } from '@/components/ui/Toast'
import { ToastContainer } from '@/components/ui/Toast'

const NAV = [
  { to: '/admin',            label: 'Dashboard',  Icon: LayoutDashboard, end: true },
  { to: '/admin/products',   label: 'Products',   Icon: Package },
  { to: '/admin/categories', label: 'Categories', Icon: Tag },
  { to: '/admin/orders',     label: 'Orders',     Icon: ShoppingCart },
  { to: '/admin/users',      label: 'Users',      Icon: Users },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await authApi.logout()
    logout()
    navigate('/')
    toast('Signed out', 'success')
  }

  const Sidebar = () => (
    <aside className="w-60 bg-stone-950 flex flex-col h-full">
      <div className="px-5 py-5 border-b border-stone-900 flex items-center justify-between">
        <div>
          <Link
            to="/"
            className="text-xl text-white tracking-widest uppercase font-semibold"
          >
            SKIRO
          </Link>
          <p className="text-[10px] uppercase tracking-widest text-stone-500 mt-0.5">
            Admin Console
          </p>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-stone-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm rounded-md font-medium transition-colors ${
                isActive
                  ? 'bg-white text-black'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 border-t border-stone-900 pt-4 space-y-1">
        <div className="px-3 py-2 mb-2">
          <p className="text-[10px] text-stone-600 uppercase tracking-widest">
            Signed in as
          </p>
          <p className="text-sm text-stone-200 font-medium">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-stone-500 truncate">{user?.email}</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-md text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
        >
          <ArrowLeft size={14} /> View Store
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-md text-stone-400 hover:text-red-400 w-full text-left hover:bg-stone-800/60 transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-black">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:z-30">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-60 lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between bg-stone-950 px-4 py-3 border-b border-stone-900">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-stone-400 hover:text-white"
          >
            <Menu size={22} />
          </button>
          <Link
            to="/"
            className="text-lg text-white tracking-widest uppercase font-semibold"
          >
            SKIRO
          </Link>
          <div className="w-6" />
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}