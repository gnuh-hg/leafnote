import { create } from 'zustand'

export type ToastType = 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  createdAt: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (type: ToastType, message: string) => void
  removeToast: (id: string) => void
}

const AUTO_DISMISS_MS: Record<ToastType, number | null> = {
  error: null,
  warning: 4000,
  info: 4000,
}

const MAX_TOASTS = 3

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (type, message) => {
    const id = crypto.randomUUID()
    const toast: Toast = { id, type, message, createdAt: Date.now() }

    set((state) => {
      const next = [...state.toasts, toast]
      return { toasts: next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next }
    })

    const delay = AUTO_DISMISS_MS[type]
    if (delay !== null) {
      setTimeout(() => get().removeToast(id), delay)
    }
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))
