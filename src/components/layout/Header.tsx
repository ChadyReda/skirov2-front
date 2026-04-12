import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { authApi } from '@/services'
import { toast } from '@/components/ui/Toast'

const NAV = [
  { label: 'Accueil', href: '/' },
  { label: 'collection', href: '/shop' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore()
  const itemCount = useCartStore((s) => s.itemCount())

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  const handleLogout = async () => {
    await authApi.logout()
    logout()
    navigate('/')
    toast('Signed out', 'success')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`)
      setSearchOpen(false)
      setQ('')
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 bg-black border-b border-white/20`}
    >
      <div className="page">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}
            className="text-2xl md:text-3xl tracking-[.12em] uppercase text-white"
          >
            SKIRO
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-sm text-white hover:opacity-80 font-medium transition-opacity"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 text-white hover:opacity-80 transition-opacity"
            >
              <Search size={19} />
            </button>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="p-2.5 text-white hover:opacity-80 transition-opacity">
                  <User size={19} />
                </button>
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-stone-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 py-2">
                  <div className="px-4 py-3 border-b border-stone-100">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">Hello,</p>
                    <p className="text-sm font-semibold text-stone-900">{user?.firstName}</p>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2.5 text-sm text-brand-600 font-medium hover:bg-stone-50">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/profile" className="block px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50">
                    My Profile
                  </Link>
                  <Link to="/orders" className="block px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50">
                    My Orders
                  </Link>
                  <div className="border-t border-stone-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2.5 text-white hover:opacity-80 transition-opacity"
              >
                <User size={19} />
              </Link>
            )}
            <button
                onClick={() => useCartStore.getState().open()}
                className="relative p-2.5 text-white hover:opacity-80 transition-opacity"
            >
              <ShoppingBag size={19} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 -ml-2 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-white/20 py-4 animate-fade-in">
            <form onSubmit={handleSearch} className="flex items-center gap-3 max-w-2xl">
              <Search size={16} className="text-white/50" />
              <input
                autoFocus
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="flex-1 text-sm outline-none bg-transparent text-white placeholder:text-white/50"
              />
              {q && (
                <button type="button" onClick={() => setQ('')}>
                  <X size={14} className="text-white/50" />
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/20 bg-black/90 backdrop-blur-sm max-h-[80vh] overflow-y-auto">
          <div className="page py-5 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="block py-1.5 text-sm font-medium text-white"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-white/20 mt-4 pt-4">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="block py-1.5 text-sm text-brand-400 font-medium" onClick={() => setMobileOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/profile" className="block py-1.5 text-sm text-white" onClick={() => setMobileOpen(false)}>My Profile</Link>
                  <Link to="/orders"  className="block py-1.5 text-sm text-white" onClick={() => setMobileOpen(false)}>My Orders</Link>
                  <button onClick={handleLogout} className="block py-1.5 text-sm text-red-500 w-full text-left">Sign Out</button>
                </>
              ) : (
                <Link to="/login" className="block py-1.5 text-sm text-white" onClick={() => setMobileOpen(false)}>
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}