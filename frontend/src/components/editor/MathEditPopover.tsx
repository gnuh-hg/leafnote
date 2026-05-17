import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import katex from 'katex'

export interface MathEditTarget {
  pos: number
  latex: string
  kind: 'inline' | 'block'
  /** true = node chưa tồn tại, save sẽ insert mới; false = node đang sửa */
  isNew: boolean
  rect: { left: number; top: number; bottom: number }
}

interface Props {
  target: MathEditTarget | null
  onSave: (latex: string) => void
  onDelete: () => void
  onClose: () => void
}

export default function MathEditPopover({ target, onSave, onDelete, onClose }: Props) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (target) {
      setValue(target.latex ?? '')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [target])

  useEffect(() => {
    if (!previewRef.current) return
    try {
      katex.render(value || '\\:', previewRef.current, {
        displayMode: target?.kind === 'block',
        throwOnError: false,
        errorColor: '#dc2626',
      })
    } catch {
      previewRef.current.textContent = value
    }
  }, [value, target?.kind])

  useEffect(() => {
    if (!target) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [target, onClose])

  if (!target) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(value.trim())
  }

  return (
    <div
      className="fixed z-50 w-80 rounded-xl border border-paper-300/60 bg-paper-100 shadow-xl dark:border-ink-700/60 dark:bg-ink-850"
      style={{
        left: Math.min(target.rect.left, window.innerWidth - 340),
        top: target.rect.bottom + 6,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="p-3 space-y-2">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          placeholder={t('editor.math.placeholder')}
          className="w-full px-2 py-1.5 text-sm font-mono rounded-md border border-paper-300/60 bg-paper-50 dark:bg-ink-900 dark:border-ink-700/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 resize-none"
        />
        <div
          ref={previewRef}
          className="min-h-[28px] px-2 py-1 text-center text-zinc-700 dark:text-zinc-200 bg-paper-50 dark:bg-ink-900/50 rounded-md overflow-x-auto"
        />
        <div className="flex justify-between gap-2">
          <button
            type="button"
            onClick={onDelete}
            className="px-3 py-1 text-xs rounded-md text-red-600 hover:bg-red-500/10 dark:text-red-400"
          >
            {t('editor.math.delete')}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-xs rounded-md text-zinc-600 hover:bg-paper-200 dark:text-zinc-300 dark:hover:bg-ink-800"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs rounded-md bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {t('editor.math.edit')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
