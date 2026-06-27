import { describe, expect, it } from 'vitest'
import { cutoffISO, isExpired, RETENTION_DAYS } from './cleanup'
import { makeTask } from '../test/makeTask'

const NOW = new Date('2024-01-31T12:00:00.000Z')
const DAY_MS = 24 * 60 * 60 * 1000

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * DAY_MS).toISOString()
}

describe('RETENTION_DAYS', () => {
  it('is 7 days', () => {
    expect(RETENTION_DAYS).toBe(7)
  })
})

describe('cutoffISO', () => {
  it('is exactly RETENTION_DAYS before now', () => {
    expect(cutoffISO(NOW)).toBe('2024-01-24T12:00:00.000Z')
  })
})

describe('isExpired', () => {
  it('is false when the task is not completed', () => {
    expect(isExpired(makeTask({ completed: false, completed_at: null }), NOW)).toBe(false)
  })

  it('is false when completed but completed_at is missing', () => {
    expect(isExpired(makeTask({ completed: true, completed_at: null }), NOW)).toBe(false)
  })

  it('is false just inside the window (6 days)', () => {
    expect(isExpired(makeTask({ completed: true, completed_at: daysAgo(6) }), NOW)).toBe(false)
  })

  it('is true exactly at the window (7 days)', () => {
    expect(isExpired(makeTask({ completed: true, completed_at: daysAgo(7) }), NOW)).toBe(true)
  })

  it('is true past the window (8 days)', () => {
    expect(isExpired(makeTask({ completed: true, completed_at: daysAgo(8) }), NOW)).toBe(true)
  })
})
