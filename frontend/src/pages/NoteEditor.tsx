import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import {
  RefreshCw,
  X,
  Tag as TagIcon,
  Check,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Loader2,
  Eye,
  Pencil,
  Layers,
  Plus,
  Sparkles,
  Image as ImageIcon,
  Square,
} from 'lucide-react'
import PlainEditor from '../components/editor/PlainEditor'
import MobileInsightSheet from '../components/MobileInsightSheet'
import { LiveEnginePanel, LiveLeavesPanel } from '../components/LeavesPanelLive'
import { useTags } from '../hooks/useTags'
import { COLOR_DOT, type TagOut } from '../services/tags'
import type { DocumentType } from '../services/notes'
import {
  useCreateNote,
  useDeleteNote,
  useNote,
  useNotes,
  useUpdateNote,
} from '../hooks/useNotes'

export default function NoteEditor() {
  const { id: routeId } = useParams()
  const isNewRoute = routeId === 'new'
  if (isNewRoute) return <NewNoteEditor />
  return <ExistingNoteEditor noteId={routeId as string} />
}

function NewNoteEditor() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: tags = [] } = useTags()
  const { data: allNotes = [] } = useNotes()
  const createNote = useCreateNote()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const documentType: DocumentType = 'freeform'
  const [dirty, setDirty] = useState(false)

  const onSave = useCallback(() => {
    if (createNote.isPending) return
    createNote.mutate(
      { title, body, tag_ids: selectedTagIds, document_type: documentType },
      {
        onSuccess: (note) => {
          qc.setQueryData(['note', note.id], note)
          navigate(`/note/${note.id}?fresh=1`, { replace: true })
        },
      },
    )
  }, [body, createNote, documentType, navigate, qc, selectedTagIds, title])

  useUnsavedGuard(dirty)
  useSaveShortcut(onSave, dirty)

  return (
    <EditorShell
      t={t}
      isNew
      noteId={undefined}
      title={title}
      onTitleChange={(v) => {
        setTitle(v)
        setDirty(true)
      }}
      tags={tags}
      selectedTagIds={selectedTagIds}
      toggleTag={(tid) => {
        setSelectedTagIds((prev) =>
          prev.includes(tid) ? prev.filter((x) => x !== tid) : [...prev, tid],
        )
        setDirty(true)
      }}
      documentType={documentType}
      saving={createNote.isPending}
      savedAt={null}
      dirty={dirty}
      onSave={onSave}
      onDelete={null}
      body={body}
      onBodyChange={(val) => {
        setBody(val)
        setDirty(true)
      }}
      notes={allNotes.map((n) => ({ id: n.id, title: n.title }))}
    />
  )
}

