import type { AppData } from '../domain/types'
import type { StorageAdapter } from './adapter'

const STORAGE_KEY = 'lpl-v1'
const DB_NAME = 'lpl-blobs'
const STORE_NAME = 'blobs'

function defaultData(): AppData {
  return { days: {}, target: 110, targetUpdated: 0 }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export const localAdapter: StorageAdapter = {
  async load(): Promise<AppData> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return defaultData()
      const parsed = JSON.parse(raw)
      return JSON.parse(JSON.stringify(parsed)) as AppData
    } catch {
      return defaultData()
    }
  },

  async save(data: AppData): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  },

  async loadBlob(id: string): Promise<Blob | null> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(id)
      req.onsuccess = () => resolve(req.result?.blob ?? null)
      req.onerror = () => reject(req.error)
    })
  },

  async saveBlob(id: string, blob: Blob): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const req = tx.objectStore(STORE_NAME).put({ id, blob })
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  },

  async deleteBlob(id: string): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const req = tx.objectStore(STORE_NAME).delete(id)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  },
}
