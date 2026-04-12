export type Role = 'customer' | 'admin'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PayStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Address {
  _id: string
  label: string
  firstName: string
  lastName: string
  phone?: string
  street: string
  apartment?: string
  city: string
  state: string
  zip: string
  country: string
  isDefault: boolean
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  phone?: string
  avatar?: string
  addresses?: Address[]
  isActive: boolean
  createdAt: string
}

export interface Category {
  id: string
  _id: string
  name: string
  slug: string
  parent?: { _id: string; name: string; slug: string } | null
  description?: string
  imageUrl?: string
  isActive: boolean
  sortOrder: number
}

export interface ProductImage {
  url: string
  alt: string
  isPrimary: boolean
  sortOrder: number
}

export interface ProductVariant {
  sku: string
  size?: string
  color?: string
  colorHex?: string
  stock: number
  additionalPrice: number
}

export interface Product {
  _id: string
  id: string
  name: string
  slug: string
  sku: string
  description: string
  shortDescription: string
  category: { _id: string; name: string; slug: string }
  brand?: string
  price: number
  compareAtPrice?: number
  images: ProductImage[]
  variants: ProductVariant[]
  tags: string[]
  isFeatured: boolean
  isNewArrival: boolean
  isActive: boolean
  averageRating: number
  reviewCount: number
  totalSold: number
  totalStock: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  product: Product
  variantSku: string
  quantity: number
}

export interface Cart {
  _id: string
  user: string
  items: CartItem[]
  updatedAt: string
}

export interface OrderItem {
  product: string
  name: string
  image: string
  price: number
  quantity: number
  variantSku: string
  variantLabel: string
}

export interface Order {
  id: string
  orderNumber: string
  user?: string | User
  guestEmail?: string
  items: OrderItem[]
  shippingAddress: {
    firstName: string
    lastName: string
    phone?: string
    street: string
    apartment?: string
    city: string
    state: string
    zip: string
    country: string
  }
  subtotal: number
  shippingCost: number
  tax: number
  discount: number
  total: number
  status: OrderStatus
  paymentStatus: PayStatus
  paymentMethod: string
  couponCode?: string
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiRes<T> {
  success: boolean
  data: T
  message?: string
}

export interface PageRes<T> {
  success: boolean
  data: T[]
  pagination: Pagination
}

export interface ProductFilters {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
  colors?: string[]
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'rating'
  page?: number
  limit?: number
  featured?: boolean
  newArrival?: boolean
  all?: boolean
}

export interface AdminStats {
  overview: {
    totalUsers: number
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    monthlyRevenue: number
    weeklyOrders: number
  }
  recentOrders: Order[]
  topProducts: Product[]
  ordersByStatus: Record<string, number>
  lowStockProducts: Product[]
}