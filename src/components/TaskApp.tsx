import { useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useTasks } from '../hooks/useTasks'
import { filterTasks, type Filters } from '../logic/filter'
import { sortTasks, type SortKey } from '../logic/sort'
import type { Task, TaskInput } from '../data/types'
import { Controls } from './Controls'
import { TaskList } from './TaskList'
import { TaskModal } from './TaskModal'

type ModalState = { open: false } | { open: true; editing: Task | null }

export function TaskApp({ session }: { session: Session }) {
  const { tasks, loading, error, reload, addTask, editTask, toggleComplete, removeTask } = useTasks()
  const [sortKey, setSortKey] = useState<SortKey>('urgency')
  const [filters, setFilters] = useState<Filters>({})
  const [modal, setModal] = useState<ModalState>({ open: false })
  const [actionError, setActionError] = useState<string | null>(null)

  const visible = useMemo(
    () => sortTasks(filterTasks(tasks, filters), sortKey),
    [tasks, filters, sortKey],
  )

  async function handleSubmit(input: TaskInput) {
    if (modal.open && modal.editing) await editTask(modal.editing.id, input)
    else await addTask(input)
  }

  async function handleToggle(task: Task) {
    setActionError(null)
    try {
      await toggleComplete(task)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not update the task.')
    }
  }

  async function handleDelete(id: string) {
    setActionError(null)
    try {
      await removeTask(id)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not delete the task.')
    }
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">To-Do</h1>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="hidden sm:inline">{session.user.email}</span>
            <button
              type="button"
              onClick={() => void supabase.auth.signOut()}
              className="rounded-md px-2 py-1 font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <Controls
          sortKey={sortKey}
          onSortChange={setSortKey}
          filters={filters}
          onFiltersChange={setFilters}
          onAdd={() => setModal({ open: true, editing: null })}
        />

        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <span>Couldn’t load your tasks: {error}</span>
            <button
              type="button"
              onClick={() => void reload()}
              className="shrink-0 font-medium underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {actionError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {actionError}
          </div>
        )}

        <TaskList
          tasks={visible}
          loading={loading}
          totalCount={tasks.length}
          onToggle={handleToggle}
          onEdit={(task) => setModal({ open: true, editing: task })}
          onDelete={handleDelete}
        />
      </main>

      {modal.open && (
        <TaskModal
          initial={modal.editing}
          onSubmit={handleSubmit}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  )
}
