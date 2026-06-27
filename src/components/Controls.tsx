import type { ReactNode } from 'react'
import { CATEGORIES, PRIORITIES, URGENCIES } from '../data/types'
import type { Filters } from '../logic/filter'
import type { SortKey } from '../logic/sort'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'urgency', label: 'Urgency (default)' },
  { value: 'priority', label: 'Priority' },
  { value: 'category', label: 'Category' },
]

const selectClasses =
  'rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      <span>{label}</span>
      {children}
    </label>
  )
}

/** A filter dropdown whose blank option ("All") clears the constraint for that field. */
function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T | undefined
  options: readonly T[]
  onChange: (value: T | undefined) => void
}) {
  return (
    <Field label={label}>
      <select
        className={selectClasses}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : (e.target.value as T))}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function Controls({
  sortKey,
  onSortChange,
  filters,
  onFiltersChange,
  onAdd,
}: {
  sortKey: SortKey
  onSortChange: (key: SortKey) => void
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onAdd: () => void
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end gap-3">
      <Field label="Sort by">
        <select
          className={selectClasses}
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <FilterSelect
        label="Priority"
        value={filters.priority}
        options={PRIORITIES}
        onChange={(priority) => onFiltersChange({ ...filters, priority })}
      />
      <FilterSelect
        label="Urgency"
        value={filters.urgency}
        options={URGENCIES}
        onChange={(urgency) => onFiltersChange({ ...filters, urgency })}
      />
      <FilterSelect
        label="Category"
        value={filters.category}
        options={CATEGORIES}
        onChange={(category) => onFiltersChange({ ...filters, category })}
      />

      <button
        type="button"
        onClick={onAdd}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 sm:ml-auto sm:w-auto"
      >
        + Add task
      </button>
    </div>
  )
}
