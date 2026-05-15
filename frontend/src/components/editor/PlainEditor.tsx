import { useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorView } from '@codemirror/view'
import { useTheme } from '../../context/ThemeContext'

interface Props {
  value: string
  onChange: (value: string) => void
  editable?: boolean
  placeholder?: string
}

export default function PlainEditor({
  value,
  onChange,
  editable = true,
  placeholder = '',
}: Props) {
  const { isDark } = useTheme()

  const handleChange = useCallback(
    (val: string) => {
      onChange(val)
    },
    [onChange],
  )

  const theme = EditorView.theme({
    '&': {
      fontSize: '16px',
      height: 'auto',
      minHeight: '300px',
      backgroundColor: 'transparent !important',
    },
    '&.cm-editor': {
      backgroundColor: 'transparent !important',
    },
    '.cm-content': {
      fontFamily: 'Cormorant Garamond, serif',
      lineHeight: '1.85',
      padding: '0',
      backgroundColor: 'transparent !important',
    },
    '.cm-scroller': {
      fontFamily: 'inherit',
      overflow: 'visible',
    },
    '.cm-gutters': {
      display: 'none',
    },
    '&.cm-focused': {
      outline: 'none',
    },
    '.cm-line': {
      padding: '0',
    },
    '.cm-placeholder': {
      color: isDark ? '#3d3d4f' : '#a1a1aa',
      fontStyle: 'normal',
    },
  })

  return (
    <div className="leafnote-plain-editor">
      <CodeMirror
        value={value}
        height="auto"
        theme={isDark ? 'dark' : 'light'}
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          theme,
          EditorView.lineWrapping,
        ]}
        onChange={handleChange}
        editable={editable}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLine: false,
          crosshairCursor: false,
          dropCursor: false,
        }}
      />
    </div>
  )
}
