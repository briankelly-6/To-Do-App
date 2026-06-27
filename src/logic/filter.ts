import type { Category, Priority, Task, Urgency } from '../data/types'

/** Active filters. A field left undefined means "All" — no constraint on that field. */
export interface Filters {
  priority?: Priority
  urgency?: Urgency
  category?: Category
}

/** Return only the tasks matching every active filter (AND). Pure — never mutates. */
export function filterTasks(tasks: Task[], filters: Filters): Task[] {
  return tasks.filter(
    (t) =>
      (filters.priority === undefined || t.priority === filters.priority) &&
      (filters.urgency === undefined || t.urgency === filters.urgency) &&
      (filters.category === undefined || t.category === filters.category),
  )
}
