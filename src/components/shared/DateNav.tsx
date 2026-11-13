import { CaretLeft, CaretRight, CalendarBlank } from '@phosphor-icons/react'
import { ymd } from '../../domain/types'

interface DateNavProps {
  date: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  hideArrows?: boolean
}

function formatDate(key: string): string {
  const d = new Date(`${key}T12:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function DateNav({ date, onPrev, onNext, onToday, hideArrows }: DateNavProps) {
  const today = ymd(new Date())
  const isToday = date === today

  return (
    <div className="datenav">
      {hideArrows ? (
        <span style={{ width: 40 }} />
      ) : (
        <button className="ib" onClick={onPrev} aria-label="Previous day">
          <CaretLeft size={20} weight="bold" aria-hidden="true" />
        </button>
      )}
      <h1>{formatDate(date)}</h1>
      {hideArrows ? (
        <span style={{ width: 40 }} />
      ) : (
        <button
          className="ib"
          onClick={onNext}
          disabled={isToday}
          aria-disabled={isToday ? 'true' : undefined}
          aria-label="Next day"
        >
          <CaretRight size={20} weight="bold" aria-hidden="true" />
        </button>
      )}
      {!hideArrows && !isToday && (
        <button className="todaylink" onClick={onToday}>
          <CalendarBlank size={14} aria-hidden="true" />
          Back to today
        </button>
      )}
    </div>
  )
}
