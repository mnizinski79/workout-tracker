import type { DayRecord } from '../../domain/types'
import { last14 } from '../../domain/stats'
import { protTotal } from '../../domain/protein'

interface ProteinChartProps {
  date: string
  days: Record<string, DayRecord>
  target: number
}

const L = 40, R = 12, T = 12, B = 22
const W = 320, H = 110
const IW = W - L - R
const IH = H - T - B

export function ProteinChart({ date, days, target }: ProteinChartProps) {
  const keys = last14(date)
  const pts = keys.map((k) => {
    const day = days[k]
    const g = day?.items ? Math.round(protTotal(day)) : 0
    return { k, g }
  })
  const filled = pts.filter((p) => p.g > 0)

  if (filled.length < 2) {
    return (
      <section className="card">
        <h3>Protein history</h3>
        <div className="empty">Log protein on at least 2 days to see the chart.</div>
      </section>
    )
  }

  const maxV = Math.max(...filled.map((p) => p.g), target)
  const barW = IW / keys.length
  const pad = barW * 0.18

  const toY = (v: number) => T + IH - (v / maxV) * IH
  const goalY = toY(target)

  const firstDate = new Date(`${filled[0].k}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const lastDate = new Date(`${filled[filled.length - 1].k}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <section className="card">
      <h3>Protein history</h3>
      <svg
        role="img"
        aria-label={`Protein intake from ${firstDate} to ${lastDate}`}
        className="bwc"
        viewBox={`0 0 ${W} ${H}`}
      >
        {/* Axes */}
        <line x1={L} y1={T} x2={L} y2={T + IH} />
        <line x1={L} y1={T + IH} x2={L + IW} y2={T + IH} />

        {/* Goal line */}
        <line
          x1={L} y1={goalY} x2={L + IW} y2={goalY}
          stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"
        />
        <text x={L - 4} y={goalY + 4} textAnchor="end">
          {target}g
        </text>

        {/* Bars */}
        {pts.map((p, i) => {
          if (p.g === 0) return null
          const x = L + i * barW + pad
          const bw = barW - pad * 2
          const y = toY(p.g)
          const hit = p.g >= target
          return (
            <rect
              key={p.k}
              x={x} y={y}
              width={bw} height={T + IH - y}
              rx="2"
              fill={hit ? 'var(--accent)' : 'var(--muted)'}
              opacity={hit ? 0.85 : 0.35}
            />
          )
        })}

        {/* Y label — only show when someone exceeded the goal */}
        {maxV > target && (
          <text x={L - 4} y={T + 4} textAnchor="end" style={{ fill: 'var(--muted)', fontSize: 9 }}>{maxV}g</text>
        )}

        {/* X labels */}
        <text x={L + keys.indexOf(filled[0].k) * barW + barW / 2} y={H - 4} textAnchor="middle">
          {firstDate}
        </text>
        <text x={L + keys.indexOf(filled[filled.length - 1].k) * barW + barW / 2} y={H - 4} textAnchor="middle">
          {lastDate}
        </text>
      </svg>
    </section>
  )
}
