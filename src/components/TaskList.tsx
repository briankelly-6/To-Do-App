import type { Task } from '../data/types'
import { TaskRow } from './TaskRow'

function Empty({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
      {children}
    </div>
  )
}

export function TaskList({
  tasks,
  loading,
  totalCount,
  onToggle,
  onEdit,
  onDelete,
}: {
  tasks: Task[]
  loading: boolean
  totalCount: number
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}) {
  if (loading && totalCount === 0) return <Empty>Loading…</Empty>
  if (totalCount === 0) return <Empty>No tasks yet — add your first one.</Empty>
  if (tasks.length === 0) return <Empty>No tasks match these filters.</Empty>

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  )
}
