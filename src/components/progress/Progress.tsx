import { useRef, useState } from 'react'
import { useStore } from '../../store/index'
import { last14 } from '../../domain/stats'
import { ALLEX } from '../../domain/plan'
import { PhotoViewer } from '../shared/PhotoViewer'
import { DotGrid } from './DotGrid'
import { SparkLine } from './SparkLine'
import { BodyWeightChart } from './BodyWeightChart'
import { PhotoGallery } from './PhotoGallery'

interface ProgressProps {
  date: string
}

export function Progress({ date }: ProgressProps) {
  const days = useStore((s) => s.days)
  const target = useStore((s) => s.target)
  const setBodyWeight = useStore((s) => s.setBodyWeight)
  const removePhoto = useStore((s) => s.removePhoto)
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null)
  const [viewingDate, setViewingDate] = useState<string | null>(null)
  const bwRef = useRef<HTMLInputElement>(null)

  const keys = last14(date)
  const today = days[date]

  return (
    <main>
      <section className="card">
        <h3>Last 14 days</h3>
        <DotGrid date={date} days={days} target={target} />
      </section>

      {/* Exercise sparklines */}
      {ALLEX.map((ex) => {
        const vals = keys
          .map((k) => {
            const e = days[k]?.ex?.[ex.id]
            if (!e) return null
            const done = e.sets.filter((s) => s.d)
            if (done.length === 0) return null
            return e.w ?? null
          })
          .filter((v): v is number => v !== null)
        if (vals.length === 0) return null
        return (
          <section key={ex.id} className="card spark-row">
            <span className="spark-label">{ex.n}</span>
            <SparkLine vals={vals} />
            <span className="spark-last">{vals[vals.length - 1]} lb</span>
          </section>
        )
      })}

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

      <PhotoGallery
        days={days}
        onPhotoOpen={(id) => {
          const d = Object.entries(days).find(([, day]) => day.photos?.some((p) => p.id === id))?.[0] ?? date
          setViewingPhoto(id)
          setViewingDate(d)
        }}
      />

      {viewingPhoto && (
        <PhotoViewer
          photoId={viewingPhoto}
          date={viewingDate}
          onClose={() => { setViewingPhoto(null); setViewingDate(null) }}
          onDelete={(photoId, photoDate) => {
            removePhoto(photoDate, photoId)
            setViewingPhoto(null)
            setViewingDate(null)
          }}
        />
      )}
    </main>
  )
}
