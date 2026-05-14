import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Sparkles,
  FileText,
  Network,
  Brain,
  BarChart3,
  Plus,
  Tag as TagIcon,
  LogOut,
  MoreHorizontal,
} from 'lucide-react'
import logoLeafnote from '../assets/images/logo-leafnote.svg'
import TagCreateModal from './TagCreateModal'
import TagEditModal from './TagEditModal'
import TagDeleteConfirm from './TagDeleteConfirm'
import { useTags, useTrackTagAccess } from '../hooks/useTags'
import { COLOR_DOT, type TagOut } from '../services/tags'
import { cognitiveProfile } from '../data/mockData'
import { useAuthStore } from '../stores/authStore'
import { signOut } from '../services/auth'
export default function Sidebar() {
  const { t } = useTranslation()
  const { data: tags = [], isLoading, isError, refetch } = useTags()
  const trackAccess = useTrackTagAccess()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [editTag, setEditTag] = useState<TagOut | null>(null)
  const [deleteTag, setDeleteTag] = useState<TagOut | null>(null)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  async function handleLogout() {
    try {
      await signOut()
    } catch {
      // clear local session even if server call fails (offline)
    }
    clearAuth()
    navigate('/auth')
  }

  const navItems = [
    { to: '/', label: t('sidebar.nav.surfacing'), icon: Sparkles },
    { to: '/notes', label: t('sidebar.nav.notes'), icon: FileText },
    { to: '/graph', label: t('sidebar.nav.graph'), icon: Network },
    { to: '/review', label: t('sidebar.nav.review'), icon: Brain },
    { to: '/insights', label: t('sidebar.nav.insights'), icon: BarChart3 },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-paper-100/80 dark:bg-ink-900/70 backdrop-blur-xl border-r border-paper-300/60 dark:border-ink-700/60 transition-colors duration-200">
      {/* Wordmark */}
      <div className="px-5 pt-5 pb-4 border-b border-paper-300/40 dark:border-ink-700/40">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <img src={logoLeafnote} alt="Leafnote" className="w-6 h-6 object-contain" />
            <div className="absolute inset-0 rounded-xl ring-1 ring-emerald-200/60" />
          </div>
          <div>
            <div className="font-serif text-2xl font-semibold leading-none tracking-tight text-zinc-900 dark:text-zinc-100">
              Leafnote
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mt-1.5">
              {t('sidebar.tagline')}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 ring-1 ring-emerald-500/20'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-paper-200 dark:hover:bg-ink-850'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <item.icon className="w-4 h-4" strokeWidth={2} />
              <span>{item.label}</span>
            </div>
          </NavLink>
        ))}

        {/* Tags */}
        <div className="pt-4 pb-1">
          <div className="flex items-center justify-between px-3 mb-1.5">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium flex items-center gap-1.5">
              <TagIcon className="w-2.5 h-2.5" />
              {t('sidebar.tags.title')}
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="text-[10px] text-zinc-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-300 flex items-center gap-0.5 transition"
              title={t('sidebar.tags.newTitle')}
            >
              <Plus className="w-2.5 h-2.5" />
              {t('sidebar.tags.new')}
            </button>
          </div>

          {isLoading && tags.length === 0 && <TagListSkeleton />}

          {/* Only show full error state when there is no cached data to fall back to. */}
          {isError && tags.length === 0 && !isLoading && (
            <div className="px-3 py-3 text-center">
              <p className="text-[12px] text-zinc-500">{t('tag.error.loadFailed')}</p>
              <button
                onClick={() => refetch()}
                className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {t('tag.action.retry')}
              </button>
            </div>
          )}

          {!isLoading && !isError && tags.length === 0 && (
            <div className="px-3 py-4 flex flex-col items-center gap-1.5 text-center">
              <TagIcon className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
              <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                {t('sidebar.tags.empty')}
              </p>
            </div>
          )}

          {tags.map((tag) => (
            <TagItem
              key={tag.id}
              tag={tag}
              onNavigate={() => {
                trackAccess.mutate(tag.id)
                navigate(`/notes?tag=${tag.id}`)
              }}
              onEdit={() => setEditTag(tag)}
              onDelete={() => setDeleteTag(tag)}
            />
          ))}

          <button
            onClick={() => setShowCreate(true)}
            className="w-full mt-1 flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] text-zinc-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-paper-200 dark:hover:bg-ink-850 border border-dashed border-paper-300/60 dark:border-ink-700/60 hover:border-emerald-500/40 transition"
          >
            <Plus className="w-3 h-3" />
            <span>{t('sidebar.tags.create')}</span>
          </button>
        </div>
      </nav>

      {showCreate && <TagCreateModal onClose={() => setShowCreate(false)} />}
      {editTag && <TagEditModal tag={editTag} onClose={() => setEditTag(null)} />}
      {deleteTag && <TagDeleteConfirm tag={deleteTag} onClose={() => setDeleteTag(null)} />}

      {/* Logout */}
      <div className="px-3 pb-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-paper-200 dark:hover:bg-ink-850 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('auth.action.logout')}</span>
        </button>
      </div>

      {/* Cognitive snapshot */}
      <div className="p-4 border-t border-paper-300/40 dark:border-ink-700/40 bg-paper-100/40 dark:bg-ink-900/40">
        <div className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 font-medium">
          {t('sidebar.snapshot.title')}
        </div>
        <div className="space-y-1.5 text-[11px]">
          <Stat label={t('sidebar.snapshot.intensity')} value={cognitiveProfile.traits[1].value} />
          <Stat label={t('sidebar.snapshot.style')} value={cognitiveProfile.traits[0].value} accent />
          <Stat label={t('sidebar.snapshot.streak')} value={`${cognitiveProfile.streak} ${t('sidebar.snapshot.streakUnit')}`} />
        </div>
      </div>

    </aside>
  )
}

