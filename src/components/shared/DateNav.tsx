import { ymd } from '../../domain/types'

interface DateNavProps {
  date: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

function formatDate(key: string): string {
  const d = new Date(`${key}T12:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function DateNav({ date, onPrev, onNext, onToday }: DateNavProps) {
  const today = ymd(new Date())
  const isToday = date === today

  return (
    <div className="datenav">
      <button className="ib" onClick={onPrev} aria-label="Previous day">
        ‹
      </button>
      <h1>{formatDate(date)}</h1>
      <button
        className="ib"
        onClick={onNext}
        disabled={isToday}
        aria-disabled={isToday ? 'true' : undefined}
        aria-label="Next day"
      >
        ›
      </button>
      {!isToday && (
        <button className="todaylink" onClick={onToday}>
          Back to today
        </button>
      )}
    </div>
  )
}
