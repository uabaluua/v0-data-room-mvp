"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { useDataRoom } from "@/lib/data-room-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface FileUploaderProps {
  currentFolderId: string
  variant?: "default" | "button"
}

export function FileUploader({ currentFolderId, variant = "default" }: FileUploaderProps) {
  const { uploadFile, files, currentDataRoom } = useDataRoom()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return

    // Filter for PDF files only
    const pdfFiles = Array.from(fileList).filter((file) => file.type === "application/pdf")

    if (pdfFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Only PDF files are allowed",
        variant: "destructive",
      })
      return
    }

    if (pdfFiles.length !== fileList.length) {
      toast({
        title: "Some files were skipped",
        description: `Only PDF files are allowed. ${fileList.length - pdfFiles.length} file(s) skipped.`,
        variant: "destructive",
      })
    }

    // Create a new FileList-like object with only PDFs
    const dataTransfer = new DataTransfer()
    pdfFiles.forEach((file) => dataTransfer.items.add(file))
    setSelectedFiles(dataTransfer.files)
  }

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return
    if (!currentDataRoom) return

    setIsUploading(true)

    try {
      // Convert "root" to null for database
      const folderId = currentFolderId === "root" ? null : currentFolderId
      
      // Check for duplicate filenames
      const existingFileNames = files
        .filter((f) => {
          // Convert null folder_id to "root" for comparison
          const fFolderId = f.folder_id === null ? "root" : f.folder_id
          return fFolderId === currentFolderId && f.data_room_id === currentDataRoom.id
        })
        .map((f) => f.name.toLowerCase())

      const filesToUpload = Array.from(selectedFiles)

      for (const file of filesToUpload) {
        // Check for duplicates
        let fileName = file.name
        let counter = 1
        while (existingFileNames.includes(fileName.toLowerCase())) {
          const nameParts = file.name.split(".")
          const ext = nameParts.pop()
          const baseName = nameParts.join(".")
          fileName = `${baseName} (${counter}).${ext}`
          counter++
        }

        // Read file as base64
        const reader = new FileReader()
        const fileContent = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        await uploadFile(fileName, fileContent, folderId, file.size)
        existingFileNames.push(fileName.toLowerCase())
      }

      toast({
        title: "Upload successful",
        description: `${filesToUpload.length} file(s) uploaded successfully`,
      })

      setSelectedFiles(null)
      setIsOpen(false)
    } catch (error) {
      console.error("[v0] Upload error:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const triggerButton =
    variant === "button" ? (
      <Button variant="outline">
        <Upload className="h-4 w-4 mr-2" />
        Upload Files
      </Button>
    ) : (
      <Button variant="outline" size="icon">
        <Upload className="h-4 w-4" />
      </Button>
    )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload PDF Files</DialogTitle>
          <DialogDescription>Upload PDF documents to this folder</DialogDescription>
        </DialogHeader>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-muted p-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium mb-1">Drag & drop PDF files here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              Select Files
            </Button>
          </div>
        </div>

        {selectedFiles && selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected files:</p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {Array.from(selectedFiles).map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <span className="truncate flex-1">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      const dataTransfer = new DataTransfer()
                      Array.from(selectedFiles)
                        .filter((_, i) => i !== index)
                        .forEach((f) => dataTransfer.items.add(f))
                      setSelectedFiles(dataTransfer.files.length > 0 ? dataTransfer.files : null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFiles || selectedFiles.length === 0 || isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
