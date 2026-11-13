import { useEffect, useState } from 'react'
import { localAdapter } from '../storage/local'

export function usePhotoUrl(id: string): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    let objectUrl: string | null = null
    localAdapter.loadBlob(id).then((blob) => {
      if (blob && active) {
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      }
    })
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [id])
  return url
}
