import { supabase } from '../lib/supabase'
import { cutoffISO } from '../logic/cleanup'
import type { Task, TaskInput } from './types'

// ── The single data-access module ──────────────────────────────────────────
// This is the ONLY place that talks to Supabase for task data. UI code calls
// these functions and never touches the client directly. Keeping every read and
// write behind this boundary is what lets us add offline support — or broaden to
// multi-user scopes — later without changing any components.

const TABLE = 'tasks'

// Selected explicitly (rather than '*') to document the row shape and stay stable
// if the table gains columns later.
const COLUMNS =
  'id, owner_id, name, priority, urgency, category, completed, completed_at, created_at'

/** Load every task visible to the current user (v1: their own, newest first). */
export async function listTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Task[]
}

/** Create a task. owner_id is filled server-side from auth.uid() (table default). */
export async function createTask(input: TaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: input.name.trim(),
      priority: input.priority,
      urgency: input.urgency,
      category: input.category,
    })
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data as Task
}

/** Update a task's editable fields (name + the three dropdowns). */
export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      name: input.name.trim(),
      priority: input.priority,
      urgency: input.urgency,
      category: input.category,
    })
    .eq('id', id)
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data as Task
}

/** Toggle completion: stamp completed_at when completing, clear it when un-completing. */
export async function setCompleted(id: string, completed: boolean): Promise<Task> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data as Task
}

/** Permanently delete a task. */
export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

/**
 * "Cleanup-on-load" implementation of the 7-day auto-removal rule: permanently
 * delete completed tasks whose completion is older than the retention window
 * (see logic/cleanup.ts). Called once when the app loads. Returns how many were
 * removed. Tasks with a null completed_at are never matched.
 */
export async function purgeExpired(now: Date = new Date()): Promise<number> {
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq('completed', true)
    .lte('completed_at', cutoffISO(now))
    .select('id')
  if (error) throw error
  return data?.length ?? 0
}
