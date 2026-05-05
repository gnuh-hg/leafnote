import { api } from './api'

export interface Me {
  id: string
  email: string
}

export const getMe = (): Promise<Me> =>
  api.get<Me>('/v1/me').then((r) => r.data)
