import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { X, Tag as TagIcon, CheckCircle2 } from 'lucide-react'
import { useAppState } from '../context/AppState'

const COLORS = [
  { name: 'amber', dot: 'bg-amber-400' },
  { name: 'emerald', dot: 'bg-emerald-400' },
  { name: 'sky', dot: 'bg-sky-400' },
  { name: 'teal', dot: 'bg-teal-400' },
  { name: 'rose', dot: 'bg-rose-400' },
  { name: 'violet', dot: 'bg-violet-400' },
  { name: 'orange', dot: 'bg-orange-400' },
  { name: 'indigo', dot: 'bg-indigo-400' },
]

interface TagCreateModalProps {
  onClose: () => void
  onCreated?: (id: string) => void
}

export default function TagCreateModal({ onClose, onCreated }: TagCreateModalProps) {
  const { t } = useTranslation()
  const { addTag } = useAppState()
  const [name, setName] = useState('')
  const [color, setColor] = useState('emerald')

  const submit = () => {
    if (!name.trim()) return
    const id = addTag({ name, color })
    onCreated?.(id)
    onClose()
  }

  const slug = name.trim().toLowerCase().replace(/\s+/g, '-')

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-zinc-950/60 dark:bg-ink-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md card-surface bg-paper-50 dark:bg-ink-900 animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-paper-300/60 dark:border-ink-700/60 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
              {t('tagCreate.title')}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium mb-1.5">
              {t('tagCreate.name.label')}
            </div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder={t('tagCreate.name.placeholder')}
              className="w-full bg-paper-100 dark:bg-ink-850 border border-paper-300/40 dark:border-ink-700/40 rounded-lg px-3 py-2 text-[14px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition"
            />
            <p className="text-[10.5px] text-zinc-500 mt-1.5">
              {t('tagCreate.name.help')}
            </p>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium mb-1.5">
              {t('tagCreate.color.label')}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  className={`w-7 h-7 rounded-full ${c.dot} flex items-center justify-center transition ${
                    color === c.name
                      ? 'ring-2 ring-offset-2 ring-offset-paper-50 dark:ring-offset-ink-900 ring-zinc-400 scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {color === c.name && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-paper-300/60 dark:border-ink-700/60 px-5 py-3 flex items-center justify-between bg-paper-50/60 dark:bg-ink-900/60">
          <div className="text-[10.5px] text-zinc-500 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${COLORS.find((c) => c.name === color)?.dot}`} />
            <span>{t('tagCreate.preview.label')}</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">
              #{slug || t('tagCreate.preview.default')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-paper-200 dark:hover:bg-ink-800 transition"
            >
              {t('tagCreate.actions.cancel')}
            </button>
            <button
              onClick={submit}
              disabled={!name.trim()}
              className="px-3 py-1.5 rounded-lg text-xs bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition shadow-lg shadow-emerald-500/20"
            >
              {t('tagCreate.actions.create')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
