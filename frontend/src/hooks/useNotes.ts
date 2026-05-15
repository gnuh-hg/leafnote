import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import * as noteService from '../services/notes'
import type { NoteListItem, NoteOut, NoteUpdate } from '../services/notes'
import { useToastStore } from '../stores/toastStore'
import { useAuthStore } from '../stores/authStore'

export function useNotes(tagIds: string[] = []) {
  const session = useAuthStore((s) => s.session)
  const sortedTagIds = [...tagIds].sort()
  return useQuery({
    queryKey: ['notes', sortedTagIds],
    queryFn: () => noteService.getNotes(sortedTagIds),
    enabled: !!session,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (count, err: { response?: { status?: number } }) =>
      err?.response?.status == null && count < 2,
  })
}

export function useNote(id: string | undefined) {
  const session = useAuthStore((s) => s.session)
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => noteService.getNote(id as string),
    enabled: !!session && !!id,
    staleTime: 2 * 60 * 1000,
    retry: (count, err: { response?: { status?: number } }) =>
      err?.response?.status == null && count < 2,
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  const { addToast } = useToastStore()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: noteService.createNote,
    onSuccess: (note) => {
      qc.setQueryData(['note', note.id], note)
      qc.invalidateQueries({ queryKey: ['notes'] })
    },
    onError: () => addToast('error', t('toast.error.generic')),
  })
}

export function useUpdateNote(id: string | undefined) {
  const qc = useQueryClient()
  const { addToast } = useToastStore()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: NoteUpdate) => noteService.updateNote(id as string, data),
    networkMode: 'offlineFirst',
    retry: (count, err: { response?: { status?: number } }) =>
      err?.response?.status == null && count < 3,
    onMutate: async (data) => {
      if (!id) return
      await qc.cancelQueries({ queryKey: ['note', id] })
      const previous = qc.getQueryData<NoteOut>(['note', id])
      if (previous) {
        qc.setQueryData<NoteOut>(['note', id], {
          ...previous,
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.body !== undefined ? { body: data.body } : {}),
          ...(data.tag_ids !== undefined ? { tag_ids: data.tag_ids } : {}),
          updated_at: new Date().toISOString(),
        })
      }
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous && id) qc.setQueryData(['note', id], ctx.previous)
      addToast('error', t('toast.error.generic'))
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['notes'] })
      if (id) qc.invalidateQueries({ queryKey: ['note', id] })
    },
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  const { addToast } = useToastStore()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: noteService.deleteNote,
    onMutate: async (deletedId) => {
      await qc.cancelQueries({ queryKey: ['notes'] })
      const snapshots = qc.getQueriesData<NoteListItem[]>({ queryKey: ['notes'] })
      for (const [key, value] of snapshots) {
        if (value) qc.setQueryData<NoteListItem[]>(key, value.filter((n) => n.id !== deletedId))
      }
      return { snapshots }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshots) {
        for (const [key, value] of ctx.snapshots) qc.setQueryData(key, value)
      }
      addToast('error', t('toast.error.generic'))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })
}
