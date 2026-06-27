import type { Priority, Task } from '../data/types'

const priorityPill: Record<Priority, string> = {
  High: 'bg-red-50 text-red-700',
  Medium: 'bg-amber-50 text-amber-700',
  Low: 'bg-slate-100 text-slate-600',
}

function Pill({ className = 'bg-slate-100 text-slate-600', children }: { className?: string; children: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>
  )
}

export function TaskRow({
  task,
  onToggle,
  onEdit,
}: {
  task: Task
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
}) {
  const { completed } = task

  return (
    <li className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <button
        type="button"
        role="checkbox"
        aria-checked={completed}
        aria-label={completed ? 'Mark as not done' : 'Mark as done'}
        onClick={() => onToggle(task)}
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${
          completed
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        {completed && (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
            <path
              d="M3.5 8.5l3 3 6-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <button
        type="button"
        onClick={() => onEdit(task)}
        className="min-w-0 flex-1 text-left"
        aria-label={`Edit ${task.name}`}
      >
        <span
          className={
            completed
              ? 'block truncate text-slate-400 line-through decoration-red-500 decoration-2'
              : 'block truncate text-slate-900'
          }
        >
          {task.name}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <Pill className={priorityPill[task.priority]}>{task.priority}</Pill>
          <Pill>{task.urgency}</Pill>
          <Pill>{task.category}</Pill>
        </span>
      </button>
    </li>
  )
}
