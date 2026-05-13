import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
  console.warn('VITE_API_URL is not defined, falling back to localhost:8000')
}

export const api = axios.create({
  baseURL: baseURL || 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  const session = useAuthStore.getState().session
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})
