import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Sparkles, FileText, Network, Brain, BarChart3, MoreHorizontal } from 'lucide-react'
import MobileMoreSheet from './MobileMoreSheet'

const NAV_ITEMS = [
  { to: '/', icon: Sparkles, end: true },
  { to: '/notes', icon: FileText, end: false },
  { to: '/graph', icon: Network, end: false },
  { to: '/review', icon: Brain, end: false },
  { to: '/insights', icon: BarChart3, end: false },
]

export default function BottomNav() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-paper-100/90 dark:bg-ink-900/90 backdrop-blur-xl border-t border-paper-300/60 dark:border-ink-700/60 flex items-stretch pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-300'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`
            }
          >
            <item.icon className="w-5 h-5" strokeWidth={1.8} />
          </NavLink>
        ))}

        <button
          onClick={() => setSheetOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-zinc-500 dark:text-zinc-400 transition hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <MoreHorizontal className="w-5 h-5" strokeWidth={1.8} />
        </button>
      </nav>

      {sheetOpen && <MobileMoreSheet onClose={() => setSheetOpen(false)} />}
    </>
  )
}
