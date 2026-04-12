import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  setAuth: (user: User, token: string) => void
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isAdmin: false,

      setAuth: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isAdmin: user.role.toLowerCase() === 'admin',
        }),

      setAccessToken: (accessToken) => set({ accessToken }),

      setUser: (user) =>
        set({ user, isAdmin: user.role.toLowerCase() === 'admin' }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isAdmin: false,
        }),
    }),
    {
      name: 'elara:auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        isAuthenticated: s.isAuthenticated,
        isAdmin: s.isAdmin,
      }),
    }
  )
)