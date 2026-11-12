import type { DayRecord, ExercisePlan, ExerciseEntry, SetEntry } from './types'

export function lastSess(
  days: Record<string, DayRecord>,
  beforeDate: string,
  exId: string,
): { date: string; w: number; sets: SetEntry[] } | null {
  const sorted = Object.keys(days)
    .filter((k) => k < beforeDate)
    .sort()
    .reverse()
  for (const k of sorted) {
    const x = days[k].ex?.[exId]
    if (x && x.sets.some((s) => s.d)) {
      return { date: k, w: x.w, sets: x.sets }
    }
  }
  return null
}

export function sugg(
  days: Record<string, DayRecord>,
  date: string,
  exercise: ExercisePlan,
): { w: number; up: boolean; last: ReturnType<typeof lastSess> } {
  const last = lastSess(days, date, exercise.id)
  if (!last) return { w: exercise.w, up: false, last: null }
  const canBump = !exercise.nw && !!exercise.inc
  const allHit = last.sets.every((s) => s.d && Number(s.r) >= exercise.hi)
  const up = canBump && allHit
  return { w: up ? last.w + exercise.inc! : last.w, up, last }
}

export function ensureEntry(
  day: DayRecord,
  days: Record<string, DayRecord>,
  date: string,
  exercise: ExercisePlan,
): ExerciseEntry {
  if (day.ex[exercise.id]) return day.ex[exercise.id]
  return {
    w: sugg(days, date, exercise).w,
    sets: Array.from({ length: exercise.sets }, () => ({ r: null, d: false })),
  }
}

export function adjustSetCount(sets: SetEntry[], direction: 1 | -1): SetEntry[] {
  const n = sets.length + direction
  if (n < 1 || n > 8) return sets
  if (direction > 0) return [...sets, { r: null, d: false }]
  return sets.slice(0, -1)
}
