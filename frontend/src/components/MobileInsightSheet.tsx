import { useState } from 'react'
import { X, Layers, Sparkles } from 'lucide-react'

interface MobileInsightSheetProps {
  isOpen: boolean
  onClose: () => void
  t: (key: string, opts?: Record<string, unknown>) => string
  isNew: boolean
  dirty: boolean
}

export default function MobileInsightSheet({ isOpen, onClose, t, isNew, dirty }: MobileInsightSheetProps) {
  const [activeTab, setActiveTab] = useState<'engine' | 'leaves' | 'insights'>('leaves')

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 inset-x-0 z-40 md:hidden transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div
          className="bg-paper-50 dark:bg-ink-900 rounded-t-2xl border-t border-x border-paper-300/60 dark:border-ink-700/60 flex flex-col"
          style={{ maxHeight: '70vh' }}
        >
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-10 h-1 rounded-full bg-paper-300 dark:bg-ink-700" />
          </div>

          <div className="flex items-center gap-1 px-4 pb-3 border-b border-paper-300/40 dark:border-ink-700/40 shrink-0">
            {(['engine', 'leaves', 'insights'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
                  activeTab === tab
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {tab === 'engine'
                  ? t('notes.mobile.tabEngine')
                  : tab === 'leaves'
                    ? t('notes.mobile.tabLeaves')
                    : t('notes.mobile.tabInsights')}
              </button>
            ))}
            <button
              onClick={onClose}
              className="ml-auto p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
              aria-label={t('common.close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
            {activeTab === 'engine' && <EngineContent t={t} isNew={isNew} dirty={dirty} />}
            {activeTab === 'leaves' && <LeavesContent t={t} />}
            {activeTab === 'insights' && <InsightsContent t={t} isNew={isNew} />}
          </div>
        </div>
      </div>
    </>
  )
}

function EngineContent({
  t,
  isNew,
  dirty,
}: {
  t: (key: string, opts?: Record<string, unknown>) => string
  isNew: boolean
  dirty: boolean
}) {
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100 flex items-center gap-2 flex-wrap">
            {t('editor.engine.title')}
            {isNew ? (
              <span className="text-[10px] text-zinc-500 font-normal">
                · {t('editor.engine.waiting')}
              </span>
            ) : dirty ? (
              <span className="text-[10px] text-amber-500 font-normal">
                · {t('editor.engine.willRerun')}
              </span>
            ) : (
              <span className="text-[10px] text-emerald-500 font-normal">
                · {t('editor.engine.synced')}
              </span>
            )}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {isNew
              ? t('editor.engine.descriptionNew')
              : t('editor.engine.descriptionDone', { newCount: 0, matchCount: 0, linkedCount: 0 })}
          </div>
        </div>
      </div>
    </div>
  )
}

function LeavesContent({ t }: { t: (key: string, opts?: Record<string, unknown>) => string }) {
  return (
    <div className="text-center py-10">
      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
        <Layers className="w-6 h-6 text-emerald-500/60" />
      </div>
      <div className="text-[13px] text-zinc-600 dark:text-zinc-300 mb-1.5">
        {t('editor.leaves.emptyTitle')}
      </div>
      <div className="text-[11px] text-zinc-500 leading-relaxed max-w-[260px] mx-auto">
        {t('editor.leaves.emptyDescription')}
      </div>
    </div>
  )
}

function InsightsContent({
  t,
  isNew,
}: {
  t: (key: string) => string
  isNew: boolean
}) {
  if (isNew)
    return (
      <div className="text-center py-10 text-[12px] text-zinc-500">
        {t('editor.insights.empty')}
      </div>
    )
  return (
    <div className="flex items-start gap-2.5 py-4">
      <Sparkles className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
      <div className="text-[12px] text-zinc-500 leading-relaxed">{t('editor.insights.empty')}</div>
    </div>
  )
}
