"use client"

import { useState } from "react"
import { useDataRoom } from "@/lib/data-room-context"
import { DataRoomSelector } from "@/components/data-room-selector"
import { DataRoomView } from "@/components/data-room-view"
import { SharedWithMe } from "@/components/shared-with-me"
import { Button } from "@/components/ui/button"
import { GlobalSearch } from "@/components/global-search"
import { LogOut, FolderOpen, UserPlus } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function DataRoomApp({ userId, userEmail }: { userId: string; userEmail: string }) {
  const { currentDataRoom, isLoading } = useDataRoom()
  const [activeTab, setActiveTab] = useState("my-rooms")
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

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
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Data Room</h1>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
          <GlobalSearch />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {currentDataRoom ? (
          <DataRoomView />
        ) : (
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
        )}
      </div>
    </div>
  )
}
