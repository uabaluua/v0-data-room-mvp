"use client"

import { useEffect } from "react"
import { useDataRoom } from "@/lib/data-room-context"
import { FolderView } from "@/components/folder-view"

export function DataRoomView({roomId, folderId}: {roomId: string, folderId: string | null}) {
  const { selectDataRoom, selectFolder, currentDataRoom, dataRooms } = useDataRoom()

  useEffect(() => {
    if (roomId) {
      selectDataRoom(roomId)
    }
    if (folderId) {
      selectFolder(folderId)
    }
  }, [roomId, selectDataRoom, folderId, selectFolder])

  // Find the data room from the list
  const dataRoom = dataRooms.find((dr) => dr.id === roomId) || currentDataRoom

  if (!dataRoom) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{dataRoom.name}</h1>
          <p className="text-sm text-muted-foreground">Manage folders and documents</p>
        </div>
      </div>
      <FolderView dataRoom={dataRoom} folderId={folderId} />
    </div>
  )
}
