import { useStore } from '../../store/index'
import { ensureEntry, sugg } from '../../domain/progression'
import { blankDay } from '../../domain/types'
import type { ExercisePlan } from '../../domain/types'
import { Stepper } from '../shared/Stepper'
import { SetGrid } from './SetGrid'

interface ExerciseCardProps {
  date: string
  exercise: ExercisePlan
}

export function ExerciseCard({ date, exercise }: ExerciseCardProps) {
  const days = useStore((s) => s.days)
  const adjustWeight = useStore((s) => s.adjustWeight)
  const adjustSetCount = useStore((s) => s.adjustSetCount)

  const day = days[date] ?? blankDay()
  const entry = ensureEntry(day, days, date, exercise)
  const sg = sugg(days, date, exercise)

  const doneSets = entry.sets.filter((s) => s.d)
  const allDone = doneSets.length === entry.sets.length && entry.sets.length > 0
  const allHit = allDone && doneSets.every((s) => Number(s.r) >= exercise.hi)
  const hasEntry = !!days[date]?.ex[exercise.id]

  let tip: string | null = null
  if (hasEntry && allHit && !exercise.nw && exercise.inc) {
    tip = `Hit ${exercise.hi} on every set. Next time: ${entry.w + exercise.inc} lb.`
  } else if (!hasEntry && sg.up && exercise.inc) {
    tip = `Going up ${exercise.inc} lb because you hit ${exercise.hi} on every set last time.`
  } else if (sg.last && !allDone && !exercise.nw) {
    const lr = sg.last.sets
      .filter((s) => s.d)
      .map((s) => s.r)
      .join(', ')
    tip = `Last time: ${sg.last.w ? sg.last.w + ' lb × ' : 'bodyweight × '}${lr}`
  } else if (exercise.nw && allHit) {
    tip = `Top of the range on every set. Try more ${exercise.unit ?? 'reps'} next time.`
  }

  const cardClass = `card${allDone ? ' done' : ''}`

  return (
    <section className={cardClass}>
      <div className="row">
        <div>
          <h2>{exercise.n}</h2>
          <div className="meta">
            {exercise.sets} sets × {exercise.lo}–{exercise.hi}
            {exercise.unit ? ' ' + exercise.unit : ' reps'}
            {exercise.note ? ` · ${exercise.note}` : ''}
          </div>
        </div>
        {!exercise.nw && (
          <Stepper
            value={entry.w}
            onDecrement={() => adjustWeight(date, exercise.id, -1)}
            onIncrement={() => adjustWeight(date, exercise.id, 1)}
            label="weight"
            min={0}
            max={999}
          />
        )}
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <span className="meta">Sets today</span>
        <Stepper
          value={entry.sets.length}
          onDecrement={() => adjustSetCount(date, exercise.id, -1)}
          onIncrement={() => adjustSetCount(date, exercise.id, 1)}
          label="set count"
          min={1}
          max={8}
        />
      </div>
      <SetGrid date={date} exId={exercise.id} sets={entry.sets} />
      {tip && <div className="tip">{tip}</div>}
    </section>
  )
}
