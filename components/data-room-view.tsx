"use client"

import { ChevronLeft } from "lucide-react"
import { useDataRoom } from "@/lib/data-room-context"
import { Button } from "@/components/ui/button"
import { FolderView } from "@/components/folder-view"

export function DataRoomView() {
  const { currentDataRoom, selectDataRoom } = useDataRoom()

  if (!currentDataRoom) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => selectDataRoom(null)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{currentDataRoom.name}</h1>
          <p className="text-sm text-muted-foreground">Manage folders and documents</p>
        </div>
      </div>
      <FolderView />
    </div>
  )
}
