import type { DayRecord, FoodItem } from './types'
import { dateOf } from './types'
import { FOODS, NEXTUP, WK, MEALS } from './plan'
import { pref } from './pref'

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

export function summaryText(
  days: Record<string, DayRecord>,
  date: string,
  target: number,
): string {
  const d = days[date] ?? { meals: {}, ex: {}, items: [], cool: false, bike: false, sit: '', push: '', photos: [], warm: {}, bw: '', u: 0 }
  const t = protTotal(d)
  const lab = dateOf(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
  const lines: string[] = [lab + ' check-in']
  lines.push(`Protein: ${Math.round(t)} g of ${target} g${t >= target ? ' (goal hit)' : ''}`)
  lines.push('Meals: ' + MEALS.map((m) => `${d.meals[m[0]] ? '✓' : '○'} ${m[1]}`).join(', '))
  const k = d.wk && d.wk !== 'off' ? d.wk : null
  if (k && WK[k]) {
    let tot = 0, dn = 0
    WK[k].ex.forEach((e) => {
      const x = d.ex[e.id]
      tot += x ? x.sets.length : e.sets
      if (x) dn += x.sets.filter((s) => s.d).length
    })
    lines.push(`Workout: ${WK[k].name}, ${dn} of ${tot} sets`)
  }
  if (d.cool) {
    const wm = pref(days, date, 'walkMin', 15)
    const wi = pref(days, date, 'walkInc', 15)
    const ws = pref(days, date, 'walkSpd', 2)
    lines.push(`Walk: ✓ ${wm} min at ${wi}% / ${ws} mph`)
  }
  const bm = pref(days, date, 'bikeMin', 30)
  lines.push(
    `Bike: ${d.bike ? '✓ ' + bm + ' min' : '○'}${d.sit ? ', sit-ups ' + d.sit : ''}${d.push ? ', push-ups ' + d.push : ''}`,
  )
  return lines.join('\n')
}
