import { useCallback, useEffect, useState } from 'react'
import * as api from '../data/tasks'
import type { Task, TaskInput } from '../data/types'

export interface UseTasks {
  tasks: Task[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  addTask: (input: TaskInput) => Promise<void>
  editTask: (id: string, input: TaskInput) => Promise<void>
  toggleComplete: (task: Task) => Promise<void>
}

function messageOf(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong.'
}

/**
 * Owns the in-memory task list and orchestrates the data-access module.
 * Mutations update local state from the row the server returns (no full refetch),
 * so the UI stays in sync without extra round-trips. Mutation errors propagate to
 * the caller so the relevant UI (e.g. the modal) can show them.
 */
export function useTasks(): UseTasks {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Cleanup-on-load: remove completed tasks past the 7-day window, then fetch.
      await api.purgeExpired()
      setTasks(await api.listTasks())
    } catch (e) {
      setError(messageOf(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const addTask = useCallback(async (input: TaskInput) => {
    const created = await api.createTask(input)
    setTasks((prev) => [created, ...prev])
  }, [])

  const editTask = useCallback(async (id: string, input: TaskInput) => {
    const updated = await api.updateTask(id, input)
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }, [])

  const toggleComplete = useCallback(async (task: Task) => {
    const updated = await api.setCompleted(task.id, !task.completed)
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
  }, [])

  return { tasks, loading, error, reload, addTask, editTask, toggleComplete }
}
