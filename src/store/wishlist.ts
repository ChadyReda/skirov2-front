import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types'

interface WishlistStore {
  items: Product[]
  set: (items: Product[]) => void
  toggle: (product: Product) => void
  includes: (productId: string) => boolean
  clear: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      set: (items: Product[]) => set({ items }),
      toggle: (product: Product) => {
        const id = product.id || product._id
        const exists = get().items.some((p) => (p.id || p._id) === id)
        if (exists) {
          set({ items: get().items.filter((p) => (p.id || p._id) !== id) })
        } else {
          set({ items: [...get().items, product] })
        }
      },
      includes: (productId: string) => get().items.some((p) => (p.id || p._id) === productId),
      clear: () => set({ items: [] }),
    }),
    { name: 'wishlist' }
  )
)