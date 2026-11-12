import { useStore } from '../../store/index'
import { MEALS } from '../../domain/plan'
import { blankDay } from '../../domain/types'

interface MealChecksProps {
  date: string
}

export function MealChecks({ date }: MealChecksProps) {
  const days = useStore((s) => s.days)
  const toggleMeal = useStore((s) => s.toggleMeal)

  const day = days[date] ?? blankDay()

  return (
    <section className="card">
      <h3>Protein at each meal</h3>
      {MEALS.map((m) => (
        <label className="check" key={m[0]}>
          <input
            type="checkbox"
            checked={!!day.meals[m[0]]}
            onChange={(e) => toggleMeal(date, m[0], e.target.checked)}
          />
          <span>{m[1]}</span>
        </label>
      ))}
    </section>
  )
}