function ExistingNoteEditor({ noteId }: { noteId: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: tags = [] } = useTags()
  const { data: allNotes = [] } = useNotes()
  const { data: note, isLoading, isError } = useNote(noteId)
  const update = useUpdateNote(noteId)
  const deleteNote = useDeleteNote()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [documentType, setDocumentType] = useState<DocumentType>('freeform')
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [dirty, setDirty] = useState(false)
  const hydratedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!note) return
    if (hydratedFor.current === note.id) return
    hydratedFor.current = note.id
    setTitle(note.title)
    setSelectedTagIds(note.tag_ids)
    setDocumentType(note.document_type)
    setSavedAt(new Date(note.updated_at))
    setBody(note.body)
    setDirty(false)
  }, [note])

  const onSave = useCallback(() => {
    if (!dirty || update.isPending) return
    update.mutate(
      { title, body, tag_ids: selectedTagIds, document_type: documentType },
      {
        onSuccess: () => {
          setSavedAt(new Date())
          setDirty(false)
        },
      },
    )
  }, [body, dirty, documentType, selectedTagIds, title, update])

  useUnsavedGuard(dirty)
  useSaveShortcut(onSave, dirty)

  const onDelete = () => {
    if (!window.confirm(t('editor.deleteConfirm'))) return
    deleteNote.mutate(noteId, {
      onSuccess: () => {
        setDirty(false)
        navigate('/notes', { replace: true })
      },
    })
  }

  if (isLoading) {
    return (
      <div className="px-4 sm:px-8 py-12 max-w-[800px] mx-auto text-center text-zinc-500">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
        {t('common.loading')}
      </div>
    )
  }
  if (isError || !note) {
    return (
      <div className="px-4 sm:px-8 py-12 max-w-[800px] mx-auto text-center text-zinc-500">
        {t('editor.notFound')}
      </div>
    )
  }

  return (
    <EditorShell
      t={t}
      isNew={false}
      noteId={noteId}
      title={title}
      onTitleChange={(v) => {
        setTitle(v)
        setDirty(true)
      }}
      tags={tags}
      selectedTagIds={selectedTagIds}
      toggleTag={(tid) => {
        setSelectedTagIds((prev) =>
          prev.includes(tid) ? prev.filter((x) => x !== tid) : [...prev, tid],
        )
        setDirty(true)
      }}
      documentType={documentType}
      saving={update.isPending}
      savedAt={savedAt}
      dirty={dirty}
      onSave={onSave}
      onDelete={onDelete}
      body={body}
      onBodyChange={(val) => {
        setBody(val)
        setDirty(true)
      }}
      notes={allNotes.map((n) => ({ id: n.id, title: n.title }))}
    />
  )
}

function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])
}

function useSaveShortcut(onSave: () => void, enabled: boolean) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (enabled) onSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled, onSave])
}

type TFn = (key: string, opts?: Record<string, unknown>) => string

interface EditorShellProps {
  t: TFn
  isNew: boolean
  noteId: string | undefined
  title: string
  onTitleChange: (v: string) => void
  tags: TagOut[]
  selectedTagIds: string[]
  toggleTag: (id: string) => void
  documentType: DocumentType
  saving: boolean
  savedAt: Date | null
  dirty: boolean
  onSave: () => void
  onDelete: (() => void) | null
  body: string
  onBodyChange: (val: string) => void
  notes: { id: string; title: string }[]
}

