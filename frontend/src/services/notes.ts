import { api } from './api'

export type NoteBlock = Record<string, unknown>

export interface NoteListItem {
  id: string
  title: string
  excerpt: string
  tag_ids: string[]
  updated_at: string
}

export interface NoteOut extends NoteListItem {
  body: string
  created_at: string
}

export interface NoteCreate {
  title?: string
  body?: string
  tag_ids?: string[]
}

export interface NoteUpdate {
  title?: string
  body?: string
  tag_ids?: string[]
}

const buildListParams = (tagIds?: string[]) => {
  if (!tagIds || tagIds.length === 0) return undefined
  const params = new URLSearchParams()
  for (const id of tagIds) params.append('tag_id', id)
  return params
}

export const getNotes = (tagIds?: string[]) =>
  api
    .get<NoteListItem[]>('/api/v1/notes', { params: buildListParams(tagIds) })
    .then((r) => r.data)

export const getNote = (id: string) =>
  api.get<NoteOut>(`/api/v1/notes/${id}`).then((r) => r.data)

export const createNote = (data: NoteCreate) =>
  api.post<NoteOut>('/api/v1/notes', data).then((r) => r.data)

export const updateNote = (id: string, data: NoteUpdate) =>
  api.patch<NoteOut>(`/api/v1/notes/${id}`, data).then((r) => r.data)

export const deleteNote = (id: string) => api.delete(`/api/v1/notes/${id}`)
