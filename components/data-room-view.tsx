"use client"

import { ChevronLeft } from "lucide-react"
import { useDataRoom } from "@/lib/data-room-context"
import { Button } from "@/components/ui/button"
import { FolderView } from "@/components/folder-view"
import { useRouter } from "next/navigation"

export function DataRoomView() {
  const { currentDataRoom, selectDataRoom } = useDataRoom()
  const router = useRouter()

  if (!currentDataRoom) return null

  const handleBack = () => {
    selectDataRoom(null)
    router.replace("/protected", { scroll: false })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
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
