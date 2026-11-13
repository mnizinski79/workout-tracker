import { useState, useRef } from 'react'
import { useStore } from '../../store/index'
import { FOODS, CATS } from '../../domain/plan'

interface FoodListProps {
  date: string
  veganOnly: boolean
}

export function FoodList({ date, veganOnly }: FoodListProps) {
  const addProteinItem = useStore((s) => s.addProteinItem)
  const savedFoods = useStore((s) => s.savedFoods)
  const removeSavedFood = useStore((s) => s.removeSavedFood)
  const updateSavedFood = useStore((s) => s.updateSavedFood)
  const [editMode, setEditMode] = useState(false)
  const nameRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const gramRefs = useRef<Record<string, HTMLInputElement | null>>({})

  let firstCat = true
  return (
    <section className="card">
      {savedFoods.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h3 style={{ marginTop: 0 }}>Saved foods</h3>
            <button
              className="btn ghost"
              style={{ minHeight: 32, padding: '0 10px', fontSize: 13 }}
              onClick={() => setEditMode((v) => !v)}
            >
              {editMode ? 'Done' : 'Edit'}
            </button>
          </div>
          {savedFoods.map((f) => (
            <div key={f.id} className="food" style={{ cursor: editMode ? 'default' : undefined }}>
              <span className="fn">
                {editMode ? (
                  <input
                    ref={(el) => { nameRefs.current[f.id] = el }}
                    defaultValue={f.n}
                    onBlur={(e) => {
                      const g = Number(gramRefs.current[f.id]?.value ?? f.g)
                      updateSavedFood(f.id, e.target.value.trim() || f.n, isNaN(g) || g <= 0 ? f.g : g)
                    }}
                    style={{
                      fontSize: 15, fontWeight: 600, background: 'transparent',
                      border: 'none', borderBottom: '1px solid var(--accent)', color: 'inherit',
                      padding: '2px 0', outline: 'none', width: '100%',
                    }}
                  />
                ) : (
                  <span>{f.n}</span>
                )}
              </span>
              {editMode ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    ref={(el) => { gramRefs.current[f.id] = el }}
                    defaultValue={f.g}
                    onBlur={(e) => {
                      const g = Number(e.target.value)
                      const n = nameRefs.current[f.id]?.value.trim() || f.n
                      updateSavedFood(f.id, n, isNaN(g) || g <= 0 ? f.g : g)
                    }}
                    style={{
                      width: 52, textAlign: 'right', fontSize: 15, fontWeight: 700,
                      background: 'transparent', border: 'none',
                      borderBottom: '1px solid var(--accent)', color: 'var(--accent)',
                      padding: '2px 0', outline: 'none',
                    }}
                    inputMode="numeric"
                  />
                  <span style={{ color: 'var(--accent)', fontSize: 13 }}>g</span>
                  <button
                    onClick={() => removeSavedFood(f.id)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--muted)',
                      fontSize: 22, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addProteinItem(date, { id: `${Date.now()}-${f.id}`, n: f.n, g: f.g })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <span className="fg">+{f.g} g</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {CATS.map((cat) => {
        const foods = FOODS.filter((f) => f.c === cat && (!veganOnly || f.v))
        if (!foods.length) return null
        const mt = firstCat && savedFoods.length === 0 ? 0 : 28
        firstCat = false
        return (
          <div key={cat}>
            <h3 style={{ marginTop: mt }}>{cat}</h3>
            {foods.map((f) => (
              <button
                key={f.id}
                className="food"
                onClick={() =>
                  addProteinItem(date, {
                    id: `${Date.now()}-${f.id}`,
                    fid: f.id,
                    n: f.n,
                    g: f.g,
                  })
                }
              >
                <span className="fn">
                  <span>
                    {f.n}
                    {f.v ? <span className="tag">vegan</span> : null}
                  </span>
                  <small>{f.s}</small>
                </span>
                <span className="fg">+{f.g} g</span>
              </button>
            ))}
          </div>
        )
      })}
    </section>
  )
}
