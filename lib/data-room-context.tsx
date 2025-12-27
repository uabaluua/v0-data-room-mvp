"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { DataRoom, Folder, File, StorageState } from "./storage"
import { getData, saveData, generateId } from "./storage"

interface DataRoomContextType {
  // State
  dataRooms: DataRoom[]
  folders: Folder[]
  files: File[]
  currentDataRoom: DataRoom | null
  currentFolder: Folder | null

  // Data Room operations
  createDataRoom: (name: string) => Promise<void>
  deleteDataRoom: (id: string) => Promise<void>
  selectDataRoom: (dataRoom: DataRoom | null) => void

  // Folder operations
  createFolder: (name: string, parentFolderId: string | null) => Promise<void>
  renameFolder: (id: string, newName: string) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  selectFolder: (folder: Folder | null) => void
  getFolderPath: (folderId: string | null) => Folder[]

  // File operations
  uploadFile: (name: string, content: string, folderId: string, size: number) => Promise<void>
  renameFile: (id: string, newName: string) => Promise<void>
  deleteFile: (id: string) => Promise<void>

  // Loading state
  isLoading: boolean
}

const DataRoomContext = createContext<DataRoomContextType | undefined>(undefined)

export function DataRoomProvider({ children }: { children: React.ReactNode }) {
  const [dataRooms, setDataRooms] = useState<DataRoom[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [currentDataRoom, setCurrentDataRoom] = useState<DataRoom | null>(null)
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load data from IndexedDB on mount
  useEffect(() => {
    async function loadData() {
      const data = await getData()
      setDataRooms(data.dataRooms)
      setFolders(data.folders)
      setFiles(data.files)
      setIsLoading(false)
    }
    loadData()
  }, [])

  // Save data to IndexedDB whenever it changes
  const saveState = useCallback(
    async (state: Partial<StorageState>) => {
      const fullState: StorageState = {
        dataRooms: state.dataRooms || dataRooms,
        folders: state.folders || folders,
        files: state.files || files,
      }
      await saveData(fullState)
    },
    [dataRooms, folders, files],
  )

  // Data Room operations
  const createDataRoom = useCallback(
    async (name: string) => {
      const newDataRoom: DataRoom = {
        id: generateId(),
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      const updated = [...dataRooms, newDataRoom]
      setDataRooms(updated)
      await saveState({ dataRooms: updated })
    },
    [dataRooms, saveState],
  )

  const deleteDataRoom = useCallback(
    async (id: string) => {
      const updated = dataRooms.filter((dr) => dr.id !== id)
      const updatedFolders = folders.filter((f) => f.dataRoomId !== id)
      const updatedFiles = files.filter((f) => f.dataRoomId !== id)

      setDataRooms(updated)
      setFolders(updatedFolders)
      setFiles(updatedFiles)

      if (currentDataRoom?.id === id) {
        setCurrentDataRoom(null)
        setCurrentFolder(null)
      }

      await saveData({ dataRooms: updated, folders: updatedFolders, files: updatedFiles })
    },
    [dataRooms, folders, files, currentDataRoom, saveState],
  )

  const selectDataRoom = useCallback((dataRoom: DataRoom | null) => {
    setCurrentDataRoom(dataRoom)
    setCurrentFolder(null)
  }, [])

  // Folder operations
  const createFolder = useCallback(
    async (name: string, parentFolderId: string | null) => {
      if (!currentDataRoom) return

      const newFolder: Folder = {
        id: generateId(),
        name,
        dataRoomId: currentDataRoom.id,
        parentFolderId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      const updated = [...folders, newFolder]
      setFolders(updated)
      await saveState({ folders: updated })
    },
    [currentDataRoom, folders, saveState],
  )

  const renameFolder = useCallback(
    async (id: string, newName: string) => {
      const updated = folders.map((f) => (f.id === id ? { ...f, name: newName, updatedAt: Date.now() } : f))
      setFolders(updated)
      await saveState({ folders: updated })
    },
    [folders, saveState],
  )

  const deleteFolder = useCallback(
    async (id: string) => {
      // Recursively find all descendant folders
      const getAllDescendants = (folderId: string): string[] => {
        const children = folders.filter((f) => f.parentFolderId === folderId)
        return [folderId, ...children.flatMap((child) => getAllDescendants(child.id))]
      }

      const foldersToDelete = getAllDescendants(id)
      const updatedFolders = folders.filter((f) => !foldersToDelete.includes(f.id))
      const updatedFiles = files.filter((f) => !foldersToDelete.includes(f.folderId))

      setFolders(updatedFolders)
      setFiles(updatedFiles)

      if (currentFolder?.id === id) {
        setCurrentFolder(null)
      }

      await saveData({ dataRooms, folders: updatedFolders, files: updatedFiles })
    },
    [folders, files, dataRooms, currentFolder],
  )

  const selectFolder = useCallback((folder: Folder | null) => {
    setCurrentFolder(folder)
  }, [])

  const getFolderPath = useCallback(
    (folderId: string | null): Folder[] => {
      if (!folderId) return []

      const path: Folder[] = []
      let currentId: string | null = folderId

      while (currentId) {
        const folder = folders.find((f) => f.id === currentId)
        if (!folder) break
        path.unshift(folder)
        currentId = folder.parentFolderId
      }

      return path
    },
    [folders],
  )

  // File operations
  const uploadFile = useCallback(
    async (name: string, content: string, folderId: string, size: number) => {
      if (!currentDataRoom) return

      const newFile: File = {
        id: generateId(),
        name,
        dataRoomId: currentDataRoom.id,
        folderId,
        content,
        size,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      const updated = [...files, newFile]
      setFiles(updated)
      await saveState({ files: updated })
    },
    [currentDataRoom, files, saveState],
  )

  const renameFile = useCallback(
    async (id: string, newName: string) => {
      const updated = files.map((f) => (f.id === id ? { ...f, name: newName, updatedAt: Date.now() } : f))
      setFiles(updated)
      await saveState({ files: updated })
    },
    [files, saveState],
  )

  const deleteFile = useCallback(
    async (id: string) => {
      const updated = files.filter((f) => f.id !== id)
      setFiles(updated)
      await saveState({ files: updated })
    },
    [files, saveState],
  )

  return (
    <DataRoomContext.Provider
      value={{
        dataRooms,
        folders,
        files,
        currentDataRoom,
        currentFolder,
        createDataRoom,
        deleteDataRoom,
        selectDataRoom,
        createFolder,
        renameFolder,
        deleteFolder,
        selectFolder,
        getFolderPath,
        uploadFile,
        renameFile,
        deleteFile,
        isLoading,
      }}
    >
      {children}
    </DataRoomContext.Provider>
  )
}

export function useDataRoom() {
  const context = useContext(DataRoomContext)
  if (context === undefined) {
    throw new Error("useDataRoom must be used within a DataRoomProvider")
  }
  return context
}
