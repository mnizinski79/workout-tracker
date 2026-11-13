import { useStore } from '../../store/index'
import { FOODS, CATS } from '../../domain/plan'

interface FoodListProps {
  date: string
  veganOnly: boolean
}

export function FoodList({ date, veganOnly }: FoodListProps) {
  const addProteinItem = useStore((s) => s.addProteinItem)

  let firstCat = true
  return (
    <section className="card">
      {CATS.map((cat) => {
        const foods = FOODS.filter((f) => f.c === cat && (!veganOnly || f.v))
        if (!foods.length) return null
        const mt = firstCat ? 0 : 28
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
