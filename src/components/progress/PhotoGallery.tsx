import type { DayRecord } from '../../domain/types'
import { usePhotoUrl } from '../../hooks/usePhotoUrl'

interface PhotoGalleryProps {
  days: Record<string, DayRecord>
  onPhotoOpen: (photoId: string) => void
}

function PhotoThumb({ id, onOpen }: { id: string; onOpen: (id: string) => void }) {
  const url = usePhotoUrl(id)
  return (
    <button
      className="ph"
      aria-label="View photo"
      onClick={() => onOpen(id)}
      type="button"
    >
      {url ? <img src={url} alt="" /> : <span className="meta">…</span>}
    </button>
  )
}

export function PhotoGallery({ days, onPhotoOpen }: PhotoGalleryProps) {
  const photos: Array<{ date: string; id: string }> = []
  for (const [date, day] of Object.entries(days)) {
    for (const p of day.photos ?? []) {
      photos.push({ date, id: p.id })
    }
  }
  photos.sort((a, b) => (a.date < b.date ? 1 : -1))
  const latest = photos.slice(0, 12)

  if (latest.length === 0) return null

  return (
    <section className="card">
      <h3>Photos</h3>
      <div className="photos">
        {latest.map((p) => (
          <PhotoThumb key={p.id} id={p.id} onOpen={onPhotoOpen} />
        ))}
      </div>
    </section>
  )
}
