import { createPortal } from 'react-dom'
import { useToastStore } from '../../stores/toastStore'
import Toast from './Toast'

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return createPortal(
    <div className="fixed bottom-20 right-4 z-[60] flex flex-col gap-2 items-end md:bottom-5 md:right-5">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>,
    document.body,
  )
}
