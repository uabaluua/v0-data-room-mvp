"use client"

import { useDataRoom } from "@/lib/data-room-context"
import { DataRoomSelector } from "@/components/data-room-selector"
import { DataRoomView } from "@/components/data-room-view"

export default function HomePage() {
  const { currentDataRoom, isLoading } = useDataRoom()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">{currentDataRoom ? <DataRoomView /> : <DataRoomSelector />}</div>
    </div>
  )
}
