import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  return <Outlet />
}

export function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin)         return <Navigate to="/" replace />

  return <Outlet />
}