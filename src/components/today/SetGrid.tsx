import { Check } from '@phosphor-icons/react'
import { useStore } from '../../store/index'
import type { SetEntry } from '../../domain/types'

interface SetGridProps {
  date: string
  exId: string
  sets: SetEntry[]
}

export function SetGrid({ date, exId, sets }: SetGridProps) {
  const setReps = useStore((s) => s.setReps)
  const toggleSetDone = useStore((s) => s.toggleSetDone)

  return (
    <div className="sets">
      {sets.map((set, i) => {
        const id = `${date}-${exId}-${i}`
        return (
          <div className="cell" key={i}>
            <label htmlFor={id}>Set {i + 1}</label>
            <input
              className="reps"
              id={id}
              type="text"
              inputMode="numeric"
              defaultValue={set.r ?? ''}
              onChange={(e) => setReps(date, exId, i, e.target.value)}
            />
            <button
              className={`chk${set.d ? ' on' : ''}`}
              aria-pressed={set.d}
              aria-label={`Set ${i + 1} done`}
              onClick={() => toggleSetDone(date, exId, i)}
            >
              <Check size={16} weight="bold" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
