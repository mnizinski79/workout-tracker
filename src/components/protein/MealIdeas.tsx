import { useState } from 'react'
import { useStore } from '../../store/index'
import { IDEAS } from '../../domain/plan'
import { MealIdeasSheet } from './MealIdeasSheet'

export function MealIdeas() {
  const target = useStore((s) => s.target)
  const savedFoods = useStore((s) => s.savedFoods)
  const mealIdeas = useStore((s) => s.mealIdeas)
  const setMealIdeas = useStore((s) => s.setMealIdeas)

  const [sheetOpen, setSheetOpen] = useState(false)

  const displayed = mealIdeas.length > 0 ? mealIdeas : IDEAS

  return (
    <>
      <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Meal ideas</h3>
          <button
            className="btn ghost"
            style={{ minHeight: 32, padding: '0 10px', fontSize: 13 }}
            onClick={() => setSheetOpen(true)}
          >
            ✦ Generate
          </button>
        </div>

        {displayed.map((idea, i) => (
          <div key={i} className="food">
            <span className="fn">
              <span style={{ fontWeight: 600 }}>{idea.m}</span>
              <small>{idea.t}</small>
            </span>
            <span className="fg">+{idea.g} g</span>
          </div>
        ))}
      </section>

      <MealIdeasSheet
        open={sheetOpen}
        target={target}
        savedFoods={savedFoods}
        onClose={() => setSheetOpen(false)}
        onApply={(ideas) => {
          setMealIdeas(ideas)
          setSheetOpen(false)
        }}
      />
    </>
  )
}
