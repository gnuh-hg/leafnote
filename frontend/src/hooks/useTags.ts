import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import * as tagService from '../services/tags'
import type { TagOut } from '../services/tags'
import { useToastStore } from '../stores/toastStore'
import { useAuthStore } from '../stores/authStore'

export function useTags() {
  const session = useAuthStore((s) => s.session)
  return useQuery({
    queryKey: ['tags'],
    queryFn: tagService.getTags,
    enabled: !!session,
    // Tags rarely change; treat cache as fresh for 5 minutes to avoid refetch
    // storms on every window focus. Cached data still shows if a background
    // refetch fails — `isError` doesn't wipe the list.
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: (count, err: { response?: { status?: number } }) =>
      err?.response?.status == null && count < 2,
  })
}

export function useCreateTag() {
  const qc = useQueryClient()
  const { addToast } = useToastStore()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: tagService.createTag,
    networkMode: 'offlineFirst',
    retry: (count, err: { response?: { status?: number } }) =>
      err?.response?.status == null && count < 3,
    onMutate: async (newTag) => {
      await qc.cancelQueries({ queryKey: ['tags'] })
      const previous = qc.getQueryData<TagOut[]>(['tags'])
      const tmpId = `tmp-${Date.now()}`
      qc.setQueryData<TagOut[]>(['tags'], (old = []) => [
        ...old,
        { id: tmpId, ...newTag, note_count: 0, access_count: 0, created_at: new Date().toISOString() },
      ])
      return { previous }
    },
    onError: (err: { response?: { status?: number } }, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['tags'], ctx.previous)
      if (err.response?.status === 409) addToast('error', t('toast.error.tagDuplicate'))
      else addToast('error', t('toast.error.generic'))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  })
}

export function useUpdateTag() {
  const qc = useQueryClient()
  const { addToast } = useToastStore()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: tagService.TagUpdate }) =>
      tagService.updateTag(id, data),
    networkMode: 'offlineFirst',
    retry: (count, err: { response?: { status?: number } }) =>
      err?.response?.status == null && count < 3,
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['tags'] })
      const previous = qc.getQueryData<TagOut[]>(['tags'])
      qc.setQueryData<TagOut[]>(['tags'], (old = []) =>
        old.map((tag) => (tag.id === id ? { ...tag, ...data } : tag))
      )
      return { previous }
    },
    onError: (err: { response?: { status?: number } }, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['tags'], ctx.previous)
      if (err.response?.status === 409) addToast('error', t('toast.error.tagDuplicate'))
      else addToast('error', t('toast.error.generic'))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  })
}

export function useDeleteTag() {
  const qc = useQueryClient()
  const { addToast } = useToastStore()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: tagService.deleteTag,
    networkMode: 'offlineFirst',
    retry: (count, err: { response?: { status?: number } }) =>
      err?.response?.status == null && count < 3,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['tags'] })
      const previous = qc.getQueryData<TagOut[]>(['tags'])
      qc.setQueryData<TagOut[]>(['tags'], (old = []) => old.filter((tag) => tag.id !== id))
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['tags'], ctx.previous)
      addToast('error', t('toast.error.generic'))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  })
}

export function useTrackTagAccess() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tagService.trackTagAccess,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  })
}
