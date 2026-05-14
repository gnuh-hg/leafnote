import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Tag as TagIcon, LogOut } from 'lucide-react'
import { useTags, useTrackTagAccess } from '../hooks/useTags'
import { COLOR_DOT } from '../services/tags'
import { useAuthStore } from '../stores/authStore'
import { signOut } from '../services/auth'
import TagCreateModal from './TagCreateModal'

interface MobileMoreSheetProps {
  onClose: () => void
}

export default function MobileMoreSheet({ onClose }: MobileMoreSheetProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: tags = [], isLoading, isError, refetch } = useTags()
  const trackAccess = useTrackTagAccess()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const [showCreate, setShowCreate] = useState(false)

  async function handleLogout() {
    try {
      await signOut()
    } catch {
      // clear local session even if server call fails (offline)
    }
    clearAuth()
    navigate('/auth')
  }

  function handleTagNav(tagId: string) {
    trackAccess.mutate(tagId)
    navigate(`/notes?tag=${tagId}`)
    onClose()
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-paper-50 dark:bg-ink-900 rounded-t-2xl border-t border-paper-300/60 dark:border-ink-700/60 animate-slide-up max-h-[70vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-paper-300 dark:bg-ink-700 mx-auto mt-3 mb-1" />

        {/* Tags section */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
              <TagIcon className="w-2.5 h-2.5" />
              {t('sidebar.tags.title')}
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-0.5 text-[11px] text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition"
            >
              <Plus className="w-3 h-3" />
              {t('sidebar.tags.new')}
            </button>
          </div>

          {isLoading && (
            <div className="space-y-2 py-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-paper-300 dark:bg-ink-700 animate-pulse" />
                  <div className="h-3 rounded bg-paper-300 dark:bg-ink-700 animate-pulse" style={{ width: `${60 + i * 20}px` }} />
                </div>
              ))}
            </div>
          )}

          {/* Only show full error state when there is no cached data to fall back to. */}
          {isError && tags.length === 0 && !isLoading && (
            <div className="py-3 text-center">
              <p className="text-[12px] text-zinc-500">{t('tag.error.loadFailed')}</p>
              <button onClick={() => refetch()} className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline">
                {t('tag.action.retry')}
              </button>
            </div>
          )}

          {!isLoading && !isError && tags.length === 0 && (
            <div className="py-4 flex flex-col items-center gap-1.5 text-center">
              <TagIcon className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
              <p className="text-[12px] text-zinc-400 dark:text-zinc-500">{t('sidebar.tags.empty')}</p>
            </div>
          )}

          {tags.map((tag) => {
            const dot = COLOR_DOT[tag.color] ?? 'bg-indigo-400'
            const isTmp = tag.id.startsWith('tmp-')
            return (
              <button
                key={tag.id}
                onClick={() => !isTmp && handleTagNav(tag.id)}
                disabled={isTmp}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition ${
                  isTmp
                    ? 'opacity-50 pointer-events-none'
                    : 'hover:bg-paper-200 dark:hover:bg-ink-850'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                <span className="text-zinc-500 text-[12px]">#</span>
                <span className="text-zinc-700 dark:text-zinc-200 text-[13px] truncate">{tag.name}</span>
                <span className="ml-auto text-[11px] text-zinc-400 dark:text-zinc-600 shrink-0">{tag.note_count}</span>
              </button>
            )
          })}

          <button
            onClick={() => setShowCreate(true)}
            className="w-full mt-1 flex items-center gap-2 px-2 py-2 rounded-lg text-[12px] text-zinc-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-paper-200 dark:hover:bg-ink-850 border border-dashed border-paper-300/60 dark:border-ink-700/60 hover:border-emerald-500/40 transition"
          >
            <Plus className="w-3 h-3" />
            {t('sidebar.tags.create')}
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-paper-300/40 dark:border-ink-700/40 mx-4" />

        {/* Logout */}
        <div className="px-4 py-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-paper-200 dark:hover:bg-ink-850 transition"
          >
            <LogOut className="w-4 h-4" />
            {t('auth.action.logout')}
          </button>
        </div>
      </div>

      {showCreate && <TagCreateModal onClose={() => setShowCreate(false)} />}
    </>,
    document.body,
  )
}
