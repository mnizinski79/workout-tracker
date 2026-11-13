import { useState } from 'react'
import { useStore } from '../../store/index'
import { blankDay } from '../../domain/types'
import { protTotal, nextUp } from '../../domain/protein'
import { ExerciseCard } from './ExerciseCard'
import { WarmUpSection } from './WarmUpSection'
import { CoolDownSection } from './CoolDownSection'
import { EveryDaySection } from './EveryDaySection'
import { PhotoCard } from './PhotoCard'

interface TodayProps {
  date: string
  onPhotoOpen: (photoId: string, date: string) => void
}

const WK_OPTIONS: [string, string][] = [
  ['tue', 'Tue'],
  ['wed', 'Wed'],
  ['thu', 'Thu'],
  ['off', 'Rest'],
]

export function Today({ date, onPhotoOpen }: TodayProps) {
  const days = useStore((s) => s.days)
  const target = useStore((s) => s.target)
  const plan = useStore((s) => s.plan)
  const setWorkoutKey = useStore((s) => s.setWorkoutKey)
  const addProteinItem = useStore((s) => s.addProteinItem)
  const addExercise = useStore((s) => s.addExercise)

  const [editMode, setEditMode] = useState(false)

  const day = days[date] ?? blankDay()
  const wk = day.wk ?? null
  const k = wk && wk !== 'off' ? wk : null
  const W = k ? plan[k] : null

  // Session summary stats
  let totalSets = 0, doneSets = 0
  if (W) {
    W.ex.forEach((e) => {
      const x = day.ex[e.id]
      totalSets += x ? x.sets.length : e.sets
      if (x) doneSets += x.sets.filter((s) => s.d).length
    })
  }

  const t = protTotal(day)
  const pct = Math.min(100, (t / target) * 100)
  const goalHit = t >= target
  const nudge = nextUp(day)

  return (
    <main>
      {/* Workout type segmented control */}
      <div className="seg" role="group" aria-label="Workout for this day">
        {WK_OPTIONS.map(([id, label]) => {
          const on = (wk ?? 'off') === id
          return (
            <button
              key={id}
              className={on ? 'on' : undefined}
              aria-pressed={on}
              onClick={() => setWorkoutKey(date, id)}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Session summary / rest day card */}
      {W ? (
        <section className="card">
          <div className="row">
            <div>
              <h2>{W.name}</h2>
              <div className="meta">{W.sub}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="big">
                {doneSets}
                <small>/{totalSets} sets</small>
              </div>
              <button
                className="btn ghost"
                style={{ minHeight: 32, padding: '0 10px', fontSize: 13 }}
                onClick={() => setEditMode((v) => !v)}
              >
                {editMode ? 'Done' : 'Edit'}
              </button>
            </div>
          </div>
          <div
            className={`bar${doneSets === totalSets && totalSets > 0 ? ' good' : ''}`}
            style={{ marginTop: 12 }}
          >
            <i style={{ width: totalSets ? `${(doneSets / totalSets) * 100}%` : '0%' }} />
          </div>
        </section>
      ) : (
        <section className="card">
          <h2>Rest day</h2>
          <div className="meta">No lifting planned. The evening bike ride, sit-ups and push-ups still count.</div>
        </section>
      )}

      {/* Protein nudge */}
      <section className={`card${goalHit ? ' done' : ''}`}>
        <h3>Protein reminder</h3>
        <div className="big">
          {Math.round(t)} <small>{goalHit ? `of ${target} g, goal hit` : `of ${target} g so far`}</small>
        </div>
        <div className={`bar${goalHit ? ' good' : ''}`} style={{ marginTop: 8 }}>
          <i style={{ width: `${pct}%` }} />
        </div>
        {!goalHit && (
          <>
            <div className="meta" style={{ marginTop: 8 }}>
              Aim for 25–40 g at each meal. Tap to log a quick pick:
            </div>
            <div className="chips">
              {nudge.map((f) => (
                <button
                  key={f.id}
                  className="chip"
                  onClick={() =>
                    addProteinItem(date, {
                      id: `${Date.now()}-${f.id}`,
                      fid: f.id,
                      n: f.n,
                      g: f.g,
                    })
                  }
                >
                  {f.n} <b>+{f.g} g</b>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {W && <WarmUpSection date={date} />}
      {W && W.ex.map((ex) => (
        <ExerciseCard key={ex.id} date={date} exercise={ex} editMode={editMode} wkKey={k!} />
      ))}
      {W && editMode && (
        <button
          className="btn ghost"
          style={{ width: '100%', marginBottom: 8 }}
          onClick={() => addExercise(k!)}
        >
          + Add exercise
        </button>
      )}
      {W && !editMode && (
        <div className="meta" style={{ padding: '0 4px' }}>
          Tap the check to log the top rep target, or type your reps first.
        </div>
      )}
      {W && <CoolDownSection date={date} />}

      <PhotoCard date={date} onPhotoOpen={onPhotoOpen} />
      <EveryDaySection date={date} />
    </main>
  )
}
