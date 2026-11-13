interface SparkLineProps {
  vals: number[]
}

export function SparkLine({ vals }: SparkLineProps) {
  if (vals.length < 2) return null
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const n = vals.length

  const pts = vals
    .map((v, i) => {
      const x = 2 + (i * 88) / (n - 1)
      const y = max === min ? 13 : 23 - ((v - min) / (max - min)) * 20
      return `${x},${y}`
    })
    .join(' ')

  const lastX = 2 + (88 * (n - 1)) / (n - 1)
  const lastY = max === min ? 13 : 23 - ((vals[n - 1] - min) / (max - min)) * 20

  return (
    <svg aria-hidden="true" className="sp" viewBox="0 0 92 26">
      <polyline points={pts} />
      <circle cx={lastX} cy={lastY} r="3" />
    </svg>
  )
}
