import { useTranslation } from 'react-i18next'
import { X, Brain, Link2, Edit2, GitMerge, Calendar, Eye, Snowflake, Sun } from 'lucide-react'
import { TYPE_STYLES, RetentionRow } from './LeafCard'
import { leaves as allLeaves } from '../data/mockData'
import type { Leaf } from '../data/mockData'

interface LeafDetailModalProps {
  leaf: Leaf
  onClose: () => void
}

export default function LeafDetailModal({ leaf, onClose }: LeafDetailModalProps) {
  const { t } = useTranslation()
  const T = TYPE_STYLES[leaf.type] ?? TYPE_STYLES.definition
  const linked = (leaf.linkedLeaves ?? [])
    .map((id) => allLeaves.find((l) => l.id === id))
    .filter((l): l is Leaf => l !== undefined)

  const questionTypeLabel = (type: string) => {
    if (type === 'cloze') return t('leafDetail.questionTypes.cloze')
    if (type === 'definition-reverse') return t('leafDetail.questionTypes.definitionReverse')
    return t('leafDetail.questionTypes.application')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 dark:bg-ink-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto card-surface bg-paper-50 dark:bg-ink-900 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-paper-50/95 dark:bg-ink-900/95 backdrop-blur-xl border-b border-paper-300/60 dark:border-ink-700/60 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className={`pill border ${T.color}`}>
              <T.icon className="w-3 h-3" />
              {t(T.label)}
            </span>
            {leaf.dormant && (
              <span className="pill border text-sky-700 dark:text-sky-300 bg-sky-500/10 border-sky-500/20">
                <Snowflake className="w-2.5 h-2.5" />
                {t('leaf.dormant')}
              </span>
            )}
            <span className="text-[11px] text-zinc-500">
              ID: <span className="font-mono">{leaf.id}</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Leaf content */}
          <p className="text-2xl leading-snug font-serif text-zinc-900 dark:text-zinc-50">
            {leaf.content}
          </p>

          {/* Why surfacing */}
          {leaf.surfacingReason && (
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-1 font-medium">
                {t('leafDetail.whySurfacing')}
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-200">{leaf.surfacingReason}</p>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card-surface p-4 bg-paper-100/60 dark:bg-ink-850/60">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-3 font-medium">
                {t('leafDetail.lifecycle')}
              </div>
              <div className="space-y-2.5">
                <RetentionRow label={t('leaf.retention')} value={leaf.retention} kind="retention" />
                <RetentionRow label={t('leaf.relevance')} value={leaf.relevance} kind="relevance" />
              </div>
              <div className="mt-4 pt-3 border-t border-paper-300/60 dark:border-ink-700/60 grid grid-cols-2 gap-2 text-[11px]">
                <Meta
                  icon={Eye}
                  label={t('leafDetail.reviewed')}
                  value={`${leaf.reviewCount} ${t('leafDetail.reviewedUnit')}`}
                />
                <Meta icon={Calendar} label={t('leafDetail.lastReview')} value={leaf.lastReviewedAt} />
              </div>
            </div>

            <div className="card-surface p-4 bg-paper-100/60 dark:bg-ink-850/60">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-3 font-medium">
                {t('leafDetail.forgettingCurve')}
              </div>
              <MiniCurve retention={leaf.retention} />
            </div>
          </div>

          {/* Recall questions */}
          {leaf.questions && leaf.questions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {t('leafDetail.questions')}
                </h3>
                <span className="text-[10px] text-zinc-500">
                  {leaf.questions.length} {t('leafDetail.questionVariants')}
                </span>
              </div>
              <div className="space-y-2">
                {leaf.questions.map((q, i) => (
                  <div
                    key={i}
                    className="card-surface p-3.5 bg-paper-100/40 dark:bg-ink-850/40 hover:bg-paper-100 dark:hover:bg-ink-850 transition cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium pt-0.5 shrink-0 w-20">
                        {questionTypeLabel(q.type)}
                      </span>
                      <p className="text-sm text-zinc-700 dark:text-zinc-200 flex-1">{q.q}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked leaves */}
          {linked.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {t('leafDetail.linkedLeaves')}
                </h3>
                <span className="text-[10px] text-zinc-500">
                  {linked.length} {t('leafDetail.linkedUnit')}
                </span>
              </div>
              <div className="space-y-1.5">
                {linked.map((ll) => (
                  <div
                    key={ll.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-paper-100/60 dark:bg-ink-850/60 hover:bg-paper-100 dark:hover:bg-ink-850 transition"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${TYPE_STYLES[ll.type].dot} shrink-0`} />
                    <p className="text-[13px] text-zinc-700 dark:text-zinc-300 flex-1 truncate">
                      {ll.content}
                    </p>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {Math.round(ll.retention * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-paper-50/95 dark:bg-ink-900/95 backdrop-blur-xl border-t border-paper-300/60 dark:border-ink-700/60 px-6 py-3 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500">
            {t('leafDetail.source')}{' '}
            <span className="text-zinc-700 dark:text-zinc-300">{leaf.sourceNoteTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-paper-200 dark:hover:bg-ink-800 transition flex items-center gap-1.5">
              <Edit2 className="w-3 h-3" />
              {t('leafDetail.actions.edit')}
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-paper-200 dark:hover:bg-ink-800 transition flex items-center gap-1.5">
              <GitMerge className="w-3 h-3" />
              {t('leafDetail.actions.merge')}
            </button>
            {leaf.dormant ? (
              <button className="px-3 py-1.5 rounded-lg text-xs text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200 hover:bg-amber-500/10 transition flex items-center gap-1.5">
                <Sun className="w-3 h-3" />
                {t('leafDetail.actions.revive')}
              </button>
            ) : (
              <button className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-500/10 transition flex items-center gap-1.5">
                <Snowflake className="w-3 h-3" />
                {t('leafDetail.actions.dormant')}
              </button>
            )}
            <button className="px-3 py-1.5 rounded-lg text-xs bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition flex items-center gap-1.5">
              <Brain className="w-3 h-3" />
              {t('leafDetail.actions.review')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetaProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}

function Meta({ icon: Icon, label, value }: MetaProps) {
  return (
    <div className="flex items-center gap-1.5 text-zinc-500">
      <Icon className="w-3 h-3" />
      <span>{label}:</span>
      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{value}</span>
    </div>
  )
}

function MiniCurve({ retention }: { retention: number }) {
  const { t } = useTranslation()
  const points: { x: number; y: number }[] = []
  for (let day = 0; day <= 30; day++) {
    const k = -Math.log(retention) / 14
    const v = Math.exp(-k * day)
    points.push({ x: day, y: v })
  }
  const w = 240
  const h = 80
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.x / 30) * w} ${h - p.y * h}`)
    .join(' ')
  const targetX = (14 / 30) * w
  const targetY = h - retention * h

  return (
    <svg viewBox={`0 0 ${w} ${h + 16}`} className="w-full h-20">
      <defs>
        <linearGradient id="curveFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#curveFill)" />
      <path d={path} fill="none" stroke="rgb(16 185 129)" strokeWidth="1.5" />
      <line
        x1={targetX} y1={0} x2={targetX} y2={h}
        stroke="rgb(251 191 36)" strokeWidth="1" strokeDasharray="3 3"
      />
      <circle cx={targetX} cy={targetY} r="3" fill="rgb(251 191 36)" />
      <text x={targetX + 4} y={targetY - 4} fontSize="9" fill="rgb(251 191 36)">
        {t('leafDetail.today')}
      </text>
      <line
        x1={0} y1={h - 0.7 * h} x2={w} y2={h - 0.7 * h}
        stroke="rgb(244 63 94)" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5"
      />
      <text x={w - 30} y={h - 0.7 * h - 2} fontSize="8" fill="rgb(244 63 94)" opacity="0.7">
        70%
      </text>
    </svg>
  )
}
