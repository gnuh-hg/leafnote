import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, Leaf, Clock, X, Plus, Tag as TagIcon, Filter } from 'lucide-react'
import { notes } from '../data/mockData'
import { useTags } from '../hooks/useTags'
import { COLOR_DOT } from '../services/tags'

export default function NotesList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: tags = [] } = useTags()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTagIds = useMemo(() => {
    const raw = searchParams.get('tag')
    return raw ? raw.split(',').filter(Boolean) : []
  }, [searchParams])

  const setActiveTags = (ids: string[]) => {
    const next = new URLSearchParams(searchParams)
    if (ids.length === 0) next.delete('tag')
    else next.set('tag', ids.join(','))
    setSearchParams(next, { replace: true })
  }

  const toggleTag = (id: string) => {
    if (activeTagIds.includes(id)) {
      setActiveTags(activeTagIds.filter((x) => x !== id))
    } else {
      setActiveTags([...activeTagIds, id])
    }
  }

  const filteredNotes = useMemo(() => {
    if (activeTagIds.length === 0) return notes
    return notes.filter((n) =>
      activeTagIds.every((tid) => (n.tagIds ?? []).includes(tid)),
    )
  }, [activeTagIds])

  const tagById = (id: string) => tags.find((tg) => tg.id === id)

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] mx-auto">
      {/* Heading */}
      <div className="mb-6">
        <div className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
          <FileText className="w-3 h-3" />
          {t('notesList.count', { filtered: filteredNotes.length, total: notes.length })}
          {activeTagIds.length > 0 && (
            <>
              <span className="text-zinc-700">·</span>
              <span className="text-emerald-600 dark:text-emerald-300">
                {t('notesList.filterInfo', { count: activeTagIds.length })}
              </span>
            </>
          )}
        </div>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl sm:text-[44px] leading-tight font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {t('notesList.heading')}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">{t('notesList.subheading')}</p>
          </div>
          <button
            onClick={() => navigate('/note/new')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            {t('notesList.newNote')}
          </button>
        </div>
      </div>

      {/* Tag filter chips */}
      <div className="mb-6 card-surface p-3 bg-paper-100/50 dark:bg-ink-900/50">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-3 h-3 text-zinc-500" />
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
            {t('notesList.tagFilter.label')}
          </span>
          {activeTagIds.length > 0 && (
            <button
              onClick={() => setActiveTags([])}
              className="ml-auto text-[11px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              {t('notesList.tagFilter.clear')}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tg) => {
            const isActive = activeTagIds.includes(tg.id)
            return (
              <button
                key={tg.id}
                onClick={() => toggleTag(tg.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11.5px] border transition ${
                  isActive
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-100'
                    : 'bg-paper-100 dark:bg-ink-850 border-paper-300/40 dark:border-ink-700/40 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-paper-400 dark:hover:border-ink-600'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${COLOR_DOT[tg.color] ?? 'bg-indigo-400'}`} />
                <span>
                  <span className="text-zinc-600">#</span>
                  {tg.name}
                </span>
                <span className="text-[10px] text-zinc-500">{tg.note_count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Notes grid */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5">
            <FileText className="w-8 h-8 text-emerald-500/60" />
          </div>
          <h2 className="font-serif text-xl text-zinc-700 dark:text-zinc-200 mb-2">
            {t('notesList.emptyMain.title')}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
            {t('notesList.emptyMain.description')}
          </p>
          <button
            onClick={() => navigate('/note/new')}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition shadow-lg shadow-emerald-500/20"
          >
            {t('notesList.emptyMain.cta')}
          </button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="card-surface p-12 text-center">
          <TagIcon className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <div className="text-[14px] text-zinc-700 dark:text-zinc-300 mb-1">
            {t('notesList.emptyFilter.title')}
          </div>
          <div className="text-[12px] text-zinc-500">
            {t('notesList.emptyFilter.hint')}{' '}
            <button
              onClick={() => setActiveTags([])}
              className="text-emerald-600 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 underline"
            >
              {t('notesList.emptyFilter.clearAll')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => navigate(`/note/${note.id}`)}
              className="card-surface text-left p-5 hover:border-emerald-500/40 transition hover:-translate-y-0.5 group"
            >
              <div className="flex items-center gap-2 text-[11px] mb-2 text-zinc-500">
                <Clock className="w-3 h-3" />
                {note.updatedAt}
              </div>
              <h3 className="font-serif text-xl text-zinc-900 dark:text-zinc-100 font-semibold leading-snug mb-2">
                {note.title}
              </h3>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3 mb-3">
                {note.excerpt}
              </p>
              {/* Tag pills */}
              <div className="flex flex-wrap gap-1 mb-3">
                {(note.tagIds ?? []).map((tid) => {
                  const tg = tagById(tid)
                  if (!tg) return null
                  return (
                    <span
                      key={tid}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-paper-100 dark:bg-ink-850 border border-paper-300/40 dark:border-ink-700/40 text-zinc-600 dark:text-zinc-300"
                    >
                      <span className={`w-1 h-1 rounded-full ${COLOR_DOT[tg.color] ?? 'bg-indigo-400'}`} />
                      <span className="text-zinc-500">#</span>
                      {tg.name}
                    </span>
                  )
                })}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-paper-300/40 dark:border-ink-700/40 text-[11px]">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Leaf className="w-3 h-3" />
                  {t('notesList.leafCount', { count: note.leafCount })}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300">
                  {t('notesList.open')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
