import type { Priority, Task, Urgency, Category } from '../data/types'
import { CATEGORIES, PRIORITIES, URGENCIES } from '../data/types'

export type SortKey = 'urgency' | 'priority' | 'category'

// Rank maps are derived from the canonical option-order arrays, so display order
// (Today → This week → Later, High → Medium → Low, Research → Personal → Firm)
// always matches the dropdowns and there is a single source of truth.
function rankMap<T extends string>(values: readonly T[]): Record<T, number> {
  return Object.fromEntries(values.map((v, i): [T, number] => [v, i])) as Record<T, number>
}

const URGENCY_RANK = rankMap<Urgency>(URGENCIES)
const PRIORITY_RANK = rankMap<Priority>(PRIORITIES)
const CATEGORY_RANK = rankMap<Category>(CATEGORIES)

const byUrgency = (a: Task, b: Task) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency]
const byPriority = (a: Task, b: Task) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
const byCategory = (a: Task, b: Task) => CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category]
// Open tasks first; completed tasks sink to the bottom (applied before every key).
const byCompleted = (a: Task, b: Task) => Number(a.completed) - Number(b.completed)
// Newest first, as the final stable tiebreaker.
const byNewest = (a: Task, b: Task) => b.created_at.localeCompare(a.created_at)

// Completion is always the primary split (open above completed). After that each
// sort key leads with its field and falls back through sensible secondaries so
// ordering is fully determined. The default key, "urgency", produces the spec's
// default ordering within each group: urgency, then priority, then newest.
const COMPARATORS: Record<SortKey, Array<(a: Task, b: Task) => number>> = {
  urgency: [byCompleted, byUrgency, byPriority, byNewest],
  priority: [byCompleted, byPriority, byUrgency, byNewest],
  category: [byCompleted, byCategory, byUrgency, byPriority, byNewest],
}

/**
 * Return a new array sorted by the given key (default: urgency). Pure — never
 * mutates its input. Completed tasks always sink below open ones, then are sorted
 * among themselves by the same key.
 */
export function sortTasks(tasks: Task[], key: SortKey = 'urgency'): Task[] {
  const comparators = COMPARATORS[key]
  return [...tasks].sort((a, b) => {
    for (const cmp of comparators) {
      const result = cmp(a, b)
      if (result !== 0) return result
    }
    return 0
  })
}
