import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import { supabase } from './lib/supabase'
import AuthPage from './pages/AuthPage'
import WorkspacePage from './pages/WorkspacePage'

function App() {
  const { session, setSession } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [setSession])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={session ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/*" element={session ? <WorkspacePage /> : <Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
