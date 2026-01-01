"use client"

import { useState, useEffect } from "react"
import { useDataRoom } from "@/lib/data-room-context"
import { DataRoomSelector } from "@/components/data-room-selector"
import { DataRoomView } from "@/components/data-room-view"
import { SharedWithMe } from "@/components/shared-with-me"
import { Button } from "@/components/ui/button"
import { GlobalSearch } from "@/components/global-search"
import { LogOut, FolderOpen, UserPlus } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { PDFViewer } from "@/components/pdf-viewer"

export function DataRoomApp({ 
  userId, 
  userEmail,
  initialDataRoomId,
  initialFolderId,
  initialFileId,
}: { 
  userId: string
  userEmail: string
  initialDataRoomId?: string
  initialFolderId?: string
  initialFileId?: string
}) {
  const { currentDataRoom, isLoading, selectDataRoom, selectFolder, dataRooms, folders } = useDataRoom()
  const [activeTab, setActiveTab] = useState("my-rooms")
  const [viewingFileId, setViewingFileId] = useState<string | null>(initialFileId || null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Sync URL params with state
  useEffect(() => {
    if (initialDataRoomId && dataRooms.length > 0) {
      const dataRoom = dataRooms.find((dr) => dr.id === initialDataRoomId)
      if (dataRoom && (!currentDataRoom || currentDataRoom.id !== initialDataRoomId)) {
        selectDataRoom(dataRoom)
      }
    }
  }, [initialDataRoomId, dataRooms, currentDataRoom, selectDataRoom])

  useEffect(() => {
    if (initialFolderId && folders.length > 0) {
      const folder = folders.find((f) => f.id === initialFolderId)
      if (folder) {
        selectFolder(folder)
      }
    }
  }, [initialFolderId, folders, selectFolder])

  useEffect(() => {
    if (initialFileId && initialFileId !== viewingFileId) {
      setViewingFileId(initialFileId)
    }
  }, [initialFileId, viewingFileId])

  // Update URL when state changes (only if URL doesn't match)
  useEffect(() => {
    if (currentDataRoom) {
      const currentDataRoomParam = searchParams.get("dataRoom")
      const currentFolderParam = searchParams.get("folder")
      const currentFileParam = searchParams.get("file")
      
      // Only update URL if it doesn't match current state
      if (
        currentDataRoomParam !== currentDataRoom.id ||
        (viewingFileId && currentFileParam !== viewingFileId) ||
        (!viewingFileId && currentFileParam)
      ) {
        const params = new URLSearchParams()
        params.set("dataRoom", currentDataRoom.id)
        if (currentFolderParam) {
          params.set("folder", currentFolderParam)
        }
        if (viewingFileId) {
          params.set("file", viewingFileId)
        }
        router.replace(`/protected?${params.toString()}`, { scroll: false })
      }
    } else {
      // Clear URL params when no data room is selected
      const currentParams = searchParams.toString()
      if (currentParams) {
        router.replace("/protected", { scroll: false })
      }
    }
  }, [currentDataRoom?.id, viewingFileId, router])

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
          <>
            <DataRoomView />
            {viewingFileId && (
              <PDFViewer 
                fileId={viewingFileId} 
                onClose={() => {
                  setViewingFileId(null)
                  const params = new URLSearchParams()
                  params.set("dataRoom", currentDataRoom.id)
                  if (searchParams.get("folder")) {
                    params.set("folder", searchParams.get("folder")!)
                  }
                  router.replace(`/protected?${params.toString()}`, { scroll: false })
                }} 
              />
            )}
          </>
        ) : viewingFileId ? (
          // Show file viewer even if no data room is selected (for shared files)
          <PDFViewer 
            fileId={viewingFileId} 
            onClose={() => {
              setViewingFileId(null)
              router.replace("/protected", { scroll: false })
            }} 
          />
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
