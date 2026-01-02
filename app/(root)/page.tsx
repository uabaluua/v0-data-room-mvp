"use client"

import { useDataRoom } from "@/lib/data-room-context"
import { DataRoomSelector } from "@/components/data-room-selector"

const Dashboard = () => {
  const { isLoading } = useDataRoom()

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
    <div className="space-y-6">
      <DataRoomSelector />
    </div>
  )
}

export default Dashboard