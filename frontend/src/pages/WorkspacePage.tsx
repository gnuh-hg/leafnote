import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getMe } from '../services/me'

export default function WorkspacePage() {
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: getMe })

  const handleLogout = () => supabase.auth.signOut()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-900">Leafnote</span>
        <div className="flex items-center gap-4">
          {me && <span className="text-sm text-gray-500">{me.email}</span>}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Workspace — coming soon (M2)</p>
      </main>
    </div>
  )
}
