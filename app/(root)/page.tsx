"use client"

import { useState } from "react"
import { useDataRoom } from "@/lib/data-room-context"
import { DataRoomSelector } from "@/components/data-room-selector"
import { SharedWithMe } from "@/components/shared-with-me"
import { FolderOpen, UserPlus } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const Dashboard = () => {
    console.log('bla bla')
  const { isLoading } = useDataRoom()
  const [activeTab, setActiveTab] = useState("my-rooms")

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
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="my-rooms" className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          My Data Rooms
        </TabsTrigger>
        <TabsTrigger value="shared" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Shared With Me
        </TabsTrigger>
      </TabsList>

      <TabsContent value="my-rooms">
        <DataRoomSelector />
      </TabsContent>

      <TabsContent value="shared">
        <SharedWithMe />
      </TabsContent>
    </Tabs>
  )
}

export default Dashboard