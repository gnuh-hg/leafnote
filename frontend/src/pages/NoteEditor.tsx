import { useState, useMemo, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Leaf,
  Sparkles,
  Plus,
  AlertTriangle,
  GitMerge,
  Link2,
  CheckCircle2,
  CircleDashed,
  Layers,
  Eye,
  Pencil,
  Cpu,
  User,
  Edit2,
  Trash2,
  Split,
  Wand2,
  RefreshCw,
  X,
  Tag as TagIcon,
  Mic,
  Image as ImageIcon,
  Square,
  Check,
} from 'lucide-react'
import { decompositionDemo, notes as allNotes } from '../data/mockData'
import type { DecompositionDemo, DetectedLeaf, BodyBlock } from '../data/mockData'
import { TYPE_STYLES } from '../components/LeafCard'
import { useAppState } from '../context/AppState'

export default function NoteEditor() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const [searchParams, setSearchParams] = useSearchParams()
  const initialInput = searchParams.get('input')
  const isFresh = searchParams.get('fresh') === '1'

  const { tags } = useAppState()

  const note = decompositionDemo
  const sourceNote = isNew
    ? null
    : allNotes.find((n) => n.id === id) ??
      allNotes.find((n) => n.id === note.noteId)

  const plainBody = note.body
    .map((b) => b.segments.map((s) => s.text).join(''))
    .join('\n\n')

  const [activeLeaf, setActiveLeaf] = useState<string | null>(null)
  const [mode, setMode] = useState<'read' | 'edit'>(isNew ? 'edit' : 'read')
  const [dirty, setDirty] = useState(false)
  const [draft, setDraft] = useState(isNew ? '' : plainBody)
  const [title, setTitle] = useState(isNew ? '' : note.title)
  const [showFreshBanner, setShowFreshBanner] = useState(isFresh)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    sourceNote?.tagIds ? [...sourceNote.tagIds] : [],
  )
  const [tagPickerOpen, setTagPickerOpen] = useState(false)
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'done'>(
    initialInput === 'voice' ? 'recording' : 'idle',
  )
  const [imagePanelOpen, setImagePanelOpen] = useState(initialInput === 'image')

  useEffect(() => {
    if (initialInput) {
      const next = new URLSearchParams(searchParams)
      next.delete('input')
      setSearchParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tagById = (tid: string) => tags.find((tg) => tg.id === tid)
  const selectedTags = useMemo(
    () => selectedTagIds.map(tagById).filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedTagIds, tags],
  )

  const toggleTag = (tid: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tid) ? prev.filter((x) => x !== tid) : [...prev, tid],
    )
    setDirty(true)
  }

  const handleSave = () => {
    setDirty(false)
    if (isNew) {
      navigate(`/note/${note.noteId}?fresh=1`)
    }
  }

  return (
    <div className="px-8 py-8 max-w-[1500px] mx-auto">
      {showFreshBanner && (
        <div className="mb-5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-3.5 flex items-start gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-300 animate-pulse-soft" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-emerald-900 dark:text-emerald-100 mb-0.5">
              {t('editor.freshBanner.title', { count: note.detectedLeaves.length })}
            </div>
            <div className="text-[11.5px] text-zinc-400">
              {t('editor.freshBanner.description')}
            </div>
          </div>
          <button
            onClick={() => {
              setShowFreshBanner(false)
              const next = new URLSearchParams(searchParams)
              next.delete('fresh')
              setSearchParams(next, { replace: true })
            }}
            className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-paper-200 dark:hover:bg-ink-800 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="min-w-0 flex-1">
          {/* Meta row */}
          <div className="flex items-center gap-2 text-xs mb-2 flex-wrap">
            {!isNew && (
              <>
                <span className="text-zinc-500">{t('editor.savedAt', { time: '14:32' })}</span>
                <span className="text-zinc-700">·</span>
                <span className="text-zinc-500 flex items-center gap-1">
                  <Leaf className="w-3 h-3" />
                  {t('editor.leafCount', { count: note.detectedLeaves.length })}
                </span>
              </>
            )}
            {isNew && (
              <span className="text-emerald-300 flex items-center gap-1">
                <Plus className="w-3 h-3" />
                {t('editor.newNote')}
              </span>
            )}
            {dirty && !isNew && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="text-amber-300 flex items-center gap-1 animate-pulse-soft">
                  <RefreshCw className="w-3 h-3" />
                  {t('editor.unsaved')}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          {mode === 'read' ? (
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title || <span className="text-zinc-400">{t('editor.untitled')}</span>}
            </h1>
          ) : (
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setDirty(true)
              }}
              autoFocus={isNew && !initialInput}
              placeholder={isNew ? t('editor.titlePlaceholderNew') : t('editor.titlePlaceholder')}
              className="font-serif text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 bg-transparent w-full focus:outline-none border-b border-dashed border-paper-300 dark:border-ink-700/60 focus:border-emerald-500/40 pb-1 placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
            />
          )}

          {/* Tag chips row */}
          <div className="mt-3 flex items-center gap-1.5 flex-wrap relative">
            {selectedTags.map((tg) => {
              if (!tg) return null
              return (
                <span
                  key={tg.id}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11.5px] bg-paper-100 dark:bg-ink-850 border border-paper-300/40 dark:border-ink-700/40 text-zinc-700 dark:text-zinc-200"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${tg.dot}`} />
                  <span className="text-zinc-500">#</span>
                  {tg.name}
                  <button
                    onClick={() => toggleTag(tg.id)}
                    className="ml-0.5 text-zinc-600 hover:text-rose-300"
                    title={t('editor.removeTag')}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )
            })}
            <button
              onClick={() => setTagPickerOpen((v) => !v)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11.5px] border border-dashed border-paper-300/60 dark:border-ink-700/60 text-zinc-500 hover:text-emerald-600 hover:border-emerald-500/40 transition"
            >
              <TagIcon className="w-2.5 h-2.5" />
              {selectedTags.length === 0 ? t('editor.addTag') : t('editor.editTag')}
            </button>

            {tagPickerOpen && (
              <div className="absolute left-0 top-full mt-1 z-30 card-surface bg-paper-50 dark:bg-ink-900 shadow-2xl py-1 w-72 max-h-72 overflow-y-auto animate-fade-in">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-500 font-medium border-b border-paper-300/60 dark:border-ink-700/60 flex items-center justify-between">
                  <span>{t('editor.tagPicker.title')}</span>
                  <button
                    onClick={() => setTagPickerOpen(false)}
                    className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {tags.map((tg) => {
                  const isSelected = selectedTagIds.includes(tg.id)
                  return (
                    <button
                      key={tg.id}
                      onClick={() => toggleTag(tg.id)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-[12.5px] transition ${
                        isSelected
                          ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-100'
                          : 'text-zinc-600 dark:text-zinc-300 hover:bg-paper-100 dark:hover:bg-ink-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full ${tg.dot} shrink-0`} />
                        <span className="truncate">
                          <span className="text-zinc-600">#</span>
                          {tg.name}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-300" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isNew && (
            <div className="flex p-0.5 rounded-lg bg-paper-200 dark:bg-ink-850 border border-paper-300/60 dark:border-ink-700/60">
              <button
                onClick={() => setMode('read')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition ${
                  mode === 'read'
                    ? 'bg-paper-300 dark:bg-ink-800 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <Eye className="w-3 h-3" />
                {t('editor.mode.read')}
              </button>
              <button
                onClick={() => setMode('edit')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition ${
                  mode === 'edit'
                    ? 'bg-paper-300 dark:bg-ink-800 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <Pencil className="w-3 h-3" />
                {t('editor.mode.edit')}
              </button>
            </div>
          )}
          {!isNew && (
            <button className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-paper-200 dark:hover:bg-ink-850 transition">
              {t('editor.viewGraph')}
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg text-xs bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <RefreshCw className="w-3 h-3" />
            {isNew ? t('editor.save') : t('editor.saveAgain')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Note body */}
        <div className="col-span-12 lg:col-span-7 card-surface p-8 bg-paper-50/60 dark:bg-ink-900/40">
          {mode === 'edit' && (
            <InputToolbar
              onVoice={() => setVoiceState('recording')}
              onImage={() => setImagePanelOpen(true)}
            />
          )}

          {mode === 'edit' && voiceState !== 'idle' && (
            <VoicePanel
              state={voiceState}
              setState={setVoiceState}
              onTranscript={(text: string) => {
                setDraft((prev) => (prev ? prev + '\n\n' + text : text))
                setDirty(true)
                setVoiceState('idle')
              }}
            />
          )}

          {mode === 'edit' && imagePanelOpen && (
            <ImagePanel onClose={() => setImagePanelOpen(false)} />
          )}

          {mode === 'read' ? (
            <ReadBody note={note} activeLeaf={activeLeaf} setActiveLeaf={setActiveLeaf} />
          ) : (
            <EditBody
              draft={draft}
              setDraft={(v: string) => {
                setDraft(v)
                setDirty(true)
              }}
              isNew={isNew}
            />
          )}

          {!isNew && (
            <div className="mt-8 pt-5 border-t border-paper-300/40 dark:border-ink-700/40 flex items-center gap-4 text-[10px] text-zinc-500 flex-wrap">
              <span className="uppercase tracking-wider font-medium">
                {mode === 'read' ? t('editor.legend.readMode') : t('editor.legend.editMode')}
              </span>
              <Legend color="rgba(129, 140, 248, 0.4)" label={t('leaf.type.definition')} />
              <Legend color="rgba(251, 191, 36, 0.4)" label={t('leaf.type.proposition')} />
              <Legend color="rgba(52, 211, 153, 0.4)" label={t('leaf.type.relation')} />
              <Legend color="rgba(56, 189, 248, 0.4)" label={t('leaf.type.fact')} />
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {/* Engine status */}
          <div className="card-surface p-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                  {t('editor.engine.title')}
                  {isNew ? (
                    <span className="text-[10px] text-zinc-500 font-normal">
                      · {t('editor.engine.waiting')}
                    </span>
                  ) : dirty ? (
                    <span className="text-[10px] text-amber-300 font-normal">
                      · {t('editor.engine.willRerun')}
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-normal">
                      · {t('editor.engine.synced')}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-500">
                  {isNew
                    ? t('editor.engine.descriptionNew')
                    : t('editor.engine.descriptionDone', { newCount: 2, matchCount: 2, linkedCount: 1 })}
                </div>
              </div>
            </div>
          </div>

          {/* Detected leaves */}
          {!isNew && (
            <div className="card-surface p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                    {t('editor.leaves.title', { count: note.detectedLeaves.length })}
                  </h3>
                  <AiTag>{t('editor.leaves.aiReview')}</AiTag>
                </div>
                <button className="text-[11px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                  {t('editor.leaves.showAll')}
                </button>
              </div>
              <div className="space-y-2">
                {note.detectedLeaves.map((leaf) => (
                  <LeafRow
                    key={leaf.id}
                    leaf={leaf}
                    isActive={activeLeaf === leaf.id}
                    onHover={setActiveLeaf}
                  />
                ))}
              </div>
              <button className="w-full mt-3 py-2 rounded-lg border border-dashed border-paper-300 dark:border-ink-700 text-[12px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-paper-400 dark:hover:border-ink-600 transition flex items-center justify-center gap-1.5">
                <Plus className="w-3 h-3" />
                {t('editor.leaves.addManual')}
                <ManualTag />
              </button>
            </div>
          )}

          {/* Empty state for new note */}
          {isNew && (
            <div className="card-surface p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-paper-200 dark:bg-ink-850 flex items-center justify-center mx-auto mb-2">
                <Leaf className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-[13px] text-zinc-600 dark:text-zinc-300 mb-1">
                {t('editor.leaves.emptyTitle')}
              </div>
              <div className="text-[11px] text-zinc-500 leading-relaxed">
                {t('editor.leaves.emptyDescription')}
              </div>
            </div>
          )}

          {/* Insights */}
          {!isNew && (
            <div className="card-surface p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <h3 className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                  {t('editor.insights.title')}
                </h3>
                <AiTag />
              </div>
              <div className="space-y-2.5">
                {note.insights.map((ins, i) => {
                  const cfg = {
                    related: { Icon: Link2, color: 'text-sky-600 dark:text-sky-300' },
                    gap: { Icon: CircleDashed, color: 'text-emerald-600 dark:text-emerald-300' },
                    conflict: { Icon: AlertTriangle, color: 'text-rose-600 dark:text-rose-300' },
                  }[ins.kind] ?? { Icon: Link2, color: 'text-sky-600 dark:text-sky-300' }
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <cfg.Icon className={`w-3.5 h-3.5 ${cfg.color} mt-0.5 shrink-0`} />
                      <p className="text-[12px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {ins.text}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Input toolbar (edit mode) ─────────────────────────────────────────────── */

function InputToolbar({ onVoice, onImage }: { onVoice: () => void; onImage: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-paper-300/40 dark:border-ink-700/40">
      <div className="flex items-center gap-1">
        <ToolbarBtn icon={Mic} label={t('editor.toolbar.record')} onClick={onVoice} />
        <ToolbarBtn icon={ImageIcon} label={t('editor.toolbar.image')} onClick={onImage} />
        <ToolbarBtn icon={Wand2} label={t('editor.toolbar.aiTitle')} />
      </div>
      <div className="text-[10.5px] text-zinc-500 flex items-center gap-1.5">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        {t('editor.toolbar.autosave')}
      </div>
    </div>
  )
}

function ToolbarBtn({ icon: Icon, label, onClick }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11.5px] text-zinc-500 hover:text-emerald-600 hover:bg-paper-200 dark:hover:bg-ink-850 transition"
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  )
}

/* ── Voice quick panel ─────────────────────────────────────────────────────── */

function VoicePanel({ state, setState, onTranscript }: {
  state: 'recording' | 'done'
  setState: (s: 'idle' | 'recording' | 'done') => void
  onTranscript: (text: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
      <div className="flex items-center gap-3">
        {state === 'recording' ? (
          <button
            onClick={() => setState('done')}
            className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30 animate-pulse-soft hover:scale-105 transition shrink-0"
          >
            <Square className="w-4 h-4 text-white fill-white" />
          </button>
        ) : (
          <div className="w-12 h-12 rounded-full bg-paper-200 dark:bg-ink-800 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {state === 'recording' && (
            <>
              <div className="flex items-center gap-1 h-5 mb-1">
                {Array.from({ length: 22 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-rose-400 rounded-full animate-pulse-soft"
                    style={{
                      height: `${8 + Math.sin(i * 0.7) * 7 + Math.random() * 5}px`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
              <div className="text-[12px] text-rose-300 font-medium tabular-nums">
                00:42 · {t('editor.voice.recording')}
              </div>
            </>
          )}
          {state === 'done' && (
            <>
              <div className="text-[12.5px] text-zinc-700 dark:text-zinc-200 font-medium mb-0.5">
                {t('editor.voice.done')}
              </div>
              <div className="text-[10.5px] text-zinc-500">
                {t('editor.voice.insertHint')}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {state === 'done' && (
            <button
              onClick={() =>
                onTranscript(
                  '[Voice transcript] — Trong tác phẩm The Structure of Scientific Revolutions, Kuhn lập luận rằng khoa học không tiến hoá tuyến tính...',
                )
              }
              className="px-2.5 py-1 rounded-md text-[11px] bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition"
            >
              {t('editor.voice.insert')}
            </button>
          )}
          <button
            onClick={() => setState('idle')}
            className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-paper-200 dark:hover:bg-ink-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Image quick panel ─────────────────────────────────────────────────────── */

function ImagePanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[12px] font-medium text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
          {t('editor.image.title')}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-paper-200 dark:hover:bg-ink-800"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="rounded-lg border-2 border-dashed border-paper-300 dark:border-ink-700 hover:border-emerald-500/40 transition p-4 text-center cursor-pointer bg-paper-100/40 dark:bg-ink-850/40">
        <Plus className="w-4 h-4 text-zinc-400 mx-auto mb-1.5" />
        <p className="text-[12px] text-zinc-600 dark:text-zinc-300">{t('editor.image.dropHint')}</p>
        <p className="text-[10.5px] text-zinc-500 mt-0.5">{t('editor.image.formats')}</p>
      </div>
    </div>
  )
}

/* ── Body modes ────────────────────────────────────────────────────────────── */

function ReadBody({ note, activeLeaf, setActiveLeaf }: {
  note: DecompositionDemo
  activeLeaf: string | null
  setActiveLeaf: (id: string | null) => void
}) {
  return (
    <div className="max-w-none">
      {note.body.map((block, i) => (
        <p
          key={i}
          className="text-[16px] leading-[1.85] text-zinc-700 dark:text-zinc-200 font-serif mb-5 last:mb-0"
        >
          {block.segments.map((seg, j) => {
            if (seg.leafId) {
              const isActive = activeLeaf === seg.leafId
              return (
                <span
                  key={j}
                  className={`leaf-highlight type-${seg.leafType} ${isActive ? 'active' : ''}`}
                  onMouseEnter={() => setActiveLeaf(seg.leafId!)}
                  onMouseLeave={() => setActiveLeaf(null)}
                >
                  {seg.text}
                </span>
              )
            }
            if (seg.italic) {
              return (
                <em key={j} className="text-zinc-600 dark:text-zinc-300">
                  {seg.text}
                </em>
              )
            }
            return <span key={j}>{seg.text}</span>
          })}
        </p>
      ))}
    </div>
  )
}

function EditBody({ draft, setDraft, isNew }: {
  draft: string
  setDraft: (v: string) => void
  isNew: boolean
}) {
  const { t } = useTranslation()
  return (
    <div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoFocus={!isNew}
        rows={isNew ? 14 : 18}
        placeholder={isNew ? t('editor.placeholder') : ''}
        className="w-full bg-transparent text-[16px] leading-[1.85] font-serif text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none resize-none"
      />
      {!isNew && (
        <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2.5">
          <Wand2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300 mt-0.5 shrink-0" />
          <div className="text-[11.5px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <span className="text-emerald-700 dark:text-emerald-200 font-medium">
              {t('editor.editHint.prefix')}
            </span>
            {', '}
            {t('editor.editHint.body')}{' '}
            <span className="text-zinc-800 dark:text-zinc-100">
              &quot;{t('editor.editHint.deleteProposal')}&quot;
            </span>{' '}
            {t('editor.editHint.suffix')}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Leaf row with manual actions ──────────────────────────────────────────── */

function LeafRow({ leaf, isActive, onHover }: {
  leaf: DetectedLeaf
  isActive: boolean
  onHover: (id: string | null) => void
}) {
  const { t } = useTranslation()
  const T = TYPE_STYLES[leaf.type] ?? TYPE_STYLES.definition
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(leaf.content)

  return (
    <div
      onMouseEnter={() => onHover(leaf.id)}
      onMouseLeave={() => onHover(null)}
      className={`group rounded-lg border transition ${
        isActive
          ? 'bg-paper-200 dark:bg-ink-800 border-emerald-500/40'
          : 'bg-paper-100/50 dark:bg-ink-850/50 border-paper-300/40 dark:border-ink-700/40 hover:bg-paper-200 dark:hover:bg-ink-800'
      }`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className={`pill border ${T.color}`}>
              <T.icon className="w-2.5 h-2.5" />
              {t(T.label)}
            </span>
            <StatusBadge status={leaf.status} />
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            {t('editor.leafRow.confidence', { pct: Math.round(leaf.confidence * 100) })}
          </span>
        </div>

        {editing ? (
          <textarea
            value={content}
            autoFocus
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full bg-paper-50 dark:bg-ink-900 border border-emerald-500/40 rounded p-2 text-[13px] text-zinc-900 dark:text-zinc-100 font-serif leading-relaxed focus:outline-none resize-none"
          />
        ) : (
          <p className="text-[13px] text-zinc-700 dark:text-zinc-200 leading-relaxed font-serif">
            {content}
          </p>
        )}

        <div className="mt-2 pt-2 border-t border-paper-300/30 dark:border-ink-700/30 flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition">
          {editing ? (
            <>
              <RowAction
                icon={CheckCircle2}
                label={t('editor.leafRow.save')}
                tone="emerald"
                onClick={() => setEditing(false)}
              />
              <RowAction
                icon={Trash2}
                label={t('editor.leafRow.cancel')}
                onClick={() => {
                  setContent(leaf.content)
                  setEditing(false)
                }}
              />
            </>
          ) : (
            <>
              <RowAction icon={Edit2} label={t('editor.leafRow.edit')} onClick={() => setEditing(true)} />
              <RowAction icon={Split} label={t('editor.leafRow.split')} />
              <RowAction icon={GitMerge} label={t('editor.leafRow.merge')} />
              <RowAction icon={Trash2} label={t('editor.leafRow.discard')} tone="rose" />
              <div className="flex-1" />
              <ManualTag />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function RowAction({ icon: Icon, label, tone, onClick }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  tone?: 'emerald' | 'rose'
  onClick?: () => void
}) {
  const tones = {
    emerald: 'text-emerald-400 hover:bg-emerald-500/10',
    rose: 'text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10',
  }
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-1.5 py-1 rounded text-[10.5px] transition ${
        (tone && tones[tone]) || 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-paper-200 dark:hover:bg-ink-800'
      }`}
    >
      <Icon className="w-2.5 h-2.5" />
      {label}
    </button>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-3 h-2 rounded-sm" style={{ background: color }} />
      <span className="text-zinc-400">{label}</span>
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  const cfg = {
    new: { label: t('editor.status.new'), color: 'text-emerald-300 bg-emerald-500/10', Icon: Plus },
    existing: { label: t('editor.status.existing'), color: 'text-zinc-400 bg-zinc-500/10', Icon: CheckCircle2 },
    linked: { label: t('editor.status.linked'), color: 'text-sky-300 bg-sky-500/10', Icon: Link2 },
  }[status]
  if (!cfg) return null
  return (
    <span className={`pill ${cfg.color}`}>
      <cfg.Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  )
}

function AiTag({ children }: { children?: React.ReactNode }) {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
      <Cpu className="w-2.5 h-2.5" />
      {children ?? t('editor.tag.ai')}
    </span>
  )
}

function ManualTag() {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
      <User className="w-2.5 h-2.5" />
      {t('editor.tag.manual')}
    </span>
  )
}
