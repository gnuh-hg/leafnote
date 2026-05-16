import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Layers, RefreshCw, Loader2, Sparkles, AlertTriangle } from 'lucide-react'
import LeafItem from './LeafItem'
import LeafEditModal from './LeafEditModal'
import { useLeaves, useRegenerateLeaves, useUpdateLeaf, useDeleteLeaf } from '../hooks/useLeaves'
import type { LeafOut } from '../services/leaves'
import type { DocumentType } from '../services/notes'

interface Props {
  noteId: string | undefined
  documentType: DocumentType
  isNew: boolean
  dirty: boolean
}

export function LiveEnginePanel({ noteId, documentType, isNew, dirty }: Props) {
  const { t } = useTranslation()
  const regen = useRegenerateLeaves(noteId)
  const { data: leaves = [] } = useLeaves(noteId)

  const isFreeform = documentType === 'freeform'
  const disabled = isNew || dirty || regen.isPending || isFreeform || !noteId

  let statusLabel = ''
  if (isNew) statusLabel = t('editor.engine.waiting')
  else if (isFreeform) statusLabel = t('editor.engine.freeform')
  else if (regen.isPending) statusLabel = t('editor.engine.running')
  else if (dirty) statusLabel = t('editor.engine.willRerun')
  else statusLabel = t('editor.engine.descriptionDone', { count: leaves.length })

  return (
    <div className="card-surface p-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
            {t('editor.engine.title')}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">{statusLabel}</div>
        </div>
      </div>

      {!isFreeform && (
        <button
          onClick={() => regen.mutate()}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium bg-emerald-500 hover:bg-emerald-400 text-white shadow-sm disabled:bg-paper-200 dark:disabled:bg-ink-800 disabled:text-zinc-500 disabled:cursor-not-allowed disabled:shadow-none transition"
        >
          {regen.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {leaves.length === 0 ? t('editor.engine.split') : t('editor.engine.resplit')}
        </button>
      )}

      {regen.data?.quality && !isFreeform && (
        <div className="mt-3 text-[10.5px] text-zinc-500 flex items-center gap-2 flex-wrap">
          <span>{t('editor.engine.quality')}:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {Math.round(regen.data.quality.total * 100)}%
          </span>
          {regen.data.retried && (
            <span className="text-amber-600 dark:text-amber-300 inline-flex items-center gap-1">
              <RefreshCw className="w-2.5 h-2.5" />
              {t('editor.engine.wasRetried')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function LiveLeavesPanel({ noteId, documentType, isNew }: Props) {
  const { t } = useTranslation()
  const { data: leaves = [], isLoading, isError } = useLeaves(noteId)
  const updateLeaf = useUpdateLeaf(noteId)
  const deleteLeaf = useDeleteLeaf(noteId)
  const [editingLeaf, setEditingLeaf] = useState<LeafOut | null>(null)

  const isFreeform = documentType === 'freeform'

  return (
    <>
      <div className="card-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap text-zinc-500">
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-[11px] uppercase tracking-wider font-medium">
              {t('editor.leaves.title', { count: leaves.length })}
            </h3>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
              {t('editor.leaves.aiReview')}
            </span>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-6 text-[12px] text-zinc-500 flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {t('common.loading')}
          </div>
        )}

        {!isLoading && isError && (
          <div className="text-center py-6 text-[12px] text-rose-500 flex items-center justify-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t('editor.leaves.loadError')}
          </div>
        )}

        {!isLoading && !isError && leaves.length === 0 && (
          <div className="text-center py-6">
            <div className="text-[13px] text-zinc-600 dark:text-zinc-300 mb-1">
              {isFreeform
                ? t('editor.leaves.freeformTitle')
                : isNew
                ? t('editor.leaves.emptyTitle')
                : t('editor.leaves.notSplitTitle')}
            </div>
            <div className="text-[11px] text-zinc-500 leading-relaxed max-w-[280px] mx-auto">
              {isFreeform
                ? t('editor.leaves.freeformDescription')
                : isNew
                ? t('editor.leaves.emptyDescription')
                : t('editor.leaves.notSplitDescription')}
            </div>
          </div>
        )}

        {!isLoading && !isError && leaves.length > 0 && (
          <div className="space-y-2">
            {leaves.map((leaf) => (
              <LeafItem
                key={leaf.id}
                leaf={leaf}
                onEdit={setEditingLeaf}
                onDelete={(l) => {
                  if (window.confirm(t('leafCard.deleteConfirm'))) {
                    deleteLeaf.mutate(l.id)
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      <LeafEditModal
        leaf={editingLeaf}
        saving={updateLeaf.isPending}
        onClose={() => setEditingLeaf(null)}
        onSave={(data) => {
          if (!editingLeaf) return
          updateLeaf.mutate(
            { id: editingLeaf.id, data },
            { onSuccess: () => setEditingLeaf(null) },
          )
        }}
      />
    </>
  )
}
