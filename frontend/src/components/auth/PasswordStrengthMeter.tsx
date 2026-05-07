import { useTranslation } from 'react-i18next'

function getStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return score
}

interface Props {
  password: string
}

export default function PasswordStrengthMeter({ password }: Props) {
  const { t } = useTranslation()

  if (!password) return null

  const score = getStrength(password)

  let label: string
  let color: string
  let width: string

  if (score <= 2) {
    label = t('auth.strength.weak')
    color = 'bg-rose-500'
    width = `${(score / 5) * 100}%`
  } else if (score <= 4) {
    label = t('auth.strength.medium')
    color = 'bg-amber-500'
    width = `${(score / 5) * 100}%`
  } else {
    label = t('auth.strength.strong')
    color = 'bg-emerald-500'
    width = '100%'
  }

  return (
    <div className="space-y-1">
      <div className="h-1.5 rounded-full bg-paper-300 dark:bg-ink-700 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-300`}
          style={{ width }}
        />
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  )
}
