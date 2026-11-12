import { useRef, useState } from 'react'
import { X, Copy } from '@phosphor-icons/react'
import { useStore } from '../../store/index'
import { protTotal, summaryText } from '../../domain/protein'
import { blankDay } from '../../domain/types'
import { showToast } from '../../lib/toast'
import { FoodList } from './FoodList'
import { MealChecks } from './MealChecks'
import { CustomEntry } from './CustomEntry'
import { MealIdeas } from './MealIdeas'

interface ProteinProps {
  date: string
}

export function Protein({ date }: ProteinProps) {
  const days = useStore((s) => s.days)
  const target = useStore((s) => s.target)
  const removeProteinItem = useStore((s) => s.removeProteinItem)
  const setProteinGoal = useStore((s) => s.setProteinGoal)
  const [veganOnly, setVeganOnly] = useState(false)
  const goalRef = useRef<HTMLInputElement>(null)
  const sumRef = useRef<HTMLTextAreaElement>(null)

  const day = days[date] ?? blankDay()
  const t = protTotal(day)
  const pct = Math.min(100, (t / target) * 100)
  const goalHit = t >= target

  const handleGoalChange = (val: string) => {
    const n = Number(val)
    if (isNaN(n) || n < 20 || n > 400) {
      showToast('Enter 20 to 400 g')
    } else {
      setProteinGoal(n)
    }
  }

  const handleCopy = async () => {
    const text = summaryText(days, date, target)
    try {
      await navigator.clipboard.writeText(text)
      showToast('Copied')
    } catch {
      if (sumRef.current) {
        sumRef.current.select()
      }
      showToast('Select and copy the text')
    }
  }

  return (
    <main>
      {/* Goal and total */}
      <section className={`card${goalHit ? ' done' : ''}`}>
        <div className="row">
          <div className="big">
            {Math.round(t)} <small>of {target} g</small>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <label htmlFor={`${date}-goal`} className="meta" style={{ margin: 0 }}>
              Goal
            </label>
            <input
              className="num"
              style={{ width: 76 }}
              id={`${date}-goal`}
              type="text"
              inputMode="numeric"
              ref={goalRef}
              defaultValue={target}
              onChange={(e) => handleGoalChange(e.target.value)}
            />
          </div>
        </div>
        <div className={`bar${goalHit ? ' good' : ''}`} style={{ marginTop: 10 }}>
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="meta" style={{ marginTop: 8 }}>
          {goalHit ? 'Goal hit for the day.' : `${Math.max(0, Math.round(target - t))} g to go.`}
        </div>
      </section>

      {/* Logged items */}
      {day.items.length > 0 && (
        <section className="card">
          <h3>Logged today</h3>
          {day.items.map((item) => (
            <div className="log" key={item.id}>
              <div>
                <span style={{ fontWeight: 600 }}>{item.n}</span>
                <span className="meta"> · {item.g} g</span>
              </div>
              <button
                className="x"
                aria-label={`Remove ${item.n}`}
                onClick={() => removeProteinItem(date, item.id)}
              >
                <X size={16} weight="bold" aria-hidden="true" />
              </button>
            </div>
          ))}
        </section>
      )}

      <MealChecks date={date} />

      {/* Share today */}
      <section className="card">
        <h3>Share today</h3>
        <textarea
          className="sum"
          ref={sumRef}
          readOnly
          aria-label="Check-in summary"
          value={summaryText(days, date, target)}
        />
        <div style={{ marginTop: 8 }}>
          <button className="btn" onClick={handleCopy}>
            <Copy size={18} aria-hidden="true" />
            Copy check-in
          </button>
        </div>
      </section>

      {/* Food list with vegan filter */}
      <section className="card">
        <div className="row">
          <h3 style={{ margin: 0 }}>Vegetarian protein sources</h3>
          <label className="check" style={{ minHeight: 40, gap: 8 }}>
            <input
              type="checkbox"
              checked={veganOnly}
              onChange={(e) => setVeganOnly(e.target.checked)}
            />
            <span style={{ fontSize: 14 }}>Vegan only</span>
          </label>
        </div>
        <div className="meta">Tap to add to today. Amounts are approximate; check your labels.</div>
      </section>
      <FoodList date={date} veganOnly={veganOnly} />

      <CustomEntry date={date} />
      <MealIdeas />
    </main>
  )
}
