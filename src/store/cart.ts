import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Cart, CartItem } from '@/types'

interface CartState {
  cart: Cart | null
  isOpen: boolean
  setCart: (c: Cart | null) => void
  addItem: (product: any, variantSku: string, quantity: number) => void
  removeItem: (variantSku: string) => void
  updateQty: (variantSku: string, quantity: number) => void
  clearCart: () => void
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

      addItem: (product, variantSku, quantity) => {
        const cart = get().cart || { _id: 'guest', user: 'guest', items: [] as CartItem[], updatedAt: new Date().toISOString() }
        const items = [...cart.items]
        const existing = items.find((i) => i.variantSku === variantSku)
        
        if (existing) {
          existing.quantity += quantity
        } else {
          items.push({ product, variantSku, quantity })
        }
        
        set({ cart: { ...cart, items, updatedAt: new Date().toISOString() } })
      },

      removeItem: (variantSku) => {
        const cart = get().cart
        if (!cart) return
        cart.items = cart.items.filter((i) => i.variantSku !== variantSku)
        set({ cart: { ...cart, updatedAt: new Date().toISOString() } })
      },

      updateQty: (variantSku, quantity) => {
        const cart = get().cart
        if (!cart) return
        const item = cart.items.find((i) => i.variantSku === variantSku)
        if (item) {
          item.quantity = quantity
          set({ cart: { ...cart, updatedAt: new Date().toISOString() } })
        }
      },

      clearCart: () => set({ cart: null }),

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