"use client"

import { useEffect, useState } from "react"
import { X, Download, ZoomIn, ZoomOut } from "lucide-react"
import { useDataRoom } from "@/lib/data-room-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog"

interface PDFViewerProps {
  fileId: string
  onClose: () => void
  file?: {
    id: string
    name: string
    data: string
    size: number
    created_at: string
  }
}

export function PDFViewer({ fileId, onClose, file: fileProp }: PDFViewerProps) {
  const { files } = useDataRoom()
  const [zoom, setZoom] = useState(100)
  const [file, setFile] = useState<typeof fileProp | null>(fileProp || null)

  // If file prop is provided, use it; otherwise find from context
  const fileToUse = fileProp || files.find((f) => f.id === fileId)

  // If file prop is provided, we don't need to load it
  useEffect(() => {
    if (fileProp) {
      setFile(fileProp)
    } else if (fileToUse) {
      setFile(fileToUse)
    } else {
      // Try to load the file directly if not in context
      async function loadFile() {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("files")
          .select("*")
          .eq("id", fileId)
          .single()

        if (data && !error) {
          setFile(data)
        }
      }
      loadFile()
    }
  }, [fileId, fileProp, fileToUse])

  useEffect(() => {
    console.log("[v0] PDF viewer opened for file:", fileId)
  }, [fileId])

  if (!file) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading file...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = file.data
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogTitle>{file.name}</DialogTitle>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">{file.name}</h2>
            <p className="text-sm text-muted-foreground">
              {new Date(file.created_at).toLocaleDateString()} • {Math.round(file.size / 1024)} KB
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
            <Button variant="outline" size="icon" onClick={handleDownload} title="Download">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-muted/20 p-4">
          <div className="mx-auto" style={{ width: `${zoom}%`, maxWidth: "100%" }}>
            <iframe
              src={file.data}
              className="w-full h-[calc(90vh-100px)] bg-white rounded shadow-lg"
              title={file.name}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
