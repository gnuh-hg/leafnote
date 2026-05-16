import { api } from './api'

export type LeafType = 'definition' | 'fact' | 'example' | 'question' | 'note'

export const LEAF_TYPES: LeafType[] = [
  'definition',
  'fact',
  'example',
  'question',
  'note',
]

export interface LeafOut {
  id: string
  note_id: string
  type: LeafType
  content: string
  metadata: Record<string, unknown>
  confidence: number
  user_edited: boolean
  created_at: string
  updated_at: string
}

export interface LeafUpdate {
  type?: LeafType
  content?: string
  metadata?: Record<string, unknown>
}

export interface QualityReport {
  coverage: number
  atomicity: number
  no_duplicate: number
  type_valid: number
  granularity_floor: number
  total: number
  issues: string[]
}

export interface RegenerateResponse {
  leaves: LeafOut[]
  quality: QualityReport
  retried: boolean
}

export const getLeaves = (noteId: string) =>
  api.get<LeafOut[]>(`/api/v1/notes/${noteId}/leaves`).then((r) => r.data)

export const regenerateLeaves = (noteId: string) =>
  api
    .post<RegenerateResponse>(`/api/v1/notes/${noteId}/leaves/regenerate`)
    .then((r) => r.data)

export const updateLeaf = (leafId: string, data: LeafUpdate) =>
  api.patch<LeafOut>(`/api/v1/leaves/${leafId}`, data).then((r) => r.data)

export const deleteLeaf = (leafId: string) =>
  api.delete(`/api/v1/leaves/${leafId}`)

export const submitLeafFeedback = (leafId: string, rating: 'up' | 'down') =>
  api.post(`/api/v1/leaves/${leafId}/feedback`, { rating })
