import { describe, it, expect } from 'vitest'
import { blankDay } from '../types'
import { protTotal, nextUp } from '../protein'

describe('protTotal', () => {
  it('returns 0 for empty items', () => {
    expect(protTotal(blankDay())).toBe(0)
  })
  it('sums integer grams', () => {
    const day = { ...blankDay(), items: [{ id: '1', n: 'Greek yogurt', g: 23 }, { id: '2', n: 'Eggs', g: 12 }] }
    expect(protTotal(day)).toBe(35)
  })
  it('sums decimal grams', () => {
    const day = { ...blankDay(), items: [{ id: '1', n: 'Custom', g: 7.5 }, { id: '2', n: 'Custom2', g: 2.5 }] }
    expect(protTotal(day)).toBe(10)
  })
  it('ignores non-numeric g values', () => {
    const day = { ...blankDay(), items: [{ id: '1', n: 'x', g: NaN }, { id: '2', n: 'y', g: 10 }] }
    expect(protTotal(day)).toBe(10)
  })
})

describe('nextUp', () => {
  it('returns first 3 from NEXTUP when nothing logged', () => {
    const result = nextUp(blankDay())
    expect(result).toHaveLength(3)
    expect(result[0].id).toBe('gy')
    expect(result[1].id).toBe('cc')
    expect(result[2].id).toBe('tofu')
  })
  it('skips already-logged fids', () => {
    const day = { ...blankDay(), items: [{ id: 'x', fid: 'gy', n: 'Greek yogurt', g: 23 }] }
    const result = nextUp(day)
    expect(result[0].id).toBe('cc')
    expect(result).toHaveLength(3)
  })
  it('returns fewer than 3 when most are logged', () => {
    const fids = ['gy', 'cc', 'tofu', 'lentils', 'edamame', 'eggs', 'whey']
    const items = fids.map((fid, i) => ({ id: String(i), fid, n: 'x', g: 10 }))
    expect(nextUp({ ...blankDay(), items })).toHaveLength(0)
  })
})
