import { useTranslation } from 'react-i18next'
import { TrendingUp, Brain, Activity, Calendar, Layers, Flame } from 'lucide-react'
import { cognitiveProfile, forgettingCurveData, topicHeatmap } from '../data/mockData'

export default function Insights() {
  const { t } = useTranslation()

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-[1500px] mx-auto">
      <div className="mb-8">
        <div className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
          <Brain className="w-3 h-3" />
          {t('insights.subheading', { reviews: cognitiveProfile.totalReviews })}
        </div>
        <h1 className="font-serif text-3xl sm:text-[44px] leading-tight font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t('sidebar.nav.insights')}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">{t('insights.description')}</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <BigStat
          icon={Layers}
          label={t('insights.stats.totalLeaves')}
          value={cognitiveProfile.totalLeaves}
          unit={t('insights.stats.leafUnit')}
        />
        <BigStat
          icon={Activity}
          label={t('insights.stats.avgRetention')}
          value={`${Math.round(cognitiveProfile.avgRetention * 100)}%`}
          accent="emerald"
        />
        <BigStat
          icon={Flame}
          label={t('insights.stats.streak')}
          value={cognitiveProfile.streak}
          unit={t('insights.stats.dayUnit')}
          accent="amber"
        />
        <BigStat
          icon={Calendar}
          label={t('insights.stats.totalReviews')}
          value={cognitiveProfile.totalReviews.toLocaleString('vi-VN')}
        />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Forgetting curve */}
        <div className="col-span-12 lg:col-span-7 card-surface p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <h3 className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                  {t('insights.forgettingCurve.title')}
                </h3>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                {t('insights.forgettingCurve.description', { pct: 22 })}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <Legend color="#10b981" label={t('insights.forgettingCurve.legendYou')} />
              <Legend color="#3d3d4f" label={t('insights.forgettingCurve.legendFsrs')} dashed />
            </div>
          </div>
          <ForgettingChart />
        </div>

        {/* Cognitive traits */}
        <div className="col-span-12 lg:col-span-5 card-surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-3.5 h-3.5 text-violet-400" />
            <h3 className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
              {t('insights.traits.title')}
            </h3>
          </div>
          <div className="space-y-4">
            {cognitiveProfile.traits.map((trait, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[12px] text-zinc-500">{trait.label}</span>
                  <span className="text-sm text-emerald-600 dark:text-emerald-300 font-medium">
                    {trait.value}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{trait.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Topic heatmap */}
        <div className="col-span-12 card-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <h3 className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                  {t('insights.heatmap.title')}
                </h3>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                {t('insights.heatmap.description')}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <Heatmap />
            </div>
          </div>
        </div>

        {/* Behavioral signals */}
        <div className="col-span-12 lg:col-span-6 card-surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <h3 className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
              {t('insights.signals.title')}
            </h3>
          </div>
          <div className="space-y-3">
            <Signal label={t('insights.signals.activeRecall')} detail={t('insights.signals.activeRecallDetail')} strength={0.92} />
            <Signal label={t('insights.signals.openRate')} detail={t('insights.signals.openRateDetail')} strength={0.78} />
            <Signal label={t('insights.signals.sessionContext')} detail={t('insights.signals.sessionContextDetail')} strength={0.64} />
            <Signal label={t('insights.signals.pauseTime')} detail={t('insights.signals.pauseTimeDetail')} strength={0.41} />
            <Signal label={t('insights.signals.questionFormat')} detail={t('insights.signals.questionFormatDetail')} strength={0.55} />
          </div>
        </div>

        {/* Adaptations */}
        <div className="col-span-12 lg:col-span-6 card-surface p-6 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-300 font-medium">
              {t('insights.adaptations.title')}
            </h3>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-200">
            <Adapt>{t('insights.adaptations.interval')}</Adapt>
            <Adapt>{t('insights.adaptations.format')}</Adapt>
            <Adapt>{t('insights.adaptations.granularity')}</Adapt>
            <Adapt>{t('insights.adaptations.surfacing')}</Adapt>
          </div>
        </div>
      </div>
    </div>
  )
}

interface BigStatProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  unit?: string
  accent?: 'emerald' | 'amber'
}

