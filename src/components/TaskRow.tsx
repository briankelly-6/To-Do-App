import { useState } from 'react'
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
  onDelete,
}: {
  task: Task
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}) {
  const { completed } = task
  const [confirming, setConfirming] = useState(false)

  return (
    <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:items-center">
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
        title={task.name}
        className="flex min-w-0 flex-1 flex-col gap-1 text-left sm:flex-row sm:items-center sm:gap-3"
        aria-label={`Edit ${task.name}`}
      >
        <span
          className={
            completed
              ? 'min-w-0 max-w-full truncate text-slate-400 line-through decoration-red-500 decoration-2 sm:flex-1'
              : 'min-w-0 max-w-full truncate text-slate-900 sm:flex-1'
          }
        >
          {task.name}
        </span>
        <span className="flex shrink-0 flex-wrap items-center gap-1.5">
          <Pill className={priorityPill[task.priority]}>{task.priority}</Pill>
          <Pill>{task.urgency}</Pill>
          <Pill>{task.category}</Pill>
        </span>
      </button>

      {confirming ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-red-700"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`Delete ${task.name}`}
          className="shrink-0 rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
            <path
              d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m1 0v12a1 1 0 01-1 1H8a1 1 0 01-1-1V7m3 4v5m4-5v5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </li>
  )
}
