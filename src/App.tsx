import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useWishlistStore } from '@/store/wishlist'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import MainLayout from '@/components/layout/MainLayout'

import AdminLayout from '@/components/layout/AdminLayout'
import { ProtectedRoute, AdminRoute } from '@/components/layout/RouteGuards'
import { Spinner } from '@/components/ui/Spinner'

const HomePage        = lazy(() => import('@/pages/HomePage'))
const ShopPage        = lazy(() => import('@/pages/ShopPage'))
const SearchPage      = lazy(() => import('@/pages/SearchPage'))
const ContactPage     = lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.default })))
const ProductPage     = lazy(() => import('@/pages/ProductPage'))
const WishlistPage    = lazy(() => import('@/pages/WishlistPage'))
const CheckoutPage    = lazy(() => import('@/pages/CheckoutPage'))
const ProfilePage     = lazy(() => import('@/pages/ProfilePage'))
const LoginPage       = lazy(() => import('@/pages/AuthPages').then((m) => ({ default: m.LoginPage })))
const RegisterPage    = lazy(() => import('@/pages/AuthPages').then((m) => ({ default: m.RegisterPage })))
const OrdersPage      = lazy(() => import('@/pages/OrderPages').then((m) => ({ default: m.OrdersPage })))
const OrderDetail     = lazy(() => import('@/pages/OrderPages').then((m) => ({ default: m.OrderDetailPage })))
const AdminDashboard  = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminProducts   = lazy(() => import('@/pages/admin/AdminProducts'))
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'))
const AdminOrders     = lazy(() => import('@/pages/admin/AdminOrders'))
const AdminUsers      = lazy(() => import('@/pages/admin/AdminUsers'))

export default function App() {
  const { isAuthenticated } = useAuthStore()


  return (
    <Suspense fallback={<Spinner full />}>
      <ScrollToTop />
      <Routes>

        {/* Auth pages — no header/footer */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Storefront with header/footer */}
        <Route element={<MainLayout />}>
          <Route path="/"               element={<HomePage />} />
          <Route path="/shop"           element={<ShopPage />} />
          <Route path="/search"         element={<SearchPage />} />
          <Route path="/contact"      element={<ContactPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />

          <Route path="/wishlist" element={<WishlistPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/cart"       element={<CheckoutPage />} />
            <Route path="/checkout"   element={<CheckoutPage />} />
            <Route path="/orders"     element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/profile"    element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Admin */}
       <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin"             element={<AdminDashboard />} />
          <Route path="/admin/products"    element={<AdminProducts />} />
          <Route path="/admin/categories"  element={<AdminCategories />} />
          <Route path="/admin/orders"      element={<AdminOrders />} />
          <Route path="/admin/users"       element={<AdminUsers />} />
        </Route>
      </Route> 

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '6rem', color: '#e7e5e4', lineHeight: 1 }}>
              404
            </p>
            <h1 className="text-2xl font-medium text-stone-800 mb-3 mt-2">
              Page not found
            </h1>
            <a href="/" className="btn btn-primary mt-4">Go Home</a>
          </div>
        } />

      </Routes>
    </Suspense>
  )
}