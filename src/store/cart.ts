import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Cart } from '@/types'

interface CartState {
  cart: Cart | null
  isOpen: boolean
  setCart: (c: Cart | null) => void
  open: () => void
  close: () => void
  toggle: () => void
  itemCount: () => number
  subtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isOpen: false,
      setCart: (cart) => set({ cart }),
      open:   () => set({ isOpen: true }),
      close:  () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      itemCount: () =>
        get().cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0,
      subtotal: () =>
        get().cart?.items.reduce(
          (s, i) => s + i.product.price * i.quantity, 0
        ) ?? 0,
    }),
    {
      name: 'elara:cart',
      partialize: (s) => ({ cart: s.cart }),
    }
  )
)