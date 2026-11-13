import { describe, it, expect } from 'vitest'
import { blankDay } from '../types'
import { pref, applyDial } from '../pref'

describe('pref', () => {
  it('returns current-day value when present', () => {
    const days = { '2026-01-02': { ...blankDay(), walkMin: 20 } }
    expect(pref(days, '2026-01-02', 'walkMin', 15)).toBe(20)
  })
  it('falls back to previous day when current-day lacks the key', () => {
    const days = { '2026-01-01': { ...blankDay(), bikeMin: 45 } }
    expect(pref(days, '2026-01-02', 'bikeMin', 30)).toBe(45)
  })
  it('returns default when no history', () => {
    expect(pref({}, '2026-01-01', 'rowMin', 2)).toBe(2)
  })
  it('skips days where key is null/undefined', () => {
    const days = {
      '2026-01-01': blankDay(),
      '2026-01-02': { ...blankDay(), walkMin: 25 },
    }
    expect(pref(days, '2026-01-03', 'walkMin', 15)).toBe(25)
  })
})

describe('applyDial', () => {
  it('increments by step', () => {
    expect(applyDial(2, 1, 1, 1, 10)).toBe(3)
  })
  it('decrements by step', () => {
    expect(applyDial(5, -1, 1, 1, 10)).toBe(4)
  })
  it('clamps at max', () => {
    expect(applyDial(15, 1, 1, 0, 15)).toBe(15)
  })
  it('clamps at min', () => {
    expect(applyDial(0, -1, 1, 0, 15)).toBe(0)
  })
  it('rounds to avoid floating-point drift (0.1 steps)', () => {
    expect(applyDial(2.0, 1, 0.1, 0.5, 6)).toBe(2.1)
    expect(applyDial(0.5, -1, 0.1, 0.5, 6)).toBe(0.5)
  })
})
