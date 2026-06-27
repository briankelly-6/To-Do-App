import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  CATEGORIES,
  DEFAULTS,
  PRIORITIES,
  URGENCIES,
  type Task,
  type TaskInput,
} from '../data/types'

function initialForm(task: Task | null): TaskInput {
  if (task) {
    return { name: task.name, priority: task.priority, urgency: task.urgency, category: task.category }
  }
  return { name: '', ...DEFAULTS }
}

const fieldClasses =
  'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200'

/**
 * Add/edit modal. Editing pre-fills from the task and saving closes the modal.
 * Adding pre-fills the three dropdowns with the defaults; on save it stays open
 * with the name cleared and refocused, so several tasks can be added quickly
 * (type a name, press Enter, repeat). Esc / backdrop / Done closes it.
 */
export function TaskModal({
  initial,
  onSubmit,
  onClose,
}: {
  initial: Task | null
  onSubmit: (input: TaskInput) => Promise<void>
  onClose: () => void
}) {
  const isEdit = initial !== null
  const [form, setForm] = useState<TaskInput>(() => initialForm(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const canSave = form.name.trim().length > 0 && !saving

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ ...form, name: form.name.trim() })
      if (isEdit) {
        onClose()
      } else {
        // Quick-add: keep going without reopening the modal.
        setForm((f) => ({ ...f, name: '' }))
        setAdded(true)
        nameRef.current?.focus()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit task' : 'Add task'}
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-slate-900">{isEdit ? 'Edit task' : 'Add task'}</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="task-name" className="mb-1 block text-xs font-medium text-slate-500">
              Name
            </label>
            <input
              id="task-name"
              ref={nameRef}
              autoFocus
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }))
                setAdded(false)
              }}
              placeholder="What needs doing?"
              className={fieldClasses}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="task-priority" className="mb-1 block text-xs font-medium text-slate-500">
                Priority
              </label>
              <select
                id="task-priority"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskInput['priority'] }))}
                className={fieldClasses}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-urgency" className="mb-1 block text-xs font-medium text-slate-500">
                Urgency
              </label>
              <select
                id="task-urgency"
                value={form.urgency}
                onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value as TaskInput['urgency'] }))}
                className={fieldClasses}
              >
                {URGENCIES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-category" className="mb-1 block text-xs font-medium text-slate-500">
                Category
              </label>
              <select
                id="task-category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TaskInput['category'] }))}
                className={fieldClasses}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {added && !error && (
            <p className="text-sm text-emerald-600">Added — add another, or press Esc to close.</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              {isEdit ? 'Cancel' : 'Done'}
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-60"
            >
              {isEdit ? 'Save' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
