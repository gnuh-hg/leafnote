import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, initialized } = useAuthStore()

  if (!initialized || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper-50 dark:bg-ink-950">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}
