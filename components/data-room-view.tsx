"use client"

import { useDataRoom } from "@/lib/data-room-context"
import { FolderView } from "@/components/folder-view"

export function DataRoomView({roomId, folderId}: {roomId: string, folderId: string | null}) {
  const { getDataRoomById } = useDataRoom()
  const currentDataRoom = getDataRoomById(roomId);

  if (!currentDataRoom) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{currentDataRoom.name}</h1>
          <p className="text-sm text-muted-foreground">Manage folders and documents</p>
        </div>
      </div>
      <FolderView dataRoom={currentDataRoom} folderId={folderId} />
    </div>
  )
}
