import type { DayRecord } from './types'

export function pref(
  days: Record<string, DayRecord>,
  date: string,
  key: keyof DayRecord,
  def: number,
): number {
  const sorted = Object.keys(days)
    .filter((k) => k <= date)
    .sort()
    .reverse()
  for (const k of sorted) {
    const v = days[k][key]
    if (v != null) return v as number
  }
  return def
}

export function applyDial(
  current: number,
  direction: 1 | -1,
  step: number,
  min: number,
  max: number,
): number {
  const raw = current + direction * step
  const clamped = Math.min(max, Math.max(min, raw))
  return Math.round(clamped * 10) / 10
}
