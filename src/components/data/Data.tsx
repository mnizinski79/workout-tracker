import { useRef } from 'react'
import { DownloadSimple, UploadSimple } from '@phosphor-icons/react'
import { useStore } from '../../store/index'
import { showToast } from '../../lib/toast'
import { merge } from '../../domain/merge'

export function Data() {
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data = exportData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lpl-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Exported')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const incoming = JSON.parse(reader.result as string)
        const current = exportData()
        const merged = merge(current, incoming)
        importData(merged)
        showToast('Imported')
      } catch {
        showToast('Could not read file')
      }
      if (fileRef.current) fileRef.current.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <main>
      <section className="card">
        <h3>Export</h3>
        <p className="meta">
          Download all your logged data as a JSON file. Photos are stored separately on this device
          and are not included in the export.
        </p>
        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={handleExport}>
            <DownloadSimple size={18} aria-hidden="true" />
            Export JSON
          </button>
        </div>
      </section>

      <section className="card">
        <h3>Import</h3>
        <p className="meta">
          Import a previously exported JSON file. Existing data is merged — the more recently
          updated day wins.
        </p>
        <div style={{ marginTop: 12 }}>
          <label>
            <span className="btn" role="button" tabIndex={0}>
              <UploadSimple size={18} aria-hidden="true" />
              Import JSON
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
              onChange={handleImport}
            />
          </label>
        </div>
      </section>
    </main>
  )
}
