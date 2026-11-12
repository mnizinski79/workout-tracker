import { useStore } from '../../store/index'
import { WARM } from '../../domain/plan'
import { pref } from '../../domain/pref'
import { blankDay } from '../../domain/types'
import { Stepper } from '../shared/Stepper'

interface WarmUpSectionProps {
  date: string
}

export function WarmUpSection({ date }: WarmUpSectionProps) {
  const days = useStore((s) => s.days)
  const toggleWarm = useStore((s) => s.toggleWarm)
  const adjustDial = useStore((s) => s.adjustDial)

  const day = days[date] ?? blankDay()
  const rowMin = pref(days, date, 'rowMin', 2)

  return (
    <section className="card">
      <h3>Warm-up</h3>
      {WARM.map((x) => {
        const desc = x.id === 'row' ? `${rowMin} min, about ${Math.round(rowMin * 100)} strokes` : x.d
        return (
          <label className="check" key={x.id}>
            <input
              type="checkbox"
              checked={!!day.warm[x.id]}
              onChange={(e) => toggleWarm(date, x.id, e.target.checked)}
            />
            <span>
              {x.n}
              <br />
              <small>{desc}</small>
            </span>
          </label>
        )
      })}
      <div className="dial">
        <div className="row">
          <span>Rowing time</span>
          <Stepper
            value={rowMin}
            onDecrement={() => adjustDial(date, 'rowMin', -1, 1, 1, 10)}
            onIncrement={() => adjustDial(date, 'rowMin', 1, 1, 1, 10)}
            label="rowing time"
            min={1}
            max={10}
          />
          <span className="meta">min</span>
        </div>
      </div>
    </section>
  )
}
