import { describe, it, expect } from 'vitest'
import { blankDay } from '../types'
import { merge } from '../merge'

const base = (extra: object = {}) => ({ days: {}, target: 110, targetUpdated: 0, ...extra })

describe('merge', () => {
  it('local day wins when local.u > remote.u', () => {
    const local = base({ days: { '2026-01-01': { ...blankDay(), u: 200, sit: '50' } } })
    const remote = base({ days: { '2026-01-01': { ...blankDay(), u: 100, sit: '30' } } })
    expect(merge(local as any, remote as any).days['2026-01-01'].sit).toBe('50')
  })
  it('remote day wins when remote.u > local.u', () => {
    const local = base({ days: { '2026-01-01': { ...blankDay(), u: 100, sit: '30' } } })
    const remote = base({ days: { '2026-01-01': { ...blankDay(), u: 200, sit: '50' } } })
    expect(merge(local as any, remote as any).days['2026-01-01'].sit).toBe('50')
  })
  it('preserves days only in local', () => {
    const local = base({ days: { '2026-01-01': { ...blankDay(), u: 100 } } })
    expect(merge(local as any, base() as any).days['2026-01-01']).toBeDefined()
  })
  it('adds days only in remote', () => {
    const remote = base({ days: { '2026-01-02': { ...blankDay(), u: 100 } } })
    expect(merge(base() as any, remote as any).days['2026-01-02']).toBeDefined()
  })
  it('treats missing .u as 0', () => {
    const local = base({ days: { '2026-01-01': { ...blankDay(), sit: 'new' } } })
    const remote = base({ days: { '2026-01-01': { ...blankDay(), u: 1, sit: 'old' } } })
    expect(merge(local as any, remote as any).days['2026-01-01'].sit).toBe('old')
  })
  it('local target wins when local.targetUpdated is larger', () => {
    const local = base({ target: 130, targetUpdated: 200 })
    const remote = base({ target: 110, targetUpdated: 100 })
    expect(merge(local as any, remote as any).target).toBe(130)
  })
  it('remote target wins when remote.targetUpdated is larger', () => {
    const local = base({ target: 110, targetUpdated: 100 })
    const remote = base({ target: 140, targetUpdated: 300 })
    expect(merge(local as any, remote as any).target).toBe(140)
  })
  it('does not mutate either input', () => {
    const local = base({ days: { '2026-01-01': { ...blankDay(), u: 100 } } })
    const remote = base({ days: { '2026-01-02': { ...blankDay(), u: 200 } } })
    merge(local as any, remote as any)
    expect(Object.keys(local.days)).toHaveLength(1)
    expect(Object.keys(remote.days)).toHaveLength(1)
  })
})
