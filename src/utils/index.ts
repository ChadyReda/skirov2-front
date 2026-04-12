import type { Product, ProductVariant, ProductImage } from '@/types'

export const fmt = (n: number | string) =>
  new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
  }).format(Number(n))

export const fmtDate = (s: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(s))

export const fmtDateShort = (s: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(s))

export const primaryImage = (p: Product): ProductImage | null => {
  if (!p.images || p.images.length === 0) return null
  return p.images.find(i => i.isPrimary) ?? p.images[0]
}

export const discountPct = (p: Product): number => {
  const price = Number(p.price)
  const compareAtPrice = p.compareAtPrice ? Number(p.compareAtPrice) : 0
  if (!compareAtPrice || compareAtPrice <= price) return 0
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}

export const variantLabel = (v: ProductVariant) =>
  [v.size, v.color].filter(Boolean).join(' / ') || v.sku

export const totalStock = (p: Product) =>
  p.variants.reduce((s, v) => s + v.stock, 0)

export const cn = (...c: (string | undefined | null | boolean)[]) =>
  c.filter(Boolean).join(' ')

export const statusBadge = (s: string) => {
  switch (s.toUpperCase()) {
    case 'DELIVERED':  return 'badge-green'
    case 'SHIPPED':    return 'badge-blue'
    case 'PROCESSING':
    case 'CONFIRMED':  return 'badge-yellow'
    case 'CANCELLED':  return 'badge-red'
    default:           return 'badge-stone'
  }
}

export const cap = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()