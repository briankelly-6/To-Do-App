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
// Newest first, as the final stable tiebreaker.
const byNewest = (a: Task, b: Task) => b.created_at.localeCompare(a.created_at)

// Each sort key leads with its field, then falls back through sensible secondaries
// so ordering is always fully determined. The default key, "urgency", produces the
// spec's default ordering: urgency, then priority, then newest.
const COMPARATORS: Record<SortKey, Array<(a: Task, b: Task) => number>> = {
  urgency: [byUrgency, byPriority, byNewest],
  priority: [byPriority, byUrgency, byNewest],
  category: [byCategory, byUrgency, byPriority, byNewest],
}

/**
 * Return a new array sorted by the given key (default: urgency). Pure — never
 * mutates its input. Completed tasks are sorted in their natural position
 * (they are not moved to the bottom); they're only styled differently in the UI.
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
