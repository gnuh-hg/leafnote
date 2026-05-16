import { useTranslation } from 'react-i18next'
import { DOCUMENT_TYPES, type DocumentType } from '../services/notes'

interface Props {
  value: DocumentType
  onChange: (value: DocumentType) => void
  disabled?: boolean
}

export default function DocumentTypePicker({ value, onChange, disabled }: Props) {
  const { t } = useTranslation()
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DocumentType)}
      disabled={disabled}
      className="px-2 py-1 rounded-md text-[11.5px] bg-paper-100 dark:bg-ink-850 border border-paper-300/60 dark:border-ink-700/60 text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500/40 disabled:opacity-50"
      aria-label={t('editor.documentType.label')}
    >
      {DOCUMENT_TYPES.map((dt) => (
        <option key={dt} value={dt}>
          {t(`editor.documentType.${dt}`)}
        </option>
      ))}
    </select>
  )
}
