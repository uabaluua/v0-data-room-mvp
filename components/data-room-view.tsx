"use client"

import { useEffect, useState } from "react"
import { useDataRoom } from "@/lib/data-room-context"
import { FolderView } from "@/components/folder-view"
import { createClient } from "@/lib/supabase/client"
import type { DataRoom } from "@/types"

export function DataRoomView({roomId, folderId}: {roomId: string, folderId: string | null}) {
  const { selectDataRoom, selectLoadedDataRoom, selectFolder, currentDataRoom, dataRooms } = useDataRoom()
  const [isLoading, setIsLoading] = useState(false)
  const [loadedDataRoom, setLoadedDataRoom] = useState<DataRoom | null>(null)

  // Find the data room from the list
  const dataRoom = dataRooms.find((dr) => dr.id === roomId) || currentDataRoom || loadedDataRoom

  useEffect(() => {
    if (roomId) {
      // First try to select from existing data rooms
      const found = selectDataRoom(roomId)
      
      // If not found, load it from the database (for shared data rooms)
      if (!found && !loadedDataRoom && roomId !== loadedDataRoom?.id) {
        setIsLoading(true)
        const supabase = createClient()
        supabase
          .from("data_rooms")
          .select("*")
          .eq("id", roomId)
          .single()
          .then(({ data, error }) => {
            setIsLoading(false)
            if (data && !error) {
              setLoadedDataRoom(data)
              // Try to select it (it might be added to context by now)
              selectLoadedDataRoom(data)
            } else {
              console.error("Error loading data room:", error)
            }
          })
      }
    }
    if (folderId) {
      selectFolder(folderId)
    }
  }, [roomId, selectDataRoom, selectLoadedDataRoom, folderId, selectFolder, loadedDataRoom])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data room...</p>
        </div>
      </div>
    )
  }

  if (!dataRoom) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-muted-foreground">Data room not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FolderView dataRoom={dataRoom} folderId={folderId} />
    </div>
  )
}
