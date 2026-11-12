import type { AppData, DayRecord } from './types'

export function merge(current: AppData, incoming: AppData): AppData {
  const allKeys = new Set([
    ...Object.keys(current.days),
    ...Object.keys(incoming.days),
  ])
  const days: Record<string, DayRecord> = {}
  for (const k of allKeys) {
    const a = current.days[k]
    const b = incoming.days[k]
    if (!a) {
      days[k] = b
    } else if (!b) {
      days[k] = a
    } else {
      days[k] = (b.u ?? 0) > (a.u ?? 0) ? b : a
    }
  }
  const useLocal = current.targetUpdated >= incoming.targetUpdated
  return {
    days,
    target: useLocal ? current.target : incoming.target,
    targetUpdated: Math.max(current.targetUpdated, incoming.targetUpdated),
  }
}
