import { describe, expect, it } from 'vitest'
import { filterTasks } from './filter'
import { makeTask } from '../test/makeTask'

describe('filterTasks', () => {
  const highTodayFirm = makeTask({ priority: 'High', urgency: 'Today', category: 'Firm' })
  const lowLaterResearch = makeTask({ priority: 'Low', urgency: 'Later', category: 'Research' })
  const medWeekPersonal = makeTask({ priority: 'Medium', urgency: 'This week', category: 'Personal' })
  const all = [highTodayFirm, lowLaterResearch, medWeekPersonal]

  it('returns everything when no filters are set', () => {
    expect(filterTasks(all, {})).toEqual(all)
  })

  it('filters by a single field', () => {
    expect(filterTasks(all, { priority: 'High' })).toEqual([highTodayFirm])
    expect(filterTasks(all, { category: 'Research' })).toEqual([lowLaterResearch])
  })

  it('combines multiple filters with AND', () => {
    expect(filterTasks(all, { urgency: 'Today', category: 'Firm' })).toEqual([highTodayFirm])
    expect(filterTasks(all, { urgency: 'Today', category: 'Research' })).toEqual([])
  })

  it('does not mutate its input', () => {
    const input = [...all]
    filterTasks(input, { priority: 'High' })
    expect(input).toEqual(all)
  })
})
