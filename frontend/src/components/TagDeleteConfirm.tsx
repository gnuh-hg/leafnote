import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { useDeleteTag } from '../hooks/useTags'
import type { TagOut } from '../services/tags'

interface TagDeleteConfirmProps {
  tag: TagOut
  onClose: () => void
}

export default function TagDeleteConfirm({ tag, onClose }: TagDeleteConfirmProps) {
  const { t } = useTranslation()
  const deleteTag = useDeleteTag()

  const handleDelete = () => {
    deleteTag.mutate(tag.id)
    onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-32 px-4 bg-zinc-950/60 dark:bg-ink-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm card-surface bg-paper-50 dark:bg-ink-900 animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <div className="text-[14px] font-medium text-zinc-900 dark:text-zinc-100">
              {t('tagDelete.confirm.title')} #{tag.name}
            </div>
          </div>
          <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {t('tagDelete.confirm.description')}
          </p>
        </div>

        <div className="border-t border-paper-300/60 dark:border-ink-700/60 px-5 py-3 flex items-center justify-end gap-2 bg-paper-50/60 dark:bg-ink-900/60">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-paper-200 dark:hover:bg-ink-800 transition"
          >
            {t('tagDelete.actions.cancel')}
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-lg text-xs bg-rose-500 hover:bg-rose-400 text-white font-medium transition"
          >
            {t('tagDelete.actions.delete')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
