import { useEffect, useState } from 'react'
import { useStore } from './store/index'
import { ymd } from './domain/types'
import { localAdapter } from './storage/local'
import { Header } from './components/shared/Header'
import { Tabs } from './components/shared/Tabs'
import { DateNav } from './components/shared/DateNav'
import { Toast } from './components/shared/Toast'
import { PhotoViewer } from './components/shared/PhotoViewer'
import { Today } from './components/today/Today'
import { Protein } from './components/protein/Protein'
import { Progress } from './components/progress/Progress'
import { Data } from './components/data/Data'

type TabId = 'today' | 'protein' | 'progress' | 'data'

export default function App() {
  const [tab, setTab] = useState<TabId>('today')
  const [date, setDate] = useState(() => ymd(new Date()))
  const [ready, setReady] = useState(false)
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null)
  const [viewingPhotoDate, setViewingPhotoDate] = useState<string | null>(null)
  const removePhoto = useStore((s) => s.removePhoto)

  useEffect(() => {
    localAdapter.load().then((data) => {
      useStore.setState(data)
      setReady(true)
    })
  }, [])

  const openPhoto = (photoId: string, photoDate: string) => {
    setViewingPhoto(photoId)
    setViewingPhotoDate(photoDate)
  }

  const closePhoto = () => {
    setViewingPhoto(null)
    setViewingPhotoDate(null)
  }

  if (!ready) return null

  return (
    <>
      <Header />
      <Tabs active={tab} onChange={setTab} />
      {tab !== 'data' && (
        <DateNav
          date={date}
          onPrev={() => {
            const d = new Date(`${date}T12:00:00`)
            d.setDate(d.getDate() - 1)
            setDate(ymd(d))
          }}
          onNext={() => {
            const d = new Date(`${date}T12:00:00`)
            d.setDate(d.getDate() + 1)
            setDate(ymd(d))
          }}
          onToday={() => setDate(ymd(new Date()))}
        />
      )}
      {tab === 'today' && <Today date={date} onPhotoOpen={openPhoto} />}
      {tab === 'protein' && <Protein date={date} />}
      {tab === 'progress' && <Progress date={date} onPhotoOpen={openPhoto} />}
      {tab === 'data' && <Data />}
      <Toast />
      {viewingPhoto && (
        <PhotoViewer
          photoId={viewingPhoto}
          date={viewingPhotoDate}
          onClose={closePhoto}
          onDelete={(photoId, photoDate) => {
            removePhoto(photoDate, photoId)
            closePhoto()
          }}
        />
      )}
    </>
  )
}
