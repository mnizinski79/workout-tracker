import { last14 } from '../../domain/stats'
import { didLift, didBike } from '../../domain/stats'
import type { DayRecord } from '../../domain/types'

interface DotGridProps {
  date: string
  days: Record<string, DayRecord>
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function DotGrid({ date, days }: DotGridProps) {
  const keys = last14(date)

  return (
    <div className="dots">
      {/* Row labels */}
      <span />
      {keys.map((k) => {
        const d = new Date(`${k}T12:00:00`)
        return (
          <span key={k} className="lb">
            {DAY_LABELS[d.getDay()]}
          </span>
        )
      })}

      {/* Lift row */}
      <span>Lift</span>
      {keys.map((k) => {
        const on = didLift(days[k])
        return <span key={k} className={`d${on ? ' on' : ''}`} aria-label={on ? 'lifted' : ''} />
      })}

      {/* Bike row */}
      <span>Bike</span>
      {keys.map((k) => {
        const on = didBike(days[k])
        return <span key={k} className={`d${on ? ' on' : ''}`} aria-label={on ? 'biked' : ''} />
      })}
    </div>
  )
}
