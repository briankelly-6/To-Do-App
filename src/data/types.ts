// Task types and the three fixed option sets.
// The option sets are fixed (not user-editable); each maps to a TS string union,
// and the same arrays drive the dropdowns and the sort/filter ordering.

export const PRIORITIES = ['High', 'Medium', 'Low'] as const
export const URGENCIES = ['Today', 'This week', 'Later'] as const
export const CATEGORIES = ['Research', 'Personal', 'Firm'] as const

export type Priority = (typeof PRIORITIES)[number]
export type Urgency = (typeof URGENCIES)[number]
export type Category = (typeof CATEGORIES)[number]

/** A task row exactly as stored in Supabase. */
export interface Task {
  id: string
  /** The authenticated user who owns the task (v1: always the single user). */
  owner_id: string
  name: string
  priority: Priority
  urgency: Urgency
  category: Category
  completed: boolean
  /** ISO timestamp set when completed, cleared (null) when un-completed. */
  completed_at: string | null
  created_at: string
}

/** The user-editable fields, shared by the add and edit flows. */
export interface TaskInput {
  name: string
  priority: Priority
  urgency: Urgency
  category: Category
}

/** Defaults pre-filled in the add modal's three dropdowns. */
export const DEFAULTS = {
  priority: 'Medium',
  urgency: 'This week',
  category: 'Research',
} as const satisfies Omit<TaskInput, 'name'>
