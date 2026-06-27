import type { Task } from '../data/types'

let n = 0

/** Build a Task for tests. Override any field via `overrides`. */
export function makeTask(overrides: Partial<Task> = {}): Task {
  n += 1
  return {
    id: `id-${n}`,
    owner_id: 'owner-1',
    name: `Task ${n}`,
    priority: 'Medium',
    urgency: 'This week',
    category: 'Research',
    completed: false,
    completed_at: null,
    created_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}
