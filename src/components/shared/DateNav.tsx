import { CaretLeft, CaretRight } from '@phosphor-icons/react'

interface DateNavProps {
  date: string
  onPrev: () => void
  onNext: () => void
  hideArrows?: boolean
}

function formatDate(key: string): string {
  const d = new Date(`${key}T12:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function DateNav({ date, onPrev, onNext, hideArrows }: DateNavProps) {
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
        <button className="ib" onClick={onNext} aria-label="Next day">
          <CaretRight size={20} weight="bold" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
