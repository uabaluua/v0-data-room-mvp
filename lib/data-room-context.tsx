"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export interface DataRoom {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  name: string
  data_room_id: string
  parent_id: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface File {
  id: string
  name: string
  data_room_id: string
  folder_id: string | null
  content: string
  size: number
  mime_type: string
  owner_id: string
  created_at: string
  updated_at: string
}

interface DataRoomContextType {
  // State
  dataRooms: DataRoom[]
  folders: Folder[]
  files: File[]
  currentDataRoom: DataRoom | null
  currentFolder: Folder | null

  // Data Room operations
  createDataRoom: (name: string) => Promise<void>
  renameDataRoom: (id: string, newName: string) => Promise<void>
  deleteDataRoom: (id: string) => Promise<void>
  selectDataRoom: (dataRoom: DataRoom | null) => void

  // Folder operations
  createFolder: (name: string, parentFolderId: string | null) => Promise<void>
  renameFolder: (id: string, newName: string) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  selectFolder: (folder: Folder | null) => void
  getFolderPath: (folderId: string | null) => Folder[]

  // File operations
  uploadFile: (name: string, content: string, folderId: string | null, size: number) => Promise<void>
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
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      setUserId(user.id)

      // Load data rooms
      const { data: dataRoomsData } = await supabase
        .from("data_rooms")
        .select("*")
        .order("created_at", { ascending: false })

      if (dataRoomsData) {
        setDataRooms(dataRoomsData)
      }

      setIsLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    async function loadFolders() {
      if (!currentDataRoom) {
        setFolders([])
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from("folders")
        .select("*")
        .eq("data_room_id", currentDataRoom.id)
        .order("created_at", { ascending: true })

      if (data) {
        setFolders(data)
      }
    }
    loadFolders()
  }, [currentDataRoom])

  useEffect(() => {
    async function loadFiles() {
      if (!currentDataRoom) {
        setFiles([])
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from("files")
        .select("*")
        .eq("data_room_id", currentDataRoom.id)
        .order("created_at", { ascending: true })

      if (data) {
        setFiles(data)
      }
    }
    loadFiles()
  }, [currentDataRoom, currentFolder])

  // Data Room operations
  const createDataRoom = useCallback(
    async (name: string) => {
      if (!userId) return

      const supabase = createClient()
      const { data, error } = await supabase
        .from("data_rooms")
        .insert({
          name,
          owner_id: userId,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating data room:", error)
        throw error
      }

      if (data) {
        setDataRooms((prev) => [...prev, data])
      }
    },
    [userId],
  )

  const renameDataRoom = useCallback(
    async (id: string, newName: string) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("data_rooms")
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error renaming data room:", error)
        throw error
      }

      if (data) {
        setDataRooms((prev) => prev.map((dr) => (dr.id === id ? data : dr)))

        if (currentDataRoom?.id === id) {
          setCurrentDataRoom(data)
        }
      }
    },
    [currentDataRoom],
  )

  const deleteDataRoom = useCallback(
    async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from("data_rooms").delete().eq("id", id)

      if (error) {
        console.error("Error deleting data room:", error)
        throw error
      }

      setDataRooms((prev) => prev.filter((dr) => dr.id !== id))

      if (currentDataRoom?.id === id) {
        setCurrentDataRoom(null)
        setCurrentFolder(null)
      }
    },
    [currentDataRoom],
  )

  const selectDataRoom = useCallback((dataRoom: DataRoom | null) => {
    setCurrentDataRoom(dataRoom)
    setCurrentFolder(null)
  }, [])

  // Folder operations
  const createFolder = useCallback(
    async (name: string, parentFolderId: string | null) => {
      if (!currentDataRoom || !userId) return

      const supabase = createClient()
      const { data, error } = await supabase
        .from("folders")
        .insert({
          name,
          data_room_id: currentDataRoom.id,
          parent_id: parentFolderId,
          owner_id: userId,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating folder:", error)
        throw error
      }

      if (data) {
        setFolders((prev) => [...prev, data])
      }
    },
    [currentDataRoom, userId],
  )

  const renameFolder = useCallback(async (id: string, newName: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("folders")
      .update({ name: newName, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error renaming folder:", error)
      throw error
    }

    if (data) {
      setFolders((prev) => prev.map((f) => (f.id === id ? data : f)))
    }
  }, [])

  const deleteFolder = useCallback(
    async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from("folders").delete().eq("id", id)

      if (error) {
        console.error("Error deleting folder:", error)
        throw error
      }

      setFolders((prev) => prev.filter((f) => f.id !== id))

      if (currentFolder?.id === id) {
        setCurrentFolder(null)
      }
    },
    [currentFolder],
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
        currentId = folder.parent_id
      }

      return path
    },
    [folders],
  )

  // File operations
  const uploadFile = useCallback(
    async (name: string, content: string, folderId: string | null, size: number) => {
      if (!currentDataRoom || !userId) return

      const supabase = createClient()
      const { data, error } = await supabase
        .from("files")
        .insert({
          name,
          data_room_id: currentDataRoom.id,
          folder_id: folderId,
          content,
          size,
          mime_type: "application/pdf",
          owner_id: userId,
        })
        .select()
        .single()

      if (error) {
        console.error("Error uploading file:", error)
        throw error
      }

      if (data) {
        setFiles((prev) => [...prev, data])
      }
    },
    [currentDataRoom, userId],
  )

  const renameFile = useCallback(async (id: string, newName: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("files")
      .update({ name: newName, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error renaming file:", error)
      throw error
    }

    if (data) {
      setFiles((prev) => prev.map((f) => (f.id === id ? data : f)))
    }
  }, [])

  const deleteFile = useCallback(async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("files").delete().eq("id", id)

    if (error) {
      console.error("Error deleting file:", error)
      throw error
    }

    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  return (
    <DataRoomContext.Provider
      value={{
        dataRooms,
        folders,
        files,
        currentDataRoom,
        currentFolder,
        createDataRoom,
        renameDataRoom,
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
