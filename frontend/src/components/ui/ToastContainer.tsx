import { createPortal } from 'react-dom'
import { useToastStore } from '../../stores/toastStore'
import Toast from './Toast'

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return createPortal(
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>,
    document.body,
  )
}
