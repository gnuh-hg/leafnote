import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { FileText } from 'lucide-react'

export interface NoteItem {
  id: string
  title: string
}

interface Props {
  items: NoteItem[]
  command: (item: NoteItem) => void
}

export interface NoteLinkListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

const NoteLinkList = forwardRef<NoteLinkListRef, Props>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = items[index]
    if (item) command(item)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i + items.length - 1) % items.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % items.length)
        return true
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }))

  useEffect(() => setSelectedIndex(0), [items])

  if (!items.length) {
    return (
      <div className="note-link-dropdown">
        <div className="px-3 py-2 text-[12px] text-zinc-500 italic">Không tìm thấy ghi chú</div>
      </div>
    )
  }

  return (
    <div className="note-link-dropdown">
      {items.map((item, i) => (
        <button
          key={item.id}
          onMouseDown={(e) => {
            e.preventDefault()
            selectItem(i)
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] transition ${
            i === selectedIndex
              ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-100'
              : 'text-zinc-700 dark:text-zinc-200 hover:bg-paper-100 dark:hover:bg-ink-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          <span className="truncate">{item.title || 'Không có tiêu đề'}</span>
        </button>
      ))}
    </div>
  )
})

NoteLinkList.displayName = 'NoteLinkList'
export default NoteLinkList
