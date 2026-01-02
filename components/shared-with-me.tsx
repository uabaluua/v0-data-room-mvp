"use client"

import { useState, useEffect } from "react"
import { UserPlus, FolderOpen, Folder, FileText, Eye, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useDataRoom } from "@/lib/data-room-context"
import { PDFViewer } from "@/components/pdf-viewer"
import { useRouter } from "next/navigation"
import type { DataRoom, Folder as FolderType, File as FileType } from "@/types"

interface SharedItem {
  id: string
  type: "data_room" | "folder" | "file"
  item: DataRoom | FolderType | FileType
  permission: "view" | "edit"
  shared_by_email: string
  created_at: string
}

export function SharedWithMe() {
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewingFileId, setViewingFileId] = useState<string | null>(null)
  const { selectDataRoom, selectFolder } = useDataRoom()
  const router = useRouter()

  useEffect(() => {
    loadSharedItems()
  }, [])

  const loadSharedItems = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Get all shares for this user
    // Note: files(*) will include all fields including the data field
    const { data: shares, error } = await supabase
      .from("shares")
      .select(
        `
        *,
        profiles!shares_shared_by_fkey(email),
        data_rooms(*),
        folders(*),
        files(*)
      `,
      )
      .eq("shared_with", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading shared items:", error)
      setIsLoading(false)
      return
    }

    const items: SharedItem[] = []

    for (const share of shares || []) {
      if (share.data_rooms) {
        items.push({
          id: share.id,
          type: "data_room",
          item: share.data_rooms,
          permission: share.permission,
          shared_by_email: share.profiles?.email || "Unknown",
          created_at: share.created_at,
        })
      } else if (share.folders) {
        items.push({
          id: share.id,
          type: "folder",
          item: share.folders,
          permission: share.permission,
          shared_by_email: share.profiles?.email || "Unknown",
          created_at: share.created_at,
        })
      } else if (share.files) {
        items.push({
          id: share.id,
          type: "file",
          item: share.files,
          permission: share.permission,
          shared_by_email: share.profiles?.email || "Unknown",
          created_at: share.created_at,
        })
      }
    }

    setSharedItems(items)
    setIsLoading(false)
  }

  const handleOpenItem = async (item: SharedItem) => {
    if (item.type === "data_room") {
      const dataRoom = item.item as DataRoom
      // Use the item directly if not in dataRooms yet
      // selectDataRoom(dataRoom)
      router.push(`/data-room/${dataRoom.id}`)
    } else if (item.type === "folder") {
      const folder = item.item as FolderType
      // Load the data room if needed
      const supabase = createClient()
      const { data: dataRoomData } = await supabase
        .from("data_rooms")
        .select("*")
        .eq("id", folder.data_room_id)
        .single()
      
      if (dataRoomData) {
        router.push(`/data_room/${folder.data_room_id}/folder/${folder.id}`)
      }
    } else if (item.type === "file") {
      const file = item.item as FileType
      const supabase = createClient()
      
      // Try to load the data room if user has access, but don't fail if they don't
      // (file might be shared without data room access)
      try {
        const { data: dataRoomData } = await supabase
          .from("data_rooms")
          .select("*")
          .eq("id", file.data_room_id)
          .single()
        
        if (dataRoomData) {
          selectDataRoom(dataRoomData)
          
          if (file.folder_id) {
            const { data: folderData } = await supabase
              .from("folders")
              .select("*")
              .eq("id", file.folder_id)
              .single()
            
            if (folderData) {
              selectFolder(folderData)
            }
          }
        }
      } catch (error) {
        // If data room access fails, that's okay - we can still open the file
        console.log("Could not load data room for shared file, opening file directly:", error)
      }
      
      // Always reload file to ensure we have the data field (it might be excluded from the shares query)
      console.log("Loading file data for shared file:", file.id)
      const { data: fileData, error: fileError } = await supabase
        .from("files")
        .select("*")
        .eq("id", file.id)
        .single()
      
      if (fileError || !fileData) {
        console.error("Error loading file data:", fileError)
        return
      }

      setViewingFileId(fileData.id)
    }
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case "data_room":
        return <FolderOpen className="h-5 w-5 text-blue-500" />
      case "folder":
        return <Folder className="h-5 w-5 text-yellow-500" />
      case "file":
        return <FileText className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getItemName = (item: DataRoom | FolderType | FileType) => {
    return item.name
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shared With Me</h1>
        <p className="text-muted-foreground mt-1">Items that others have shared with you</p>
      </div>

      {sharedItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <UserPlus className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No shared items</h3>
            <p className="text-sm text-muted-foreground">Items shared with you will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sharedItems.map((sharedItem) => {
            if (sharedItem.type === "folder") {
              return (
                <Card className="hover:shadow-md transition-shadow cursor-pointer" key={sharedItem.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getItemIcon(sharedItem.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{getItemName(sharedItem.item)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <UserPlus className="h-3 w-3" />
                              Shared by {sharedItem.shared_by_email}
                            </p>
                            <span className="text-xs text-muted-foreground">•</span>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(sharedItem.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Badge variant={sharedItem.permission === "edit" ? "default" : "secondary"}>
                          {sharedItem.permission}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenItem(sharedItem)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }
            
            // For other types, use normal card with separate buttons
            return (
              <Card
                key={sharedItem.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleOpenItem(sharedItem)}
                    >
                      {getItemIcon(sharedItem.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{getItemName(sharedItem.item)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <UserPlus className="h-3 w-3" />
                            Shared by {sharedItem.shared_by_email}
                          </p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(sharedItem.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={sharedItem.permission === "edit" ? "default" : "secondary"}>
                        {sharedItem.permission}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenItem(sharedItem)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Open
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      
      {viewingFileId && (
        <PDFViewer 
          fileId={viewingFileId}
          onClose={() => {
            setViewingFileId(null)
            router.push("/")
          }} 
        />
      )}
    </div>
  )
}
