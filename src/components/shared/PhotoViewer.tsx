import { useEffect, useState } from 'react'
import { X, Trash } from '@phosphor-icons/react'
import { usePhotoUrl } from '../../hooks/usePhotoUrl'

interface PhotoViewerProps {
  photoId: string | null
  date: string | null
  onClose: () => void
  onDelete: (photoId: string, date: string) => void
}

export function PhotoViewer({ photoId, date, onClose, onDelete }: PhotoViewerProps) {
  const [pendingDelete, setPendingDelete] = useState(false)
  const url = usePhotoUrl(photoId ?? '')

  useEffect(() => {
    if (!photoId) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [photoId, onClose])

  useEffect(() => {
    setPendingDelete(false)
  }, [photoId])

  if (!photoId || !date) return null

  const handleDelete = () => {
    if (pendingDelete) {
      onDelete(photoId, date)
    } else {
      setPendingDelete(true)
    }
  }

  return (
    <div id="pv" role="dialog" aria-modal="true" aria-label="Session photo">
      {url ? (
        <img src={url} alt="Session photo" />
      ) : (
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>Photo unavailable</div>
      )}
      <div className="pvb">
        <button className="btn ghost" onClick={onClose} aria-label="Close">
          <X size={18} weight="bold" aria-hidden="true" />
          Close
        </button>
        <button className="btn" onClick={handleDelete}>
          <Trash size={18} aria-hidden="true" />
          {pendingDelete ? 'Tap again to delete' : 'Remove photo'}
        </button>
      </div>
    </div>
  )
}
