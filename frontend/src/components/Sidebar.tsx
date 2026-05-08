import { useState } from 'react'
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
} from 'lucide-react'
import logoLeafnote from '../assets/images/logo-leafnote.png'
import TagCreateModal from './TagCreateModal'
import { useAppState } from '../context/AppState'
import { cognitiveProfile } from '../data/mockData'
import { useAuthStore } from '../stores/authStore'
import { signOut } from '../services/auth'

export default function Sidebar() {
  const { t } = useTranslation()
  const { tags } = useAppState()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
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
    { to: '/', label: t('sidebar.nav.surfacing'), icon: Sparkles, badge: '12' },
    { to: '/notes', label: t('sidebar.nav.notes'), icon: FileText },
    { to: '/graph', label: t('sidebar.nav.graph'), icon: Network },
    { to: '/review', label: t('sidebar.nav.review'), icon: Brain, badge: '7' },
    { to: '/insights', label: t('sidebar.nav.insights'), icon: BarChart3 },
  ]

  return (
    <aside className="w-64 shrink-0 bg-paper-100/80 dark:bg-ink-900/70 backdrop-blur-xl border-r border-paper-300/60 dark:border-ink-700/60 flex flex-col transition-colors duration-200">
      {/* Wordmark */}
      <div className="px-5 pt-5 pb-4 border-b border-paper-300/40 dark:border-ink-700/40">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <img src={logoLeafnote} alt="Leafnote" className="w-6 h-6 object-contain" />
            <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
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
            {item.badge && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-paper-200 dark:bg-ink-800 text-zinc-500 dark:text-zinc-400">
                {item.badge}
              </span>
            )}
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

          {tags.length === 0 ? (
            <div className="px-3 py-4 flex flex-col items-center gap-1.5 text-center">
              <TagIcon className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
              <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                {t('sidebar.tags.empty')}
              </p>
            </div>
          ) : (
            tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => navigate(`/notes?tag=${tag.id}`)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-paper-200 dark:hover:bg-ink-850 transition group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${tag.dot} shrink-0`} />
                  <span className="truncate">
                    <span className="text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-500">#</span>
                    {tag.name}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600 shrink-0 ml-2">
                  {tag.noteCount}
                </span>
              </button>
            ))
          )}

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
