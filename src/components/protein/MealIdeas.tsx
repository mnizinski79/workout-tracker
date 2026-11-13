import { IDEAS } from '../../domain/plan'

export function MealIdeas() {
  return (
    <section className="card">
      <h3>Meal ideas</h3>
      {IDEAS.map((idea, i) => (
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
