"use client"

import { useState, useEffect } from "react"
import { UserPlus, FolderOpen, Folder, FileText, Eye, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useDataRoom } from "@/lib/data-room-context"
import type { DataRoom, Folder as FolderType, File as FileType } from "@/lib/data-room-context"

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
  const { selectDataRoom, selectFolder, dataRooms, folders } = useDataRoom()

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

  const handleOpenItem = (item: SharedItem) => {
    if (item.type === "data_room") {
      const dataRoom = dataRooms.find((dr) => dr.id === (item.item as DataRoom).id)
      if (dataRoom) {
        selectDataRoom(dataRoom)
      }
    } else if (item.type === "folder") {
      const folder = folders.find((f) => f.id === (item.item as FolderType).id)
      if (folder) {
        // First select the data room
        const dataRoom = dataRooms.find((dr) => dr.id === folder.data_room_id)
        if (dataRoom) {
          selectDataRoom(dataRoom)
          selectFolder(folder)
        }
      }
    } else if (item.type === "file") {
      const file = item.item as FileType
      const dataRoom = dataRooms.find((dr) => dr.id === file.data_room_id)
      if (dataRoom) {
        selectDataRoom(dataRoom)
        if (file.folder_id) {
          const folder = folders.find((f) => f.id === file.folder_id)
          if (folder) {
            selectFolder(folder)
          }
        }
      }
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
          {sharedItems.map((sharedItem) => (
            <Card
              key={sharedItem.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOpenItem(sharedItem)}
            >
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
                  <div className="flex items-center gap-2">
                    <Badge variant={sharedItem.permission === "edit" ? "default" : "secondary"}>
                      {sharedItem.permission}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
