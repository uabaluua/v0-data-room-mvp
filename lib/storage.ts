// Storage utilities for Data Room application
// Uses IndexedDB for persistent browser storage

export interface DataRoom {
  id: string
  name: string
  created_at: number
  updatedAt: number
}

export interface Folder {
  id: string
  name: string
  dataRoomId: string
  parentFolderId: string | null // null means root level
  created_at: number
  updatedAt: number
}

export interface File {
  id: string
  name: string
  dataRoomId: string
  folderId: string
  content: string // Base64 encoded PDF content
  size: number
  created_at: number
  updatedAt: number
}

export interface StorageState {
  dataRooms: DataRoom[]
  folders: Folder[]
  files: File[]
}

const DB_NAME = "DataRoomDB"
const DB_VERSION = 1
const STORE_NAME = "dataroom_store"

// Initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

// Get data from IndexedDB
export async function getData(): Promise<StorageState> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get("data")

      request.onsuccess = () => {
        const data = request.result
        resolve(data || { dataRooms: [], folders: [], files: [] })
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("[v0] Error loading data from IndexedDB:", error)
    return { dataRooms: [], folders: [], files: [] }
  }
}

// Save data to IndexedDB
export async function saveData(data: StorageState): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(data, "data")

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("[v0] Error saving data to IndexedDB:", error)
  }
}

// Helper function to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
