import { useAuth } from './hooks/useAuth'
import { Login } from './components/Login'
import { TaskApp } from './components/TaskApp'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center text-sm text-slate-400">Loading…</div>
    )
  }

  if (!session) {
    return <Login />
  }

  return <TaskApp session={session} />
}
