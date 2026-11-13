import { useStore } from '../../store/index'
import { pref } from '../../domain/pref'
import { blankDay } from '../../domain/types'
import { Stepper } from '../shared/Stepper'

interface EveryDaySectionProps {
  date: string
}

export function EveryDaySection({ date }: EveryDaySectionProps) {
  const days = useStore((s) => s.days)
  const toggleBike = useStore((s) => s.toggleBike)
  const adjustDial = useStore((s) => s.adjustDial)
  const setSitUps = useStore((s) => s.setSitUps)
  const setPushUps = useStore((s) => s.setPushUps)

  const day = days[date] ?? blankDay()
  const bikeMin = pref(days, date, 'bikeMin', 30)
  return (
    <section className="card">
      <h3>Every day</h3>
      <div className="row" style={{ alignItems: 'center' }}>
        <label className="check" style={{ flex: 1, margin: 0 }}>
          <input
            type="checkbox"
            checked={!!day.bike}
            onChange={(e) => toggleBike(date, e.target.checked)}
          />
          <span>
            Evening bike ride
            <br />
            <small>{bikeMin} minutes</small>
          </span>
        </label>
        <Stepper
          value={bikeMin}
          onDecrement={() => adjustDial(date, 'bikeMin', -1, 5, 5, 120)}
          onIncrement={() => adjustDial(date, 'bikeMin', 1, 5, 5, 120)}
          label="bike time"
          min={5}
          max={120}
          unit="min"
        />
      </div>
      <div className="row" style={{ padding: '8px 0' }}>
        <label htmlFor={`${date}-sit`}>Sit-ups</label>
        <input
          className="num"
          id={`${date}-sit`}
          type="text"
          inputMode="numeric"
          value={day.sit}
          placeholder="0"
          onChange={(e) => setSitUps(date, e.target.value)}
        />
      </div>
      <div className="row" style={{ padding: '8px 0' }}>
        <label htmlFor={`${date}-push`}>Push-ups</label>
        <input
          className="num"
          id={`${date}-push`}
          type="text"
          inputMode="numeric"
          value={day.push}
          placeholder="0"
          onChange={(e) => setPushUps(date, e.target.value)}
        />
      </div>
    </section>
  )
}
