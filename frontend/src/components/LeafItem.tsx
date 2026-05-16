import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  Link2,
  Lightbulb,
  HelpCircle,
  StickyNote,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import type { LeafOut, LeafType } from '../services/leaves'

const TYPE_STYLES: Record<LeafType, {
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}> = {
  definition: {
    labelKey: 'leafType.definition',
    icon: BookOpen,
    color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  },
  fact: {
    labelKey: 'leafType.fact',
    icon: Link2,
    color: 'text-sky-700 dark:text-sky-300 bg-sky-500/10 border-sky-500/20',
  },
  example: {
    labelKey: 'leafType.example',
    icon: Lightbulb,
    color: 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20',
  },
  question: {
    labelKey: 'leafType.question',
    icon: HelpCircle,
    color: 'text-violet-700 dark:text-violet-300 bg-violet-500/10 border-violet-500/20',
  },
  note: {
    labelKey: 'leafType.note',
    icon: StickyNote,
    color: 'text-zinc-700 dark:text-zinc-300 bg-zinc-500/10 border-zinc-500/20',
  },
}

const UNCERTAIN_THRESHOLD = 0.6

interface Props {
  leaf: LeafOut
  onEdit: (leaf: LeafOut) => void
  onDelete: (leaf: LeafOut) => void
}

export default function LeafItem({ leaf, onEdit, onDelete }: Props) {
  const { t } = useTranslation()
  const T = TYPE_STYLES[leaf.type] ?? TYPE_STYLES.note
  const uncertain = leaf.confidence < UNCERTAIN_THRESHOLD

  return (
    <div className="card-surface p-3 hover:border-emerald-500/40 transition group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-medium border ${T.color}`}
          >
            <T.icon className="w-3 h-3" />
            {t(T.labelKey)}
          </span>
          {leaf.user_edited && (
            <span className="text-[9.5px] text-emerald-600 dark:text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              {t('leafCard.edited')}
            </span>
          )}
          {uncertain && (
            <span
              className="inline-flex items-center gap-1 text-[9.5px] text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20"
              title={t('leafCard.uncertainTooltip', { value: leaf.confidence.toFixed(2) })}
            >
              <AlertTriangle className="w-2.5 h-2.5" />
              {t('leafCard.uncertain')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
          <button
            onClick={() => onEdit(leaf)}
            className="p-1 rounded text-zinc-500 hover:text-emerald-600 hover:bg-paper-200 dark:hover:bg-ink-850"
            title={t('common.edit')}
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(leaf)}
            className="p-1 rounded text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10"
            title={t('common.delete')}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <p className="text-[12.5px] leading-relaxed text-zinc-800 dark:text-zinc-100 whitespace-pre-wrap">
        {leaf.content}
      </p>

      {leaf.type === 'definition' && Boolean(leaf.metadata.term) && (
        <div className="mt-2 text-[10.5px] text-zinc-500">
          <span className="text-emerald-600 dark:text-emerald-400">{t('leafCard.term')}:</span>{' '}
          {String(leaf.metadata.term)}
        </div>
      )}
      {leaf.metadata.ordinal !== undefined && (
        <div className="mt-2 text-[10.5px] text-zinc-500">
          {t('leafCard.step', { n: Number(leaf.metadata.ordinal) })}
        </div>
      )}
      {leaf.metadata.source !== undefined && (
        <div className="mt-2 text-[10.5px] text-zinc-500">
          {t('leafCard.source')}: {String(leaf.metadata.source)}
        </div>
      )}
    </div>
  )
}
