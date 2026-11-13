import { useRef } from 'react'
import { useStore } from '../../store/index'
import { DotGrid } from './DotGrid'
import { BodyWeightChart } from './BodyWeightChart'
import { PhotoGallery } from './PhotoGallery'
import { CoachingTips } from './CoachingTips'
import { ProteinChart } from '../protein/ProteinChart'

interface ProgressProps {
  date: string
  onPhotoOpen: (photoId: string, date: string) => void
}

export function Progress({ date, onPhotoOpen }: ProgressProps) {
  const days = useStore((s) => s.days)
  const target = useStore((s) => s.target)
  const setBodyWeight = useStore((s) => s.setBodyWeight)
  const bwRef = useRef<HTMLInputElement>(null)

  const today = days[date]

  return (
    <main>
      <section className="card">
        <h3>Last 14 days</h3>
        <DotGrid date={date} days={days} />
      </section>

      <ProteinChart date={date} days={days} target={target} />

      {/* Body weight */}
      <section className="card">
        <div className="row">
          <h3 style={{ margin: 0 }}>Body weight</h3>
          <div className="row" style={{ gap: 6 }}>
            <label htmlFor="bw-today" className="meta" style={{ margin: 0 }}>
              Today
            </label>
            <input
              id="bw-today"
              className="num"
              style={{ width: 76 }}
              type="text"
              inputMode="decimal"
              ref={bwRef}
              defaultValue={today?.bw ?? ''}
              onBlur={(e) => setBodyWeight(date, e.target.value)}
              placeholder="lb"
            />
          </div>
        </div>
      </section>

      <BodyWeightChart date={date} days={days} />

      <CoachingTips date={date} days={days} target={target} />

      <PhotoGallery
        days={days}
        onPhotoOpen={(id) => {
          const d = Object.entries(days).find(([, day]) => day.photos?.some((p) => p.id === id))?.[0] ?? date
          onPhotoOpen(id, d)
        }}
      />
    </main>
  )
}
