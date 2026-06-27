import type { Task } from '../data/types'

// The 7-day auto-removal rule, expressed as pure functions so it is trivial to
// unit-test and reuse. The actual deletion runs in data/tasks.ts (purgeExpired),
// which uses cutoffISO() to build a server-side delete on app load.

/** Completed tasks are permanently removed this many days after completion. */
export const RETENTION_DAYS = 7

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * The retention cutoff for a given "now": a completed task is expired once its
 * completed_at is at or before this timestamp. Postgres parses this ISO string as
 * a timestamptz, so the comparison in purgeExpired is a true time comparison.
 */
export function cutoffISO(now: Date): string {
  return new Date(now.getTime() - RETENTION_DAYS * DAY_MS).toISOString()
}

/** True if the task is completed and was completed at least RETENTION_DAYS ago. */
export function isExpired(
  task: Pick<Task, 'completed' | 'completed_at'>,
  now: Date,
): boolean {
  if (!task.completed || !task.completed_at) return false
  const completedAt = new Date(task.completed_at).getTime()
  return now.getTime() - completedAt >= RETENTION_DAYS * DAY_MS
}
