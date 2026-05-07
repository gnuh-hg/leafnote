import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  initialize: () => Promise<void>
  setSession: (session: Session | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data } = await supabase.auth.getSession()
      set({
        session: data.session,
        user: data.session?.user ?? null,
        loading: false,
        initialized: true,
      })

      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
        })
      })
    } catch {
      set({ loading: false, initialized: true })
    }
  },

  setSession: (session) =>
    set({ session, user: session?.user ?? null }),

  clearAuth: () =>
    set({ user: null, session: null }),
}))
