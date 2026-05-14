import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

// Dev: VITE_API_URL unset → relative path → Vite proxy handles CORS-free forwarding to localhost:8000
// Prod: VITE_API_URL set in Vercel dashboard → absolute URL to Render backend
const baseURL = import.meta.env.VITE_API_URL ?? ''

export const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const session = useAuthStore.getState().session
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})
