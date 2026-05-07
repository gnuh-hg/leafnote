import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './pages/Dashboard'
import NotesList from './pages/NotesList'
import NoteEditor from './pages/NoteEditor'
import KnowledgeGraph from './pages/KnowledgeGraph'
import ReviewFeed from './pages/ReviewFeed'
import Insights from './pages/Insights'

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notes" element={<NotesList />} />
            <Route path="/note/:id" element={<NoteEditor />} />
            <Route path="/graph" element={<KnowledgeGraph />} />
            <Route path="/review" element={<ReviewFeed />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
