import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Filter,
  TrendingUp,
  Brain,
  AlertTriangle,
  Flame,
  Sparkles,
  ArrowRight,
  Leaf,
} from 'lucide-react'
import LeafCard from '../components/LeafCard'
import LeafDetailModal from '../components/LeafDetailModal'
import { leaves, todayStats, conflicts } from '../data/mockData'
import type { Leaf as LeafType, SurfacingType } from '../data/mockData'

type FilterId = 'all' | SurfacingType

const FILTER_IDS: FilterId[] = ['all', 'forgetting', 'related', 'conflict', 'new']

export default function Dashboard() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterId>('all')
  const [selected, setSelected] = useState<LeafType | null>(null)

  const surfacing = leaves.filter((l) => l.surfacingType)
  const visible = surfacing.filter((l) =>
    filter === 'all' ? true : l.surfacingType === filter,
  )

  const filterLabel = (id: FilterId) =>
    id === 'all' ? t('dashboard.filter.all') : t(`leaf.surface.${id}`)

  return (
    <div className="px-8 py-8 max-w-[1500px] mx-auto">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-soft" />
          <span className="text-amber-400">Project: Triết học khoa học</span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-500">
            {t('dashboard.session', { minutes: todayStats.studyMinutes })}
          </span>
        </div>
        <h1 className="font-serif text-[44px] leading-tight font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t('dashboard.heading')}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
          {t('dashboard.subheading', { count: surfacing.length })}
        </p>
      </div>

      {surfacing.length === 0 ? (
        <EmptyMain t={t} />
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Main feed */}
          <div className="col-span-12 lg:col-span-9">
            {/* Filter pills */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
              <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              {FILTER_IDS.map((id) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`pill border whitespace-nowrap transition ${
                    filter === id
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 border-emerald-500/40'
                      : 'border-paper-300 dark:border-ink-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-paper-400 dark:hover:border-ink-600'
                  }`}
                >
                  {filterLabel(id)}
                  {id !== 'all' && (
                    <span className="ml-1 text-[10px] text-zinc-500">
                      {surfacing.filter((l) => l.surfacingType === id).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Leaves grid */}
            {visible.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visible.map((leaf) => (
                  <LeafCard
                    key={leaf.id}
                    leaf={leaf}
                    onClick={() => setSelected(leaf)}
                  />
                ))}
              </div>
            ) : (
              <div className="card-surface p-12 text-center">
                <p className="text-zinc-500 text-sm">{t('dashboard.emptyFilter')}</p>
              </div>
            )}
          </div>

          {/* Right rail */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <SidePanel title={t('dashboard.panels.today')} icon={Brain}>
              <Stat
                label={t('dashboard.stats.needReview')}
                value={`${todayStats.needReview} ${t('dashboard.stats.leafUnit')}`}
                highlight
              />
              <Stat
                label={t('dashboard.stats.reviewed')}
                value={`${todayStats.reviewed} ${t('dashboard.stats.leafUnit')}`}
              />
              <Stat
                label={t('dashboard.stats.newLeaves')}
                value={`${todayStats.newLeaves} ${t('dashboard.stats.leafUnit')}`}
              />
              <Stat
                label={t('dashboard.stats.studyTime')}
                value={t('dashboard.stats.studyTimeValue', { minutes: todayStats.studyMinutes })}
              />
              <div className="mt-3 pt-3 border-t border-paper-300/60 dark:border-ink-700/60 flex items-center gap-2 text-[11px]">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-zinc-400">Streak</span>
                <span className="ml-auto text-orange-300 font-medium">
                  {t('dashboard.stats.streakValue', { days: todayStats.streakDays })}
                </span>
              </div>
            </SidePanel>

            <SidePanel title={t('dashboard.panels.retentionHealth')} icon={TrendingUp}>
              <RetentionDist leafUnit={t('dashboard.stats.leafUnit')} />
            </SidePanel>

            <SidePanel title={t('dashboard.panels.conflicts')} icon={AlertTriangle} accent="rose">
              {conflicts.map((c) => (
                <button
                  key={c.id}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 transition group"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                        c.severity === 'medium' ? 'bg-rose-400' : 'bg-amber-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-zinc-700 dark:text-zinc-200 leading-snug">
                        {c.summary}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{c.detail}</p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 mt-1 shrink-0" />
                  </div>
                </button>
              ))}
            </SidePanel>

            <SidePanel title={t('dashboard.panels.suggestions')} icon={Sparkles} accent="emerald">
              <div className="text-[12px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {t('dashboard.suggestion.text')}{' '}
                <span className="text-emerald-600 dark:text-emerald-300 font-medium">
                  incommensurability
                </span>
                {t('dashboard.suggestion.textSuffix')}
              </div>
              <button className="mt-2 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium">
                {t('dashboard.suggestion.viewContext')}
              </button>
            </SidePanel>
          </div>
        </div>
      )}

      {selected && (
        <LeafDetailModal leaf={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

// ── Empty state (no surfacing leaves at all) ──────────────────────────────────

function EmptyMain({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5">
        <Leaf className="w-8 h-8 text-emerald-500/60" />
      </div>
      <h2 className="font-serif text-xl text-zinc-700 dark:text-zinc-200 mb-2">
        {t('empty.noLeaves.title')}
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
        {t('empty.noLeaves.description')}
      </p>
      <button className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition shadow-lg shadow-emerald-500/20">
        {t('empty.noLeaves.cta')}
      </button>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface SidePanelProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  accent?: 'rose' | 'emerald'
  children: React.ReactNode
}

function SidePanel({ title, icon: Icon, accent, children }: SidePanelProps) {
  const accentColor =
    accent === 'rose'
      ? 'text-rose-500 dark:text-rose-400'
      : accent === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-zinc-500 dark:text-zinc-400'
  return (
    <div className="card-surface p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-3.5 h-3.5 ${accentColor}`} />
        <h3 className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
          {title}
        </h3>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

interface StatProps {
  label: string
  value: string
  highlight?: boolean
}

function Stat({ label, value, highlight = false }: StatProps) {
  return (
    <div className="flex justify-between items-baseline text-[12px]">
      <span className="text-zinc-500">{label}</span>
      <span
        className={`font-medium ${
          highlight ? 'text-emerald-600 dark:text-emerald-300' : 'text-zinc-700 dark:text-zinc-200'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function RetentionDist({ leafUnit }: { leafUnit: string }) {
  const buckets = [
    { label: '> 80%', value: 42, color: 'bg-emerald-400' },
    { label: '60—80%', value: 58, color: 'bg-teal-400' },
    { label: '40—60%', value: 28, color: 'bg-amber-400' },
    { label: '< 40%', value: 14, color: 'bg-rose-400' },
  ]
  const total = buckets.reduce((s, b) => s + b.value, 0)
  return (
    <div className="space-y-2">
      <div className="h-2 rounded-full overflow-hidden flex bg-paper-300 dark:bg-ink-700">
        {buckets.map((b) => (
          <div
            key={b.label}
            className={b.color}
            style={{ width: `${(b.value / total) * 100}%` }}
            title={`${b.label}: ${b.value} ${leafUnit}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        {buckets.map((b) => (
          <div key={b.label} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${b.color}`} />
            <span className="text-zinc-500">{b.label}</span>
            <span className="ml-auto text-zinc-600 dark:text-zinc-300 font-medium tabular-nums">
              {b.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
