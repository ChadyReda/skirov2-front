import axios from 'axios'
import { useAuthStore } from '@/store/auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 15000,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
let refreshing = false
let queue: ((token: string) => void)[] = []

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config as typeof err.config & { _retry?: boolean }
    if (err.response?.status !== 401 || orig._retry) {
      return Promise.reject(err)
    }

    if (refreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          orig.headers.Authorization = `Bearer ${token}`
          resolve(api(orig))
        })
      })
    }

    orig._retry = true
    refreshing = true

    try {
      const { data } = await api.post(
        '/auth/refresh',
        {},
        { withCredentials: true }
      )
      const token: string = data.data.accessToken
      useAuthStore.getState().setAccessToken(token)
      queue.forEach((cb) => cb(token))
      queue = []
      orig.headers.Authorization = `Bearer ${token}`
      return api(orig)
    } catch {
      useAuthStore.getState().logout()
      return Promise.reject(err)
    } finally {
      refreshing = false
    }
  }
)

export const errMsg = (e: unknown): string => {
  if (axios.isAxiosError(e)) {
    const d = e.response?.data
    if (d?.errors?.length) return d.errors[0].message
    return d?.message || e.message || 'Something went wrong'
  }
  return e instanceof Error ? e.message : 'Something went wrong'
}