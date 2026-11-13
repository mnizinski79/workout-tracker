import { IDEAS } from '../../domain/plan'

export function MealIdeas() {
  return (
    <section className="card">
      <h3>Meal ideas</h3>
      {IDEAS.map((idea, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 52, padding: '6px 0' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{idea.m}</div>
            <div className="meta">{idea.t}</div>
          </div>
          <span className="fg">{idea.g} g</span>
        </div>
      ))}
    </section>
  )
}
