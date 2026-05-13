import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Mic, Command, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function TopBar() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const { t, i18n } = useTranslation()

  const today = new Date().toLocaleDateString(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <header className="h-14 shrink-0 border-b border-paper-300/60 dark:border-ink-700/60 bg-paper-50/80 dark:bg-ink-900/40 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-10 transition-colors duration-200">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-xs text-zinc-500 capitalize">{today}</div>
          <div className="text-xs text-zinc-400 dark:text-zinc-700">·</div>
          <div className="text-xs text-zinc-500">
            <span className="text-emerald-500">●</span> {t('topbar.engineStatus')}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 mx-2 sm:mx-6 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder={t('topbar.search.placeholder')}
            className="w-full bg-paper-100 dark:bg-ink-850 border border-paper-300/60 dark:border-ink-700/60 rounded-lg pl-9 pr-4 sm:pr-16 py-1.5 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:bg-paper-50 dark:focus:bg-ink-900 transition text-zinc-900 dark:text-zinc-100"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500">
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-paper-200 dark:bg-ink-800 border border-paper-300 dark:border-ink-700">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
          className="hidden sm:flex px-2 py-1 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-850 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition text-[11px] font-medium tracking-wide"
          title={i18n.language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
        >
          {i18n.language === 'vi' ? 'VI' : 'EN'}
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-850 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          title={isDark ? t('topbar.theme.toLight') : t('topbar.theme.toDark')}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={() => navigate('/note/new?input=voice')}
          className="hidden sm:flex p-2 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-850 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          title={t('topbar.voice.title')}
        >
          <Mic className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate('/note/new')}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('topbar.newNote')}</span>
        </button>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 ml-1 ring-2 ring-paper-200 dark:ring-ink-900" />
      </div>
    </header>
  )
}
