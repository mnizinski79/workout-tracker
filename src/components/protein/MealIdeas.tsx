import { useState } from 'react'
import { useStore } from '../../store/index'
import { IDEAS } from '../../domain/plan'
import { generateMealIdeas } from '../../api/mealIdeas'
import { showToast } from '../../lib/toast'

const CHIPS = [
  'Quick Veggie Breakfast',
  'High Protein Dinners',
  'Post-Workout Meals',
  'No-Cook Snacks',
  'Vegan Options',
  '30-Minute Meals',
]

export function MealIdeas() {
  const target = useStore((s) => s.target)
  const savedFoods = useStore((s) => s.savedFoods)
  const mealIdeas = useStore((s) => s.mealIdeas)
  const setMealIdeas = useStore((s) => s.setMealIdeas)

  const [selectedChips, setSelectedChips] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const displayed = mealIdeas.length > 0 ? mealIdeas : IDEAS

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
    )
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const ideas = await generateMealIdeas({
        target,
        savedFoods,
        chips: selectedChips,
        freeText: freeText.trim(),
      })
      setMealIdeas(ideas)
      setExpanded(false)
      setSelectedChips([])
      setFreeText('')
    } catch {
      showToast('Could not generate ideas — check server is running')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Meal ideas</h3>
        <button
          className="btn ghost"
          style={{ minHeight: 32, padding: '0 10px', fontSize: 13 }}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Cancel' : '✦ Generate'}
        </button>
      </div>

      {expanded && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {CHIPS.map((chip) => {
              const on = selectedChips.includes(chip)
              return (
                <button
                  key={chip}
                  onClick={() => toggleChip(chip)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: on ? 600 : 400,
                    cursor: 'pointer',
                    border: `1.5px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                    background: on ? 'var(--accent)' : 'transparent',
                    color: on ? '#fff' : 'var(--fg)',
                    transition: 'all 0.15s',
                  }}
                >
                  {chip}
                </button>
              )
            })}
          </div>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Anything else? e.g. no gluten, I have leftover chicken…"
            rows={2}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--fg)',
              fontSize: 14,
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            className="btn"
            style={{ marginTop: 10, width: '100%' }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating…' : 'Generate ideas'}
          </button>
        </div>
      )}

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
  )
}
