import { IDEAS } from '../../domain/plan'

export function MealIdeas() {
  return (
    <section className="card">
      <h3>Meal ideas</h3>
      {IDEAS.map((idea, i) => (
        <div className="log" key={i}>
          <div>
            <div style={{ fontWeight: 600 }}>{idea.m}</div>
            <div className="meta">{idea.t}</div>
          </div>
          <div className="meta" style={{ whiteSpace: 'nowrap' }}>
            {idea.g} g
          </div>
        </div>
      ))}
    </section>
  )
}
