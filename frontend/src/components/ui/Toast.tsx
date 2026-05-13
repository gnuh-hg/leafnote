import { useEffect, useState } from 'react'
import { X, XCircle, AlertTriangle, Info } from 'lucide-react'
import type { Toast as ToastType } from '../../stores/toastStore'

const ICON = {
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const BORDER_COLOR = {
  error: 'border-l-rose-500',
  warning: 'border-l-amber-500',
  info: 'border-l-sky-500',
}

const ICON_COLOR = {
  error: 'text-rose-500',
  warning: 'text-amber-500',
  info: 'text-sky-500',
}

interface ToastProps {
  toast: ToastType
  onRemove: (id: string) => void
}

export default function Toast({ toast, onRemove }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const Icon = ICON[toast.type]

  function handleClose() {
    setVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  return (
    <div
      className={`
        flex items-start gap-3 w-80 px-4 py-3 rounded-xl
        bg-paper-100 dark:bg-ink-850
        border border-paper-300/60 dark:border-ink-700/60 border-l-4 ${BORDER_COLOR[toast.type]}
        shadow-lg backdrop-blur-sm
        transition-all duration-300
        ${visible ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0'}
      `}
    >
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${ICON_COLOR[toast.type]}`} />
      <p className="flex-1 text-[13px] text-zinc-700 dark:text-zinc-200 leading-snug">
        {toast.message}
      </p>
      <button
        onClick={handleClose}
        className="p-0.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
