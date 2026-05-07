import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn } from '../../services/auth'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

interface Props {
  onSwitchToSignup: () => void
}

export default function LoginForm({ onSwitchToSignup }: Props) {
  const { t } = useTranslation()
  const isOnline = useOnlineStatus()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const formValid = emailValid && password.length > 0

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!formValid || !isOnline) return

    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
    } catch {
      setError(t('auth.error.wrongCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
      {error && (
        <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          {t('auth.field.email')}
        </label>
        <input
          ref={emailRef}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, email: true }))}
          onFocus={handleFocus}
          placeholder={t('auth.placeholder.email')}
          autoComplete="email"
          className="w-full bg-paper-100 dark:bg-ink-850 border border-paper-300/60 dark:border-ink-700/60 rounded-lg px-3 py-2.5 sm:py-1.5 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:bg-paper-50 dark:focus:bg-ink-900 transition text-zinc-900 dark:text-zinc-100"
        />
        {touched.email && email && !emailValid && (
          <p className="text-rose-600 dark:text-rose-400 text-xs mt-1">
            {t('auth.error.invalidEmail')}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          {t('auth.field.password')}
        </label>
        <div className="relative">
          <input
            ref={passwordRef}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, password: true }))}
            onFocus={handleFocus}
            placeholder={t('auth.placeholder.password')}
            autoComplete="current-password"
            className="w-full bg-paper-100 dark:bg-ink-850 border border-paper-300/60 dark:border-ink-700/60 rounded-lg px-3 py-2.5 sm:py-1.5 pr-10 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:bg-paper-50 dark:focus:bg-ink-900 transition text-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!formValid || loading || !isOnline}
        className="w-full h-11 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('auth.action.loading')}
          </>
        ) : (
          t('auth.action.login')
        )}
      </button>

      {/* Switch to signup */}
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        {t('auth.link.noAccount')}{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
        >
          {t('auth.link.goSignup')}
        </button>
      </p>
    </form>
  )
}
