import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LEAF_TYPES, type LeafOut, type LeafType } from '../services/leaves'

interface Props {
  leaf: LeafOut | null
  onClose: () => void
  onSave: (data: { type: LeafType; content: string }) => void
  saving: boolean
}

export default function LeafEditModal({ leaf, onClose, onSave, saving }: Props) {
  const { t } = useTranslation()
  const [type, setType] = useState<LeafType>('fact')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (leaf) {
      setType(leaf.type)
      setContent(leaf.content)
    }
  }, [leaf])

  if (!leaf) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="card-surface bg-paper-50 dark:bg-ink-900 w-full max-w-md p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-medium text-zinc-900 dark:text-zinc-100">
            {t('leafEdit.title')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-paper-200 dark:hover:bg-ink-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="block text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-1.5">
          {t('leafEdit.type')}
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as LeafType)}
          className="w-full mb-4 px-3 py-2 rounded-md text-[13px] bg-paper-100 dark:bg-ink-850 border border-paper-300/60 dark:border-ink-700/60 text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500/40"
        >
          {LEAF_TYPES.map((lt) => (
            <option key={lt} value={lt}>
              {t(`leafType.${lt}`)}
            </option>
          ))}
        </select>

        <label className="block text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-1.5">
          {t('leafEdit.content')}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 rounded-md text-[13px] bg-paper-100 dark:bg-ink-850 border border-paper-300/60 dark:border-ink-700/60 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500/40 resize-none"
          placeholder={t('leafEdit.contentPlaceholder')}
        />

        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-[12px] text-zinc-600 dark:text-zinc-300 hover:bg-paper-200 dark:hover:bg-ink-800 transition"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onSave({ type, content: content.trim() })}
            disabled={saving || !content.trim()}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-emerald-500 hover:bg-emerald-400 text-white disabled:bg-paper-200 dark:disabled:bg-ink-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
