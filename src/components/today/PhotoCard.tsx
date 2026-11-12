import { useRef } from 'react'
import { useStore } from '../../store/index'
import { localAdapter } from '../../storage/local'
import { resizePhoto } from '../../lib/resizePhoto'
import { showToast } from '../../lib/toast'
import { usePhotoUrl } from '../../hooks/usePhotoUrl'
import { blankDay } from '../../domain/types'

interface PhotoCardProps {
  date: string
  onPhotoOpen: (photoId: string, date: string) => void
}

function PhotoThumb({ photoId, date, onOpen }: { photoId: string; date: string; onOpen: () => void }) {
  const url = usePhotoUrl(photoId)
  return (
    <button className="ph" onClick={onOpen} aria-label="View photo">
      {url ? <img src={url} alt="Session photo" /> : <span style={{ display: 'block', height: '100%' }} />}
    </button>
  )
}

export function PhotoCard({ date, onPhotoOpen }: PhotoCardProps) {
  const days = useStore((s) => s.days)
  const addPhoto = useStore((s) => s.addPhoto)
  const fileRef = useRef<HTMLInputElement>(null)

  const day = days[date] ?? blankDay()
  const photos = day.photos

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    for (const file of Array.from(files)) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const blob = await resizePhoto(file)
      await localAdapter.saveBlob(id, blob)
      addPhoto(date, id)
      showToast('Photo added')
    }
  }

  return (
    <section className="card">
      <div className="row">
        <h3 style={{ margin: 0 }}>Session photos</h3>
        <button
          className="btn ghost"
          style={{ minHeight: 40 }}
          onClick={() => fileRef.current?.click()}
        >
          Add photo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          aria-label="Choose photos"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {photos.length > 0 && (
        <div className="photos">
          {photos.map((p) => (
            <PhotoThumb
              key={p.id}
              photoId={p.id}
              date={date}
              onOpen={() => onPhotoOpen(p.id, date)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
