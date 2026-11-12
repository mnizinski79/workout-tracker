import type { AppData } from '../domain/types'

export interface StorageAdapter {
  load(): Promise<AppData>
  save(data: AppData): Promise<void>
  loadBlob(id: string): Promise<Blob | null>
  saveBlob(id: string, blob: Blob): Promise<void>
  deleteBlob(id: string): Promise<void>
}
