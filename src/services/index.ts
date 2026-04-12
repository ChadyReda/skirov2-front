import { api } from './api'
import type {
  ApiRes, PageRes,
  User, Product, Category, Cart, Order,
  AdminStats, ProductFilters,
} from '@/types'

// ── AUTH ──────────────────────────────────────────
export const authApi = {
  register: (d: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) =>
    api
      .post<ApiRes<{ user: User; accessToken: string }>>('/auth/register', d)
      .then((r) => r.data.data),

  login: (d: { email: string; password: string }) =>
    api
      .post<ApiRes<{ user: User; accessToken: string }>>('/auth/login', d)
      .then((r) => r.data.data),

  logout: () => api.post('/auth/logout'),

  me: () =>
    api
      .get<ApiRes<{ user: User }>>('/auth/me')
      .then((r) => r.data.data.user),
}

// ── PRODUCTS ──────────────────────────────────────
export const productApi = {
  list: (f: ProductFilters = {}) => {
    const p: Record<string, string | number | boolean> = {}
    if (f.category)    p.category   = f.category
    if (f.search)      p.search     = f.search
    if (f.minPrice != null) p.minPrice = f.minPrice
    if (f.maxPrice != null) p.maxPrice = f.maxPrice
    if (f.sizes?.length)    p.sizes  = f.sizes.join(',')
    if (f.colors?.length)   p.colors = f.colors.join(',')
    if (f.sort)        p.sort       = f.sort
    if (f.page)        p.page       = f.page
    if (f.limit)       p.limit      = f.limit
    if (f.featured)    p.featured   = 'true'
    if (f.newArrival)  p.newArrival = 'true'
    return api
      .get<PageRes<Product>>('/products', { params: p })
      .then((r) => r.data)
  },

  bySlug: (slug: string) =>
    api
      .get<ApiRes<Product>>(`/products/${slug}`)
      .then((r) => r.data.data),

  byId: (id: string) =>
    api
      .get<ApiRes<Product>>(`/products/id/${id}`)
      .then((r) => r.data.data),

  featured: (limit = 8) =>
    api
      .get<ApiRes<Product[]>>('/products/featured', { params: { limit } })
      .then((r) => r.data.data),

  newArrivals: (limit = 8) =>
    api
      .get<ApiRes<Product[]>>('/products/new-arrivals', { params: { limit } })
      .then((r) => r.data.data),

  related: (id: string) =>
    api
      .get<ApiRes<Product[]>>(`/products/id/${id}/related`)
      .then((r) => r.data.data),

  create: (d: Record<string, unknown>) =>
    api
      .post<ApiRes<Product>>('/products', d)
      .then((r) => r.data.data),

  update: (id: string, d: Record<string, unknown>) =>
    api
      .put<ApiRes<Product>>(`/products/${id}`, d)
      .then((r) => r.data.data),

  delete: (id: string) => api.delete(`/products/${id}`),

  uploadImages: (fd: FormData) =>
    api
      .post<ApiRes<{ urls: string[] }>>(
        '/products/upload/images',
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      .then((r) => r.data.data),
}

// ── CATEGORIES ────────────────────────────────────
export const categoryApi = {
  list: () =>
    api
      .get<ApiRes<Category[]>>('/categories')
      .then((r) => r.data.data),

  listAll: () =>
    api
      .get<ApiRes<Category[]>>('/categories/all')
      .then((r) => r.data.data),

  create: (d: Record<string, unknown>) =>
    api
      .post<ApiRes<Category>>('/categories', d)
      .then((r) => r.data.data),

  update: (id: string, d: Record<string, unknown>) =>
    api
      .put<ApiRes<Category>>(`/categories/${id}`, d)
      .then((r) => r.data.data),

  delete: (id: string) => api.delete(`/categories/${id}`),
}

// ── CART ──────────────────────────────────────────
export const cartApi = {
  get: () =>
    api.get<ApiRes<Cart>>('/cart').then((r) => r.data.data),

  add: (productId: string, variantSku: string, quantity = 1) =>
    api
      .post<ApiRes<Cart>>('/cart/items', { productId, variantSku, quantity })
      .then((r) => r.data.data),

  update: (sku: string, quantity: number) =>
    api
      .put<ApiRes<Cart>>(`/cart/items/${sku}`, { quantity })
      .then((r) => r.data.data),

  remove: (sku: string) =>
    api
      .delete<ApiRes<Cart>>(`/cart/items/${sku}`)
      .then((r) => r.data.data),

  clear: () => api.delete('/cart'),
}

// ── ORDERS ────────────────────────────────────────
export const orderApi = {
  create: (d: Record<string, unknown>) =>
    api
      .post<ApiRes<Order>>('/orders', d)
      .then((r) => r.data.data),

  mine: (page = 1) =>
    api
      .get<PageRes<Order>>('/orders/my', { params: { page, limit: 10 } })
      .then((r) => r.data),

  byId: (id: string) =>
    api
      .get<ApiRes<Order>>(`/orders/${id}`)
      .then((r) => r.data.data),

  adminList: (p: Record<string, string | number> = {}) =>
    api
      .get<PageRes<Order>>('/orders/admin/all', { params: p })
      .then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    api
      .put<ApiRes<Order>>(`/orders/${id}/status`, { status })
      .then((r) => r.data.data),
}

// ── PROFILE ───────────────────────────────────────
export const profileApi = {
  get: () =>
    api.get<ApiRes<User>>('/profile').then((r) => r.data.data),

  update: (d: Record<string, unknown>) =>
    api
      .put<ApiRes<User>>('/profile', d)
      .then((r) => r.data.data),

  changePw: (d: { currentPassword: string; newPassword: string }) =>
    api.put('/profile/password', d),

  addAddress: (d: Record<string, unknown>) =>
    api.post('/profile/addresses', d),

  removeAddress: (id: string) =>
    api.delete(`/profile/addresses/${id}`),
}

// ── ADMIN ─────────────────────────────────────────
export const adminApi = {
  stats: () =>
    api
      .get<ApiRes<AdminStats>>('/admin/stats')
      .then((r) => r.data.data),

  users: (p: Record<string, string | number> = {}) =>
    api
      .get<PageRes<User>>('/admin/users', { params: p })
      .then((r) => r.data),

  updateRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),

  updateStatus: (id: string, isActive: boolean) =>
    api.put(`/admin/users/${id}/status`, { isActive }),
}

// ── REVIEWS ───────────────────────────────────────
export const reviewApi = {
  list: (productId: string) =>
    api
      .get<ApiRes<any[]>>(`/products/${productId}/reviews`)
      .then((r) => r.data.data),

  create: (productId: string, data: { rating: number; title: string; body: string }) =>
    api
      .post<ApiRes<any>>(`/products/${productId}/reviews`, data)
      .then((r) => r.data.data),
}

