import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import * as leafService from '../services/leaves'
import type { LeafOut, LeafUpdate, RegenerateResponse } from '../services/leaves'
import { useAuthStore } from '../stores/authStore'
import { useToastStore } from '../stores/toastStore'

export function useLeaves(noteId: string | undefined) {
  const session = useAuthStore((s) => s.session)
  return useQuery({
    queryKey: ['leaves', noteId],
    queryFn: () => leafService.getLeaves(noteId as string),
    enabled: !!session && !!noteId,
    staleTime: 60 * 1000,
    retry: (count, err: { response?: { status?: number } }) =>
      err?.response?.status == null && count < 2,
  })
}

export function useRegenerateLeaves(noteId: string | undefined) {
  const qc = useQueryClient()
  const { addToast } = useToastStore()
  const { t } = useTranslation()

  return useMutation<RegenerateResponse, unknown, void>({
    mutationFn: () => leafService.regenerateLeaves(noteId as string),
    networkMode: 'online',
    onSuccess: (data) => {
      if (noteId) qc.setQueryData(['leaves', noteId], data.leaves)
      if (data.retried) {
        addToast('info', t('toast.engine.retried'))
      }
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 422) {
        addToast('warning', t('toast.engine.lowQuality'))
      } else if (status === 502) {
        addToast('error', t('toast.engine.unavailable'))
      } else {
        addToast('error', t('toast.error.generic'))
      }
    },
    onSettled: () => {
      if (noteId) qc.invalidateQueries({ queryKey: ['leaves', noteId] })
    },
  })
}

export function useUpdateLeaf(noteId: string | undefined) {
  const qc = useQueryClient()
  const { addToast } = useToastStore()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LeafUpdate }) =>
      leafService.updateLeaf(id, data),
    networkMode: 'offlineFirst',
    retry: (count, err: { response?: { status?: number } }) =>
      err?.response?.status == null && count < 3,
    onMutate: async ({ id, data }) => {
      if (!noteId) return
      await qc.cancelQueries({ queryKey: ['leaves', noteId] })
      const previous = qc.getQueryData<LeafOut[]>(['leaves', noteId])
      if (previous) {
        qc.setQueryData<LeafOut[]>(
          ['leaves', noteId],
          previous.map((l) =>
            l.id === id
              ? {
                  ...l,
                  ...(data.type !== undefined ? { type: data.type } : {}),
                  ...(data.content !== undefined ? { content: data.content } : {}),
                  ...(data.metadata !== undefined ? { metadata: data.metadata } : {}),
                  user_edited: true,
                  updated_at: new Date().toISOString(),
                }
              : l,
          ),
        )
      }
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous && noteId) qc.setQueryData(['leaves', noteId], ctx.previous)
      addToast('error', t('toast.error.generic'))
    },
    onSettled: () => {
      if (noteId) qc.invalidateQueries({ queryKey: ['leaves', noteId] })
    },
  })
}

export function useDeleteLeaf(noteId: string | undefined) {
  const qc = useQueryClient()
  const { addToast } = useToastStore()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => leafService.deleteLeaf(id),
    networkMode: 'offlineFirst',
    onMutate: async (id) => {
      if (!noteId) return
      await qc.cancelQueries({ queryKey: ['leaves', noteId] })
      const previous = qc.getQueryData<LeafOut[]>(['leaves', noteId])
      if (previous) {
        qc.setQueryData<LeafOut[]>(['leaves', noteId], previous.filter((l) => l.id !== id))
      }
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous && noteId) qc.setQueryData(['leaves', noteId], ctx.previous)
      addToast('error', t('toast.error.generic'))
    },
    onSettled: () => {
      if (noteId) qc.invalidateQueries({ queryKey: ['leaves', noteId] })
    },
  })
}

export function useLeafFeedback() {
  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: 'up' | 'down' }) =>
      leafService.submitLeafFeedback(id, rating),
  })
}
