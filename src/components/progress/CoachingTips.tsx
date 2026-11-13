import { useState } from 'react'
import type { DayRecord } from '../../domain/types'
import { didLift, didBike } from '../../domain/stats'
import { protTotal } from '../../domain/protein'

interface CoachingTipsProps {
  date: string
  days: Record<string, DayRecord>
  target: number
}

function last28(date: string): string[] {
  const keys: string[] = []
  const d = new Date(`${date}T12:00:00`)
  for (let i = 27; i >= 0; i--) {
    const dd = new Date(d)
    dd.setDate(d.getDate() - i)
    keys.push(dd.toISOString().slice(0, 10))
  }
  return keys
}

function buildSummary(date: string, days: Record<string, DayRecord>, target: number): string {
  const keys = last28(date)
  const rows = keys.map((k) => {
    const day = days[k]
    const lifted = didLift(day) ? 'yes' : 'no'
    const biked = didBike(day) ? 'yes' : 'no'
    const prot = day ? Math.round(protTotal(day)) : 0
    const bw = day?.bw ? `${day.bw} lb` : '—'
    return `${k}: lift=${lifted}, bike=${biked}, protein=${prot}g, weight=${bw}`
  })

  const liftDays = keys.filter((k) => didLift(days[k])).length
  const bikeDays = keys.filter((k) => didBike(days[k])).length
  const protHit = keys.filter((k) => days[k] && protTotal(days[k]) >= target).length

  return [
    `Protein goal: ${target}g/day`,
    `Over the last 28 days: lifted ${liftDays}/28 days, biked ${bikeDays}/28 days, hit protein goal ${protHit}/28 days.`,
    '',
    'Daily log:',
    ...rows,
  ].join('\n')
}

export function CoachingTips({ date, days, target }: CoachingTipsProps) {
  const [tips, setTips] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  async function fetchTips() {
    setLoading(true)
    setError(false)
    setTips([])
    try {
      const summary = buildSummary(date, days, target)
      const res = await fetch('/api/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const raw = (data.tips as string).trim()
      const byParagraph = raw.split(/\n\n+/).map((t) => t.trim()).filter(Boolean)
      const parsed = byParagraph.length > 1 ? byParagraph : raw.split(/\n/).map((t) => t.trim()).filter(Boolean)
      setTips(parsed)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tips.length ? 16 : 0 }}>
        <h3 style={{ margin: 0 }}>Coaching tips</h3>
        <button
          className="btn ghost"
          style={{ minHeight: 32, padding: '0 10px', fontSize: 13 }}
          onClick={fetchTips}
          disabled={loading}
        >
          {loading ? '…' : tips.length ? '↺ Refresh' : '✦ Get tips'}
        </button>
      </div>

      {loading && (
        <div style={{ color: 'var(--muted)', fontSize: 14, paddingTop: 12 }}>
          Analyzing your last 4 weeks…
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--muted)', fontSize: 14, paddingTop: 12 }}>
          Couldn't load tips — check your connection and try again.
        </div>
      )}

      {tips.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tips.map((tip, i) => (
            <div key={i} style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink)' }}>
              {tip}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
