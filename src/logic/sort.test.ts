import { describe, expect, it } from 'vitest'
import { sortTasks } from './sort'
import { makeTask } from '../test/makeTask'

describe('sortTasks', () => {
  it('default (urgency) orders by urgency band, then priority within it', () => {
    const later = makeTask({ urgency: 'Later', priority: 'High' })
    const week = makeTask({ urgency: 'This week', priority: 'Medium' })
    const todayLow = makeTask({ urgency: 'Today', priority: 'Low' })
    const todayHigh = makeTask({ urgency: 'Today', priority: 'High' })

    const sorted = sortTasks([later, week, todayLow, todayHigh])

    expect(sorted.map((t) => t.id)).toEqual([todayHigh.id, todayLow.id, week.id, later.id])
  })

  it('priority key orders High → Medium → Low, with urgency as secondary', () => {
    const medToday = makeTask({ priority: 'Medium', urgency: 'Today' })
    const highLater = makeTask({ priority: 'High', urgency: 'Later' })
    const lowToday = makeTask({ priority: 'Low', urgency: 'Today' })

    const sorted = sortTasks([medToday, highLater, lowToday], 'priority')

    expect(sorted.map((t) => t.id)).toEqual([highLater.id, medToday.id, lowToday.id])
  })

  it('category key orders Research → Personal → Firm', () => {
    const firm = makeTask({ category: 'Firm' })
    const research = makeTask({ category: 'Research' })
    const personal = makeTask({ category: 'Personal' })

    const sorted = sortTasks([firm, research, personal], 'category')

    expect(sorted.map((t) => t.category)).toEqual(['Research', 'Personal', 'Firm'])
  })

  it('breaks ties with newest created_at first', () => {
    const older = makeTask({
      urgency: 'Today',
      priority: 'High',
      created_at: '2024-01-01T00:00:00.000Z',
    })
    const newer = makeTask({
      urgency: 'Today',
      priority: 'High',
      created_at: '2024-02-01T00:00:00.000Z',
    })

    const sorted = sortTasks([older, newer])

    expect(sorted.map((t) => t.id)).toEqual([newer.id, older.id])
  })

  it('sinks completed tasks below open ones, even when more urgent', () => {
    const doneUrgent = makeTask({ urgency: 'Today', priority: 'High', completed: true })
    const openRelaxed = makeTask({ urgency: 'Later', priority: 'Low', completed: false })

    const sorted = sortTasks([doneUrgent, openRelaxed])

    expect(sorted.map((t) => t.id)).toEqual([openRelaxed.id, doneUrgent.id])
  })

  it('orders open tasks before completed, each group sorted by the key', () => {
    const openHigh = makeTask({ urgency: 'Today', priority: 'High', completed: false })
    const openLow = makeTask({ urgency: 'Later', priority: 'Low', completed: false })
    const doneHigh = makeTask({ urgency: 'Today', priority: 'High', completed: true })
    const doneLow = makeTask({ urgency: 'Later', priority: 'Low', completed: true })

    const sorted = sortTasks([doneLow, openLow, doneHigh, openHigh])

    expect(sorted.map((t) => t.id)).toEqual([openHigh.id, openLow.id, doneHigh.id, doneLow.id])
  })

  it('does not mutate its input', () => {
    const a = makeTask({ urgency: 'Later' })
    const b = makeTask({ urgency: 'Today' })
    const input = [a, b]

    sortTasks(input)

    expect(input).toEqual([a, b])
  })
})
