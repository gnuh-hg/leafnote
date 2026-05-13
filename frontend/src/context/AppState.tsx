import { createContext, useContext } from 'react'

interface AppStateContextValue {
  _placeholder: null
}

const AppStateContext = createContext<AppStateContextValue>({ _placeholder: null })

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppStateContext.Provider value={{ _placeholder: null }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  return useContext(AppStateContext)
}
