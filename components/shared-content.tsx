import {Share} from '@/types'
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useDataRoom } from "@/lib/data-room-context"
import { DataRoomView } from "@/components/data-room-view"
import { FolderView } from "@/components/folder-view"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, ZoomIn, ZoomOut, Download } from "lucide-react"

export default function SharedContent({ share }: { share: Share }) {
  const { currentDataRoom, selectDataRoom, selectFolder, files } = useDataRoom()
  const [viewingFileId, setViewingFileId] = useState<string | null>(null)
  const [viewingFile, setViewingFile] = useState<any | null>(null)
  const [loadingContent, setLoadingContent] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    async function loadSharedContent() {
      setLoadingContent(true)
      setLoadError(null)
      const supabase = createClient()

      try {
        if (share.data_room_id) {
          // Load and select the shared data room
          console.log("Loading shared data room:", share.data_room_id)
          const { data, error } = await supabase
            .from("data_rooms")
            .select("*")
            .eq("id", share.data_room_id)
            .single()

          console.log("Data room query result:", { data, error })

          if (error) {
            console.error("Error loading shared data room:", error)
            setLoadError(`Failed to load data room: ${error.message}`)
            setLoadingContent(false)
            return
          }

          if (data) {
            console.log("Setting data room:", data)
            selectDataRoom(data)
            setLoadingContent(false)
          } else {
            setLoadError("Data room not found")
            setLoadingContent(false)
          }
        } else if (share.folder_id) {
          // Load and select the shared folder
          console.log("Loading shared folder:", share.folder_id)
          const { data: folderData, error: folderError } = await supabase
            .from("folders")
            .select("*, data_rooms(*)")
            .eq("id", share.folder_id)
            .single()

          console.log("Folder query result:", { folderData, folderError })

          if (folderError) {
            console.error("Error loading shared folder:", folderError)
            setLoadError(`Failed to load folder: ${folderError.message}`)
            setLoadingContent(false)
            return
          }

          if (folderData) {
            console.log("Setting folder and data room:", folderData)
            if (folderData.data_rooms) {
              selectDataRoom(folderData.data_rooms)
            }
            selectFolder(folderData)
            setLoadingContent(false)
          } else {
            setLoadError("Folder not found")
            setLoadingContent(false)
          }
        } else if (share.file_id) {
          // Load and view the shared file
          console.log("Loading shared file:", share.file_id)
          const { data: fileData, error: fileError } = await supabase
            .from("files")
            .select("*")
            .eq("id", share.file_id)
            .single()

          console.log("File query result:", { fileData, fileError })

          if (fileError) {
            console.error("Error loading shared file:", fileError)
            setLoadError(`Failed to load file: ${fileError.message}`)
            setLoadingContent(false)
            return
          }

          if (fileData) {
            console.log("Setting file:", fileData)
            setViewingFile(fileData)
            setViewingFileId(share.file_id)
            setLoadingContent(false)
          } else {
            setLoadError("File not found")
            setLoadingContent(false)
          }
        }
      } catch (err) {
        console.error("Unexpected error loading shared content:", err)
        setLoadError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`)
        setLoadingContent(false)
      }
    }

    loadSharedContent()
  }, [share, selectDataRoom, selectFolder])

  if (loadingContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared content...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Content</h2>
              <p className="text-muted-foreground mb-4">{loadError}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (share.file_id) {
    if (!viewingFile) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading file...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold truncate">{viewingFile.name}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(viewingFile.created_at).toLocaleDateString()} • {Math.round(viewingFile.size / 1024)} KB
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.max(50, z - 10))} title="Zoom out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[4rem] text-center">{zoom}%</span>
            <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.min(200, z + 10))} title="Zoom in">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const link = document.createElement("a")
                link.href = viewingFile.data
                link.download = viewingFile.name
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Content - Full Screen */}
        <div className="flex-1 overflow-auto bg-muted/20 p-4">
          <div className="mx-auto" style={{ width: `${zoom}%`, maxWidth: "100%" }}>
            <iframe
              src={viewingFile.data}
              className="w-full h-full min-h-[calc(100vh-120px)] bg-white rounded shadow-lg"
              title={viewingFile.name}
            />
          </div>
        </div>
      </div>
    )
  }

  if (share.folder_id) {
    if (!currentDataRoom) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading folder...</p>
          </div>
        </div>
      )
    }
    return (
      <div className="container mx-auto py-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">Shared Folder</h1>
          <p className="text-sm text-muted-foreground">
            {share.permission === "edit" ? "You can view and edit this folder" : "You can view this folder"}
          </p>
        </div>
        <FolderView />
      </div>
    )
  }

  if (share.data_room_id) {
    if (!currentDataRoom) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading data room...</p>
          </div>
        </div>
      )
    }
    return (
      <div className="container mx-auto py-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">Shared Data Room</h1>
          <p className="text-sm text-muted-foreground">
            {share.permission === "edit" ? "You can view and edit this data room" : "You can view this data room"}
          </p>
        </div>
        <DataRoomView />
      </div>
    )
  }

  return null
}