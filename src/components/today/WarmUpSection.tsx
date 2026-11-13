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
  const armCount = pref(days, date, 'armCount', 10)
  const needleCount = pref(days, date, 'needleCount', 5)

  function getDesc(id: string) {
    if (id === 'arm') return `${armCount} forward, ${armCount} backward`
    if (id === 'row') return `about ${Math.round(rowMin * 100)} strokes`
    if (id === 'thread') return `${needleCount} per side`
    return ''
  }

  function getStepper(id: string) {
    if (id === 'arm') return (
      <Stepper
        value={armCount}
        onDecrement={() => adjustDial(date, 'armCount', -1, 1, 1, 30)}
        onIncrement={() => adjustDial(date, 'armCount', 1, 1, 1, 30)}
        label="arm circles"
        min={1}
        max={30}
      />
    )
    if (id === 'row') return (
      <Stepper
        value={rowMin}
        onDecrement={() => adjustDial(date, 'rowMin', -1, 1, 1, 10)}
        onIncrement={() => adjustDial(date, 'rowMin', 1, 1, 1, 10)}
        label="rowing time"
        min={1}
        max={10}
        unit="min"
      />
    )
    if (id === 'thread') return (
      <Stepper
        value={needleCount}
        onDecrement={() => adjustDial(date, 'needleCount', -1, 1, 1, 20)}
        onIncrement={() => adjustDial(date, 'needleCount', 1, 1, 1, 20)}
        label="thread the needle"
        min={1}
        max={20}
      />
    )
    return null
  }

  return (
    <section className="card">
      <h3>Warm-up</h3>
      {WARM.map((x) => (
        <div className="row" key={x.id} style={{ alignItems: 'center' }}>
          <label className="check" style={{ flex: 1, margin: 0 }}>
            <input
              type="checkbox"
              checked={!!day.warm[x.id]}
              onChange={(e) => toggleWarm(date, x.id, e.target.checked)}
            />
            <span>
              {x.n}
              <br />
              <small>{getDesc(x.id)}</small>
            </span>
          </label>
          {getStepper(x.id)}
        </div>
      ))}
    </section>
  )
}
