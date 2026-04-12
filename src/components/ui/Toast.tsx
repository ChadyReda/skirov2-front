import { create } from 'zustand'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  msg: string
  type: ToastType
}

interface ToastState {
  toasts: Toast[]
  add: (msg: string, type?: ToastType) => void
  rm: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (msg: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      4000
    )
  },
  rm: (id: string) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = (msg: string, type: ToastType = 'info') =>
  useToastStore.getState().add(msg, type)

const ICON: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
}

const BG: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-emerald-50',
  error:   'border-red-200 bg-red-50',
  info:    'border-stone-200 bg-white',
}

const TXT: Record<ToastType, string> = {
  success: 'text-emerald-700',
  error:   'text-red-700',
  info:    'text-stone-700',
}

export function ToastContainer() {
  const { toasts, rm } = useToastStore()
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => {
        const Icon = ICON[t.type]
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 border shadow-lg animate-fade-up ${BG[t.type]}`}
          >
            <Icon size={17} className={TXT[t.type]} />
            <p className={`flex-1 text-sm font-medium ${TXT[t.type]}`}>
              {t.msg}
            </p>
            <button
              onClick={() => rm(t.id)}
              className="text-stone-400 hover:text-stone-700"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}