function BigStat({ icon: Icon, label, value, unit, accent }: BigStatProps) {
  const accentMap: Record<string, string> = {
    emerald: 'text-emerald-600 dark:text-emerald-300',
    amber: 'text-amber-600 dark:text-amber-300',
  }
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-2">
        <Icon className="w-3 h-3" />
        <span className="uppercase tracking-wider font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-serif text-3xl font-semibold tabular-nums ${
            accent ? accentMap[accent] : 'text-zinc-800 dark:text-zinc-100'
          }`}
        >
          {value}
        </span>
        {unit && <span className="text-xs text-zinc-500">{unit}</span>}
      </div>
    </div>
  )
}

interface LegendProps {
  color: string
  label: string
  dashed?: boolean
}

function Legend({ color, label, dashed }: LegendProps) {
  return (
    <span className="flex items-center gap-1.5 text-zinc-500">
      <svg width="20" height="2">
        <line
          x1="0"
          y1="1"
          x2="20"
          y2="1"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashed ? '3 2' : '0'}
        />
      </svg>
      {label}
    </span>
  )
}

function ForgettingChart() {
  const { t } = useTranslation()
  const w = 700
  const h = 220
  const pad = { l: 40, r: 16, t: 12, b: 28 }
  const data = forgettingCurveData
  const xScale = (d: number) => pad.l + ((d - 1) / 29) * (w - pad.l - pad.r)
  const yScale = (v: number) => pad.t + (1 - v) * (h - pad.t - pad.b)

  const userPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.day)} ${yScale(d.user)}`)
    .join(' ')
  const fsrsPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.day)} ${yScale(d.fsrs)}`)
    .join(' ')
  const userArea = `${userPath} L ${xScale(30)} ${h - pad.b} L ${pad.l} ${h - pad.b} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-56">
      <defs>
        <linearGradient id="userFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(129 140 248)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="rgb(129 140 248)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v}>
          <line
            x1={pad.l}
            y1={yScale(v)}
            x2={w - pad.r}
            y2={yScale(v)}
            stroke="#252532"
            strokeWidth="0.5"
          />
          <text x={pad.l - 6} y={yScale(v) + 3} textAnchor="end" fontSize="9" fill="#60606a">
            {Math.round(v * 100)}%
          </text>
        </g>
      ))}
      {[1, 7, 14, 21, 30].map((d) => (
        <text key={d} x={xScale(d)} y={h - 10} textAnchor="middle" fontSize="9" fill="#60606a">
          {d === 1 ? t('insights.forgettingCurve.today') : `${d}d`}
        </text>
      ))}
      <line
        x1={pad.l}
        y1={yScale(0.7)}
        x2={w - pad.r}
        y2={yScale(0.7)}
        stroke="rgb(244 63 94)"
        strokeDasharray="2 4"
        strokeWidth="0.8"
        opacity="0.6"
      />
      <text
        x={w - pad.r - 4}
        y={yScale(0.7) - 3}
        textAnchor="end"
        fontSize="9"
        fill="rgb(244 63 94)"
        opacity="0.8"
      >
        {t('insights.forgettingCurve.threshold')}
      </text>
      <path d={fsrsPath} fill="none" stroke="#3d3d4f" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d={userArea} fill="url(#userFill)" />
      <path d={userPath} fill="none" stroke="rgb(129 140 248)" strokeWidth="2" />
    </svg>
  )
}

function Heatmap() {
  const { t } = useTranslation()
  return (
    <div className="space-y-1.5">
      <div className="flex items-center text-[10px] text-zinc-500 ml-32">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 text-center">
            T{i + 1}
          </div>
        ))}
      </div>
      {topicHeatmap.map((row) => (
        <div key={row.project} className="flex items-center gap-2">
          <div className="w-32 text-[12px] text-zinc-600 dark:text-zinc-300 truncate">
            {row.project}
          </div>
          <div className="flex-1 flex gap-1">
            {row.weeks.map((v, i) => (
              <div
                key={i}
                className="flex-1 h-6 rounded-sm transition hover:scale-110"
                style={{ background: heatColor(v) }}
                title={t('insights.heatmap.weekLabel', {
                  week: i + 1,
                  pct: Math.round(v * 100),
                })}
              />
            ))}
          </div>
          <div className="w-12 text-right text-[10px] text-zinc-500 tabular-nums">
            {Math.round(row.weeks[row.weeks.length - 1] * 100)}%
          </div>
        </div>
      ))}
    </div>
  )
}

function heatColor(v: number): string {
  if (v < 0.1) return '#1c1c28'
  if (v < 0.3) return 'rgba(129, 140, 248, 0.15)'
  if (v < 0.5) return 'rgba(129, 140, 248, 0.35)'
  if (v < 0.7) return 'rgba(168, 85, 247, 0.5)'
  if (v < 0.85) return 'rgba(217, 70, 239, 0.65)'
  return 'rgba(251, 113, 133, 0.85)'
}

interface SignalProps {
  label: string
  detail: string
  strength: number
}

function Signal({ label, detail, strength }: SignalProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] text-zinc-700 dark:text-zinc-200">{label}</span>
        <span className="text-[10px] text-zinc-500 tabular-nums">
          {Math.round(strength * 100)}%
        </span>
      </div>
      <div className="h-1 rounded-full bg-paper-300 dark:bg-ink-700 overflow-hidden mb-1">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
          style={{ width: `${strength * 100}%` }}
        />
      </div>
      <p className="text-[11px] text-zinc-500">{detail}</p>
    </div>
  )
}

function Adapt({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
      <p>{children}</p>
    </div>
  )
}
