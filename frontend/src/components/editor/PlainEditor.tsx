import { useCallback, useEffect, useRef } from 'react'
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Mention from '@tiptap/extension-mention'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Markdown } from 'tiptap-markdown'
import { useTranslation } from 'react-i18next'
import tippy, { type Instance } from 'tippy.js'
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Mic,
  Image as ImageIcon,
  Link2,
  Sigma,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import NoteLinkList, { type NoteLinkListRef, type NoteItem } from './NoteLinkList'

interface Props {
  value: string
  onChange: (value: string) => void
  editable?: boolean
  placeholder?: string
  onRecord?: () => void
  onImage?: () => void
  notes?: NoteItem[]
}

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center w-9 h-9 rounded-md transition ${
        active
          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-paper-200 dark:hover:bg-ink-800'
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-paper-300/60 dark:bg-ink-700/60 mx-0.5 self-center" />
}

export default function PlainEditor({
  value,
  onChange,
  editable = true,
  placeholder = '',
  onRecord,
  onImage,
  notes = [],
}: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const lastMarkdown = useRef<string>(value)
  const isExternalUpdate = useRef(false)
  const notesRef = useRef<NoteItem[]>(notes)
  const insertAtLocked = useRef(false)

  // Keep notesRef in sync so the suggestion closure always sees fresh data
  useEffect(() => {
    notesRef.current = notes
  }, [notes])

  const buildSuggestion = useCallback(() => ({
    char: '@',
    allowSpaces: true,
    items: ({ query }: { query: string }) => {
      const q = query.toLowerCase()
      return notesRef.current
        .filter((n) => n.title.toLowerCase().includes(q))
        .slice(0, 8)
    },
    command: ({ editor, range, props }: { editor: { chain: () => unknown }; range: { from: number; to: number }; props: NoteItem }) => {
      // Insert as a real link (markdown-compatible round-trip)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(editor as any)
        .chain()
        .focus()
        .deleteRange(range)
        .setMark('link', { href: `/note/${props.id}`, target: '_self' })
        .insertContent(`@${props.title || 'Ghi chú'}`)
        .unsetMark('link')
        .insertContent(' ')
        .run()
    },
    render: () => {
      let component: ReactRenderer<NoteLinkListRef>
      let popup: Instance[]

      return {
        onStart: (props: object) => {
          component = new ReactRenderer(NoteLinkList, {
            props,
            editor: (props as { editor: NonNullable<ReturnType<typeof useEditor>> }).editor,
          })

          popup = tippy('body', {
            getReferenceClientRect: (props as { clientRect?: () => DOMRect }).clientRect ?? null,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
            theme: 'note-link',
          })
        },
        onUpdate: (props: object) => {
          component.updateProps(props)
          popup[0]?.setProps({
            getReferenceClientRect: (props as { clientRect?: () => DOMRect }).clientRect ?? null,
          })
        },
        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (props.event.key === 'Escape') {
            popup[0]?.hide()
            return true
          }
          return component.ref?.onKeyDown(props) ?? false
        },
        onExit: () => {
          popup[0]?.destroy()
          component.destroy()
        },
      }
    },
  }), [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({
        placeholder,
        emptyNodeClass: 'is-empty',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      Mention.configure({
        HTMLAttributes: { class: 'note-link-chip' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    suggestion: buildSuggestion() as any,
      }),
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
        },
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: false,
      }),
    ],
    content: value,
    editable,
    immediatelyRender: false,
    onUpdate({ editor }) {
      if (isExternalUpdate.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md = (editor.storage as any).markdown.getMarkdown() as string
      lastMarkdown.current = md
      onChange(md)
    },
  })

  // Sync external value changes (note hydration) without triggering onChange loop
  useEffect(() => {
    if (!editor) return
    if (value === lastMarkdown.current) return
    isExternalUpdate.current = true
    lastMarkdown.current = value
    editor.commands.setContent(value)
    isExternalUpdate.current = false
  }, [value, editor])

  // Sync editable flag
  useEffect(() => {
    if (!editor) return
    editor.setEditable(editable)
  }, [editable, editor])

  // Handle click on note links — use client-side navigation
  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href') ?? ''
      if (href.startsWith('/note/')) {
        e.preventDefault()
        navigate(href)
      }
    },
    [navigate],
  )

  if (!editor) return null

  return (
    <div className="leafnote-plain-editor" onClick={handleContainerClick}>
      {editable && (
        <div className="flex items-center gap-0.5 flex-wrap mb-3 pb-2 border-b border-paper-300/40 dark:border-ink-700/40">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title={t('editor.toolbar.heading1')}
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title={t('editor.toolbar.heading2')}
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title={t('editor.toolbar.heading3')}
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title={t('editor.toolbar.bold')}
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title={t('editor.toolbar.italic')}
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title={t('editor.toolbar.blockquote')}
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title={t('editor.toolbar.bulletList')}
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title={t('editor.toolbar.orderedList')}
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          <ToolbarButton
            onClick={() => {
              if (!editor || insertAtLocked.current) return
              insertAtLocked.current = true
              setTimeout(() => { insertAtLocked.current = false }, 600)

              // Focus editor, move to end if no selection, then insert @
              const { from, to } = editor.state.selection
              const isEmpty = from === to
              const isAtDoc = from === 1 && editor.state.doc.textContent.length === 0

              if (isAtDoc || !editor.isFocused) {
                // Move cursor to end then insert
                editor.chain().focus('end').insertContent('@').run()
              } else if (isEmpty) {
                editor.chain().focus().insertContent('@').run()
              } else {
                // Selection exists — collapse to end of selection, then insert
                editor.chain().focus().setTextSelection(to).insertContent('@').run()
              }
            }}
            title={t('editor.toolbar.noteLink')}
          >
            <Link2 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              if (!editor) return
              const { from, to } = editor.state.selection
              if (from === to) {
                editor.chain().focus().insertContent('$ $').setTextSelection(from + 1).run()
              } else {
                const content = editor.state.doc.textBetween(from, to)
                editor.chain().focus().insertContent(`$${content}$`).run()
              }
            }}
            title={t('editor.toolbar.latex')}
          >
            <Sigma className="w-4 h-4" />
          </ToolbarButton>

          {(onRecord || onImage) && <ToolbarSeparator />}

          {onRecord && (
            <ToolbarButton onClick={onRecord} title={t('editor.toolbar.record')}>
              <Mic className="w-4 h-4" />
            </ToolbarButton>
          )}
          {onImage && (
            <ToolbarButton onClick={onImage} title={t('editor.toolbar.image')}>
              <ImageIcon className="w-4 h-4" />
            </ToolbarButton>
          )}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
