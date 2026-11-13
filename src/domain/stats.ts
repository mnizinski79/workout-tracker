import type { DayRecord } from './types'
import { ymd } from './types'
import { protTotal } from './protein'

export function last14(date: string): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(`${date}T12:00:00`)
    d.setDate(d.getDate() - (13 - i))
    return ymd(d)
  })
}

export function didLift(day: DayRecord | undefined): boolean {
  if (!day) return false
  return Object.values(day.ex).some((e) => e.sets.some((s) => s.d))
}

export function didBike(day: DayRecord | undefined): boolean {
  return day?.bike === true
}

export function hitProtein(day: DayRecord | undefined, target: number): boolean {
  if (!day) return false
  return protTotal(day) >= target
}
