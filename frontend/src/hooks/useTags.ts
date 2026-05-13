import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import * as tagService from '../services/tags'
import { useToastStore } from '../stores/toastStore'
import { useAuthStore } from '../stores/authStore'

export function useTags() {
  const session = useAuthStore((s) => s.session)
  return useQuery({
    queryKey: ['tags'],
    queryFn: tagService.getTags,
    enabled: !!session,
  })
}

export function useCreateTag() {
  const qc = useQueryClient()
  const { addToast } = useToastStore()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: tagService.createTag,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
    onError: (err: { response?: { status?: number } }) => {
      if (err.response?.status === 409) addToast('error', t('toast.error.tagDuplicate'))
      else addToast('error', t('toast.error.generic'))
    },
  })
}

export function useUpdateTag() {
  const qc = useQueryClient()
  const { addToast } = useToastStore()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: tagService.TagUpdate }) =>
      tagService.updateTag(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
    onError: (err: { response?: { status?: number } }) => {
      if (err.response?.status === 409) addToast('error', t('toast.error.tagDuplicate'))
      else addToast('error', t('toast.error.generic'))
    },
  })
}

export function useDeleteTag() {
  const qc = useQueryClient()
  const { addToast } = useToastStore()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: tagService.deleteTag,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
    onError: () => addToast('error', t('toast.error.generic')),
  })
}

export function useTrackTagAccess() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tagService.trackTagAccess,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  })
}
