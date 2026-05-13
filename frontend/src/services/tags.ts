import { api } from './api'

export interface TagOut {
  id: string
  name: string
  color: string
  note_count: number
  access_count: number
  created_at: string
}

export interface TagCreate {
  name: string
  color: string
}

export interface TagUpdate {
  name?: string
  color?: string
}

export const COLOR_DOT: Record<string, string> = {
  amber: 'bg-amber-400',
  emerald: 'bg-emerald-400',
  sky: 'bg-sky-400',
  teal: 'bg-teal-400',
  rose: 'bg-rose-400',
  violet: 'bg-violet-400',
  orange: 'bg-orange-400',
  indigo: 'bg-indigo-400',
}

export const getTags = () => api.get<TagOut[]>('/api/v1/tags').then((r) => r.data)
export const createTag = (data: TagCreate) =>
  api.post<TagOut>('/api/v1/tags', data).then((r) => r.data)
export const updateTag = (id: string, data: TagUpdate) =>
  api.patch<TagOut>(`/api/v1/tags/${id}`, data).then((r) => r.data)
export const deleteTag = (id: string) => api.delete(`/api/v1/tags/${id}`)
export const trackTagAccess = (id: string) => api.post(`/api/v1/tags/${id}/access`)
