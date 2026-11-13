import { useStore } from '../../store/index'
import { pref } from '../../domain/pref'
import { blankDay } from '../../domain/types'
import { Stepper } from '../shared/Stepper'

interface CoolDownSectionProps {
  date: string
}

export function CoolDownSection({ date }: CoolDownSectionProps) {
  const days = useStore((s) => s.days)
  const toggleCool = useStore((s) => s.toggleCool)
  const adjustDial = useStore((s) => s.adjustDial)

  const day = days[date] ?? blankDay()
  const walkMin = pref(days, date, 'walkMin', 15)
  const walkInc = pref(days, date, 'walkInc', 15)
  const walkSpd = pref(days, date, 'walkSpd', 2)

  return (
    <section className="card">
      <h3>Cool-down</h3>
      <label className="check">
        <input
          type="checkbox"
          checked={!!day.cool}
          onChange={(e) => toggleCool(date, e.target.checked)}
        />
        <span>
          Incline walk
          <br />
          <small>
            {walkMin} min, {walkInc}% incline, {walkSpd} mph
          </small>
        </span>
      </label>
      <div className="dial">
        <div className="row">
          <span>Time</span>
          <Stepper
            value={walkMin}
            onDecrement={() => adjustDial(date, 'walkMin', -1, 5, 5, 60)}
            onIncrement={() => adjustDial(date, 'walkMin', 1, 5, 5, 60)}
            label="walk time"
            min={5}
            max={60}
            unit="min"
          />
        </div>
      </div>
      <div className="dial">
        <div className="row">
          <span>Incline</span>
          <Stepper
            value={walkInc}
            onDecrement={() => adjustDial(date, 'walkInc', -1, 1, 0, 15)}
            onIncrement={() => adjustDial(date, 'walkInc', 1, 1, 0, 15)}
            label="incline"
            min={0}
            max={15}
            unit="%"
          />
        </div>
      </div>
      <div className="dial">
        <div className="row">
          <span>Speed</span>
          <Stepper
            value={walkSpd}
            onDecrement={() => adjustDial(date, 'walkSpd', -1, 0.1, 0.5, 6)}
            onIncrement={() => adjustDial(date, 'walkSpd', 1, 0.1, 0.5, 6)}
            label="speed"
            min={0.5}
            max={6}
            unit="mph"
          />
        </div>
      </div>
    </section>
  )
}