interface TagItemProps {
  tag: TagOut
  onNavigate: () => void
  onEdit: () => void
  onDelete: () => void
}

function TagItem({ tag, onNavigate, onEdit, onDelete }: TagItemProps) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isTmp = tag.id.startsWith('tmp-')

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const dot = COLOR_DOT[tag.color] ?? 'bg-indigo-400'

  return (
    <div className={`relative group ${isTmp ? 'opacity-60 animate-pulse pointer-events-none' : ''}`}>
      <button
        onClick={onNavigate}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-paper-200 dark:hover:bg-ink-850 transition"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
          <span className="truncate">
            <span className="text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-500">#</span>
            {tag.name}
          </span>
        </div>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-600 shrink-0 ml-2 group-hover:opacity-0 transition-opacity">
          {tag.note_count}
        </span>
      </button>

      {!isTmp && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen((v) => !v)
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-paper-200 dark:hover:bg-ink-800 transition"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      )}

      {menuOpen && !isTmp && (
        <div
          ref={menuRef}
          className="absolute right-2 top-full mt-1 z-40 card-surface bg-paper-50 dark:bg-ink-900 shadow-xl py-1 w-44 animate-fade-in"
        >
          <button
            onClick={() => {
              setMenuOpen(false)
              onEdit()
            }}
            className="w-full text-left px-3 py-1.5 text-[12.5px] text-zinc-600 dark:text-zinc-300 hover:bg-paper-100 dark:hover:bg-ink-800 transition"
          >
            {t('sidebar.tags.menu.edit')}
          </button>
          <button
            onClick={() => {
              setMenuOpen(false)
              onDelete()
            }}
            className="w-full text-left px-3 py-1.5 text-[12.5px] text-rose-500 hover:bg-paper-100 dark:hover:bg-ink-800 transition"
          >
            {t('sidebar.tags.menu.delete')}
          </button>
        </div>
      )}
    </div>
  )
}

function TagListSkeleton() {
  return (
    <div className="space-y-1.5 px-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-paper-300 dark:bg-ink-700 animate-pulse" />
          <div
            className="h-3 rounded bg-paper-300 dark:bg-ink-700 animate-pulse"
            style={{ width: `${60 + i * 20}px` }}
          />
        </div>
      ))}
    </div>
  )
}

interface StatProps {
  label: string
  value: string
  accent?: boolean
}

function Stat({ label, value, accent }: StatProps) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-zinc-400 dark:text-zinc-500">{label}</span>
      <span
        className={`font-medium ${
          accent ? 'text-emerald-600 dark:text-emerald-300' : 'text-zinc-700 dark:text-zinc-200'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
