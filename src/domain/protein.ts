import type { DayRecord, FoodItem } from './types'
import { FOODS, NEXTUP } from './plan'

export function protTotal(day: DayRecord): number {
  return day.items.reduce((a, b) => a + (Number(b.g) || 0), 0)
}

export function nextUp(day: DayRecord): FoodItem[] {
  const logged = new Set(day.items.map((i) => i.fid).filter(Boolean))
  return NEXTUP.filter((id) => !logged.has(id))
    .map((id) => FOODS.find((f) => f.id === id)!)
    .filter(Boolean)
    .slice(0, 3)
}
