import { describe, it, expect } from 'vitest'
import { blankDay } from '../types'
import { lastSess, sugg, ensureEntry, adjustSetCount } from '../progression'

const curl = { id: 'curl', n: 'Bicep curls', sets: 3, lo: 12, hi: 15, w: 20, inc: 5 }
const plank = { id: 'plank', n: 'Plank', sets: 3, lo: 30, hi: 45, w: 0, nw: true as const, unit: 'sec' }

describe('lastSess', () => {
  it('returns null when no history', () => {
    expect(lastSess({}, '2026-01-02', 'curl')).toBeNull()
  })
  it('returns null when no sets are marked done', () => {
    const days = { '2026-01-01': { ...blankDay(), ex: { curl: { w: 20, sets: [{ r: 12, d: false }] } } } }
    expect(lastSess(days, '2026-01-02', 'curl')).toBeNull()
  })
  it('finds most recent session with a done set', () => {
    const days = {
      '2026-01-01': { ...blankDay(), ex: { curl: { w: 20, sets: [{ r: 15, d: true }] } } },
      '2026-01-03': { ...blankDay(), ex: { curl: { w: 25, sets: [{ r: 14, d: true }] } } },
    }
    expect(lastSess(days, '2026-01-04', 'curl')?.w).toBe(25)
  })
  it('does not look at the current date', () => {
    const days = { '2026-01-02': { ...blankDay(), ex: { curl: { w: 25, sets: [{ r: 15, d: true }] } } } }
    expect(lastSess(days, '2026-01-02', 'curl')).toBeNull()
  })
})

describe('sugg', () => {
  it('returns plan default weight with no history', () => {
    expect(sugg({}, '2026-01-01', curl)).toEqual({ w: 20, up: false, last: null })
  })
  it('bumps weight when every done set >= hi', () => {
    const days = {
      '2026-01-01': {
        ...blankDay(),
        ex: { curl: { w: 20, sets: [{ r: 15, d: true }, { r: 15, d: true }, { r: 16, d: true }] } },
      },
    }
    const r = sugg(days, '2026-01-02', curl)
    expect(r.w).toBe(25)
    expect(r.up).toBe(true)
  })
  it('does not bump when some done sets < hi', () => {
    const days = {
      '2026-01-01': {
        ...blankDay(),
        ex: { curl: { w: 20, sets: [{ r: 15, d: true }, { r: 12, d: true }, { r: 15, d: true }] } },
      },
    }
    const r = sugg(days, '2026-01-02', curl)
    expect(r.w).toBe(20)
    expect(r.up).toBe(false)
  })
  it('does not bump nw:true exercises', () => {
    const days = {
      '2026-01-01': {
        ...blankDay(),
        ex: { plank: { w: 0, sets: [{ r: 45, d: true }, { r: 45, d: true }, { r: 45, d: true }] } },
      },
    }
    expect(sugg(days, '2026-01-02', plank).up).toBe(false)
  })
  it('does not bump when last session has undone sets', () => {
    const days = {
      '2026-01-01': {
        ...blankDay(),
        ex: { curl: { w: 20, sets: [{ r: 15, d: true }, { r: null, d: false }] } },
      },
    }
    expect(sugg(days, '2026-01-02', curl).up).toBe(false)
  })
})

describe('ensureEntry', () => {
  it('returns existing entry without mutation', () => {
    const entry = { w: 25, sets: [{ r: 14, d: true }] }
    const day = { ...blankDay(), ex: { curl: entry } }
    const result = ensureEntry(day, {}, '2026-01-01', curl)
    expect(result).toBe(entry)
    expect(day.ex.curl).toBe(entry)
  })
  it('returns new default entry when none exists', () => {
    const day = blankDay()
    const result = ensureEntry(day, {}, '2026-01-01', curl)
    expect(result.sets).toHaveLength(3)
    expect(result.w).toBe(20)
    expect(day.ex).toEqual({})
  })
})

describe('adjustSetCount', () => {
  const base = [{ r: null, d: false }, { r: null, d: false }, { r: null, d: false }]
  it('adds a set', () => {
    expect(adjustSetCount(base, 1)).toHaveLength(4)
  })
  it('removes a set', () => {
    expect(adjustSetCount(base, -1)).toHaveLength(2)
  })
  it('clamps at 8', () => {
    const eight = Array.from({ length: 8 }, () => ({ r: null, d: false }))
    expect(adjustSetCount(eight, 1)).toHaveLength(8)
  })
  it('clamps at 1', () => {
    const one = [{ r: null, d: false }]
    expect(adjustSetCount(one, -1)).toHaveLength(1)
  })
  it('new set appended is {r:null,d:false}', () => {
    const result = adjustSetCount(base, 1)
    expect(result[3]).toEqual({ r: null, d: false })
  })
})
