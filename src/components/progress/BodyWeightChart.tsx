import type { DayRecord } from '../../domain/types'
import { last14 } from '../../domain/stats'

interface BodyWeightChartProps {
  date: string
  days: Record<string, DayRecord>
}

const L = 40, R = 12, T = 12, B = 22
const W = 320, H = 110
const IW = W - L - R
const IH = H - T - B

export function BodyWeightChart({ date, days }: BodyWeightChartProps) {
  const keys = last14(date)
  const pts: { k: string; bw: number }[] = keys
    .filter((k) => days[k]?.bw && !isNaN(Number(days[k].bw)))
    .map((k) => ({ k, bw: Number(days[k].bw) }))

  if (pts.length < 2) {
    return (
      <div className="card">
        <h3>Body weight</h3>
        <div className="empty">Log your weight on at least 2 days to see the chart.</div>
      </div>
    )
  }

  const minV = Math.min(...pts.map((p) => p.bw))
  const maxV = Math.max(...pts.map((p) => p.bw))
  const range = maxV - minV || 1
  const allKeys = keys

  const toX = (k: string) => L + (allKeys.indexOf(k) / (allKeys.length - 1)) * IW
  const toY = (v: number) => T + IH - ((v - minV) / range) * IH

  const polyPts = pts.map((p) => `${toX(p.k)},${toY(p.bw)}`).join(' ')
  const last = pts[pts.length - 1]

  const firstDate = new Date(`${pts[0].k}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const lastDate = new Date(`${last.k}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <section className="card">
      <h3>Body weight</h3>
      <svg
        role="img"
        aria-label={`Body weight from ${firstDate} to ${lastDate}`}
        className="bwc"
        viewBox={`0 0 ${W} ${H}`}
      >
        {/* Grid lines */}
        <line x1={L} y1={T} x2={L} y2={T + IH} />
        <line x1={L} y1={T + IH} x2={L + IW} y2={T + IH} />
        {/* Y labels */}
        <text x={L - 4} y={T + 4} textAnchor="end">{maxV} lb</text>
        <text x={L - 4} y={T + IH + 4} textAnchor="end">{minV} lb</text>
        {/* Line */}
        <polyline points={polyPts} />
        <circle cx={toX(last.k)} cy={toY(last.bw)} r="4" />
        {/* X labels */}
        <text x={toX(pts[0].k)} y={H - 4} textAnchor="middle">{firstDate}</text>
        <text x={toX(last.k)} y={H - 4} textAnchor="middle">{lastDate}</text>
      </svg>
    </section>
  )
}