function EditorShell({
  t,
  isNew,
  noteId,
  title,
  onTitleChange,
  tags,
  selectedTagIds,
  toggleTag,
  documentType,
  saving,
  savedAt,
  dirty,
  onSave,
  onDelete,
  body,
  onBodyChange,
  notes,
}: EditorShellProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tagPickerOpen, setTagPickerOpen] = useState(false)
  const [mode, setMode] = useState<'read' | 'edit'>(isNew ? 'edit' : 'read')
  const [showFreshBanner, setShowFreshBanner] = useState(searchParams.get('fresh') === '1')
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'done'>('idle')
  const [imagePanelOpen, setImagePanelOpen] = useState(false)
  const [insightSheetOpen, setInsightSheetOpen] = useState(false)
  const navigate = useNavigate()
  const pickerRef = useRef<HTMLDivElement>(null)

  const dismissFreshBanner = () => {
    setShowFreshBanner(false)
    const next = new URLSearchParams(searchParams)
    next.delete('fresh')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    if (!tagPickerOpen) return
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setTagPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [tagPickerOpen])

  const tagById = useCallback((tid: string) => tags.find((tg) => tg.id === tid), [tags])
  const selectedTags = useMemo(
    () => selectedTagIds.map(tagById).filter((tg): tg is TagOut => !!tg),
    [selectedTagIds, tagById],
  )

  return (
    <div className="px-4 sm:px-8 py-4 sm:py-8 pb-24 md:pb-8 max-w-[1500px] mx-auto">
      {showFreshBanner && (
        <div className="mb-5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-3.5 flex items-start gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-emerald-900 dark:text-emerald-100 mb-0.5">
              {t('editor.freshBanner.title', { count: 0 })}
            </div>
            <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
              {t('editor.freshBanner.description')}
            </div>
          </div>
          <button
            onClick={dismissFreshBanner}
            className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-paper-200 dark:hover:bg-ink-800 shrink-0"
            aria-label={t('common.dismiss')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mobile compact action bar */}
      <div className="flex items-center gap-2 mb-3 md:hidden">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-paper-200 dark:hover:bg-ink-800 transition shrink-0"
          aria-label={t('notes.mobile.back')}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0 text-[11px] text-zinc-500 truncate">
          {saving ? (
            <span className="flex items-center gap-1 text-amber-500">
              <RefreshCw className="w-3 h-3 animate-spin" />
              {t('editor.saving')}
            </span>
          ) : dirty ? (
            <span className="flex items-center gap-1 text-amber-500">
              <RefreshCw className="w-3 h-3" />
              {t('editor.unsaved')}
            </span>
          ) : savedAt ? (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {t('editor.savedAt', { time: savedAt.toLocaleTimeString() })}
            </span>
          ) : isNew ? (
            <span className="flex items-center gap-1 text-emerald-500">
              <Plus className="w-3 h-3" />
              {t('editor.newNote')}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onSave}
            disabled={(!isNew && !dirty) || saving}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition bg-emerald-500 hover:bg-emerald-400 text-white disabled:bg-paper-200 dark:disabled:bg-ink-800 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-sm shadow-emerald-500/20 disabled:shadow-none"
          >
            <RefreshCw className={`w-3 h-3 ${saving ? 'animate-spin' : ''}`} />
            {isNew ? t('editor.save') : t('editor.saveAgain')}
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition"
              title={t('editor.delete')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap lg:flex-nowrap">
        <div className="min-w-0 flex-1">
          <div className="hidden md:flex items-center gap-2 text-xs mb-2 flex-wrap text-zinc-500">
            {saving ? (
              <span className="flex items-center gap-1 text-amber-500">
                <RefreshCw className="w-3 h-3 animate-spin" />
                {t('editor.saving')}
              </span>
            ) : dirty ? (
              <span className="flex items-center gap-1 text-amber-500">
                <RefreshCw className="w-3 h-3" />
                {t('editor.unsaved')}
              </span>
            ) : savedAt ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {t('editor.savedAt', { time: savedAt.toLocaleTimeString() })}
              </span>
            ) : isNew ? (
              <span className="flex items-center gap-1 text-emerald-500">
                <Plus className="w-3 h-3" />
                {t('editor.newNote')}
              </span>
            ) : null}
          </div>

          {mode === 'read' ? (
            <h1 className="font-serif text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title || <span className="text-zinc-400">{t('editor.untitled')}</span>}
            </h1>
          ) : (
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={isNew ? t('editor.titlePlaceholderNew') : t('editor.titlePlaceholder')}
              className="font-serif text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 bg-transparent w-full focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-700 border-b border-dashed border-paper-300 dark:border-ink-700/60 focus:border-emerald-500/40 pb-1"
            />
          )}

          <div className="mt-3 flex items-center gap-1.5 flex-wrap relative">
{selectedTags.map((tg) => (
              <span
                key={tg.id}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11.5px] bg-paper-100 dark:bg-ink-850 border border-paper-300/40 dark:border-ink-700/40 text-zinc-700 dark:text-zinc-200"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${COLOR_DOT[tg.color] ?? 'bg-indigo-400'}`} />
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
            ))}
            <button
              onClick={() => setTagPickerOpen((v) => !v)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11.5px] border border-dashed border-paper-300/60 dark:border-ink-700/60 text-zinc-500 hover:text-emerald-600 hover:border-emerald-500/40 transition"
            >
              <TagIcon className="w-2.5 h-2.5" />
              {selectedTags.length === 0 ? t('editor.addTag') : t('editor.editTag')}
            </button>

            {/* Mobile mode toggle — inline in tags row */}
            {!isNew && (
              <div className="flex md:hidden ml-auto p-0.5 rounded-lg bg-paper-200 dark:bg-ink-850 border border-paper-300/60 dark:border-ink-700/60">
                <button
                  onClick={() => {
                    if (mode === 'edit' && dirty && !saving) onSave()
                    setMode('read')
                  }}
                  disabled={saving}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition disabled:cursor-not-allowed ${
                    mode === 'read'
                      ? 'bg-paper-300 dark:bg-ink-800 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {saving && mode === 'edit' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                  {t('editor.mode.read')}
                </button>
                <button
                  onClick={() => setMode('edit')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition ${
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

            {tagPickerOpen && (
              <div
                ref={pickerRef}
                className="absolute left-0 top-full mt-1 z-30 card-surface bg-paper-50 dark:bg-ink-900 shadow-2xl py-1 w-72 max-h-72 overflow-y-auto animate-fade-in"
              >
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-500 font-medium border-b border-paper-300/60 dark:border-ink-700/60 flex items-center justify-between">
                  <span>{t('editor.tagPicker.title')}</span>
                  <button
                    onClick={() => setTagPickerOpen(false)}
                    className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {tags.length === 0 && (
                  <div className="px-3 py-4 text-center">
                    <p className="text-[12px] text-zinc-500">{t('tagPicker.empty')}</p>
                  </div>
                )}
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
                        <div className={`w-1.5 h-1.5 rounded-full ${COLOR_DOT[tg.color] ?? 'bg-indigo-400'} shrink-0`} />
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

        <div className="hidden md:flex items-center gap-2 shrink-0 flex-wrap">
          {!isNew && (
            <div className="flex p-0.5 rounded-lg bg-paper-200 dark:bg-ink-850 border border-paper-300/60 dark:border-ink-700/60">
              <button
                onClick={() => {
                  if (mode === 'edit' && dirty && !saving) onSave()
                  setMode('read')
                }}
                disabled={saving}
                className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition disabled:cursor-not-allowed ${
                  mode === 'read'
                    ? 'bg-paper-300 dark:bg-ink-800 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {saving && mode === 'edit' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
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
          <button
            onClick={onSave}
            disabled={(!isNew && !dirty) || saving}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-400 text-white disabled:bg-paper-200 dark:disabled:bg-ink-800 disabled:text-zinc-500 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isNew ? t('editor.save') : t('editor.saveAgain')}</span>
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition flex items-center gap-1.5"
              title={t('editor.delete')}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('editor.delete')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 card-surface p-3 sm:p-8 bg-paper-50/60 dark:bg-ink-900/40 min-h-[500px]">
          {mode === 'edit' && voiceState !== 'idle' && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 animate-fade-in">
              <div className="flex items-center gap-3">
                {voiceState === 'recording' ? (
                  <button
                    onClick={() => setVoiceState('done')}
                    className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30 animate-pulse hover:scale-105 transition shrink-0"
                  >
                    <Square className="w-3.5 h-3.5 text-white fill-white" />
                  </button>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-paper-200 dark:bg-ink-800 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium text-zinc-800 dark:text-zinc-100 mb-0.5">
                    {voiceState === 'recording' ? t('editor.voice.recording') : t('editor.voice.done')}
                  </div>
                  <div className="text-[10.5px] text-zinc-500">
                    {voiceState === 'recording' ? '00:12' : t('editor.voice.insertHint')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {voiceState === 'done' && (
                    <button
                      onClick={() => {
                        onBodyChange(body + '\n\n' + '[Voice transcript]...')
                        setVoiceState('idle')
                      }}
                      className="px-2.5 py-1 rounded-md text-[11px] bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition"
                    >
                      {t('editor.voice.insert')}
                    </button>
                  )}
                  <button
                    onClick={() => setVoiceState('idle')}
                    className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-paper-200 dark:hover:bg-ink-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === 'edit' && imagePanelOpen && (
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[12px] font-medium text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
                  {t('editor.image.title')}
                </div>
                <button
                  onClick={() => setImagePanelOpen(false)}
                  className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-paper-200 dark:hover:bg-ink-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="rounded-lg border-2 border-dashed border-paper-300 dark:border-ink-700 hover:border-emerald-500/40 transition p-6 text-center cursor-pointer bg-paper-100/40 dark:bg-ink-850/40">
                <Plus className="w-4 h-4 text-zinc-400 mx-auto mb-1.5" />
                <p className="text-[12px] text-zinc-600 dark:text-zinc-300">{t('editor.image.dropHint')}</p>
                <p className="text-[10.5px] text-zinc-500 mt-0.5">{t('editor.image.formats')}</p>
              </div>
            </div>
          )}

          {mode === 'read' ? (
            <PlainEditor value={body} onChange={() => {}} editable={false} notes={notes} />
          ) : (
            <div className="space-y-4">
              <PlainEditor
                value={body}
                onChange={onBodyChange}
                placeholder={t('editor.placeholder')}
                onRecord={() => setVoiceState('recording')}
                onImage={() => setImagePanelOpen(true)}
                notes={notes}
              />
              {!isNew && (
                <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300 mt-0.5 shrink-0" />
                  <div className="text-[11.5px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <span className="text-emerald-700 dark:text-emerald-200 font-medium">{t('editor.editHint.prefix')}</span>, {t('editor.editHint.body')} <span className="text-zinc-800 dark:text-zinc-100">"{t('editor.editHint.deleteProposal')}"</span> {t('editor.editHint.suffix')}
                  </div>
                </div>
              )}
            </div>
          )}
          {!isNew && <LegendRow t={t} mode={mode} />}

          {/* Mobile: open Leaves & Insights sheet */}
          <button
            onClick={() => setInsightSheetOpen(true)}
            className="mt-5 w-full md:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-[13px] text-emerald-700 dark:text-emerald-300 transition"
          >
            <Layers className="w-4 h-4" />
            {t('notes.mobile.openInsights')}
          </button>
        </div>

        <div className="hidden lg:block lg:col-span-5 space-y-4">
          <LiveEnginePanel
            noteId={noteId}
            documentType={documentType}
            isNew={isNew}
            dirty={dirty}
          />
          <LiveLeavesPanel
            noteId={noteId}
            documentType={documentType}
            isNew={isNew}
            dirty={dirty}
          />
          {!isNew && <InsightsPanel t={t} />}
        </div>
      </div>

      <MobileInsightSheet
        isOpen={insightSheetOpen}
        onClose={() => setInsightSheetOpen(false)}
        t={t}
        isNew={isNew}
        dirty={dirty}
        noteId={noteId}
        documentType={documentType}
      />
    </div>
  )
}


function LegendRow({
  t,
  mode,
}: {
  t: TFn
  mode: 'read' | 'edit'
}) {
  return (
    <div className="mt-8 pt-5 border-t border-paper-300/40 dark:border-ink-700/40 flex items-center gap-3 sm:gap-4 text-[10px] text-zinc-500 flex-wrap">
      <span className="uppercase tracking-wider font-medium">
        {mode === 'read' ? t('editor.legend.readMode') : t('editor.legend.editMode')}
      </span>
      <LegendSwatch color="rgba(129,140,248,0.4)" label={t('editor.legend.definition')} />
      <LegendSwatch color="rgba(251,191,36,0.4)" label={t('editor.legend.clause')} />
      <LegendSwatch color="rgba(52,211,153,0.4)" label={t('editor.legend.relation')} />
      <LegendSwatch color="rgba(56,189,248,0.4)" label={t('editor.legend.fact')} />
    </div>
  )
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-3 h-2 rounded-sm" style={{ background: color }} />
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
    </span>
  )
}

function InsightsPanel({ t }: { t: TFn }) {
  return (
    <div className="card-surface p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
        <h3 className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
          {t('editor.insights.title')}
        </h3>
      </div>
      <div className="text-[12px] text-zinc-500 leading-relaxed">
        {t('editor.insights.empty')}
      </div>
    </div>
  )
}
