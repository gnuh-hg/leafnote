import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Leaf } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import BrandingPanel from '../components/auth/BrandingPanel'
import LoginForm from '../components/auth/LoginForm'
import SignupForm from '../components/auth/SignupForm'

type Tab = 'login' | 'signup'

export default function Auth() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { session, initialized } = useAuthStore()
  const isOnline = useOnlineStatus()
  const [tab, setTab] = useState<Tab>('login')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (initialized && session) {
      navigate('/', { replace: true })
    }
  }, [initialized, session, navigate])

  function handleSignupSuccess() {
    setTab('login')
    setToast(t('auth.success.registered'))
    setTimeout(() => setToast(''), 5000)
  }

  return (
    <div className="grid sm:grid-cols-2 min-h-screen">
      <BrandingPanel />

      <div className="flex flex-col items-center justify-center bg-paper-50 dark:bg-ink-950 px-4 py-8">
        {/* Mobile logo */}
        <div className="sm:hidden flex items-center gap-2 mb-8">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf className="w-[18px] h-[18px] text-white" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-serif text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              Leafnote
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              {t('sidebar.tagline')}
            </div>
          </div>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="w-full max-w-sm mb-4 text-sm text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-center">
            {tab === 'login' ? t('auth.offline.banner') : t('auth.offline.bannerSignup')}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="w-full max-w-sm mb-4 text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-center animate-slide-up">
            {toast}
          </div>
        )}

        {/* Form card */}
        <div className="w-full max-w-sm animate-fade-in">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-paper-100 dark:bg-ink-850 rounded-lg mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                tab === 'login'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 ring-1 ring-emerald-500/20'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {t('auth.tab.login')}
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                tab === 'signup'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 ring-1 ring-emerald-500/20'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {t('auth.tab.signup')}
            </button>
          </div>

          {/* Forms */}
          {tab === 'login' ? (
            <LoginForm onSwitchToSignup={() => setTab('signup')} />
          ) : (
            <SignupForm
              onSwitchToLogin={() => setTab('login')}
              onSignupSuccess={handleSignupSuccess}
            />
          )}
        </div>
      </div>
    </div>
  )
}
