"use client"

import { useState } from "react"
import { ChevronRight, Folder, FolderPlus, MoreVertical, Edit, Trash2, FolderOpen, Home, Share2 } from "lucide-react"
import { useDataRoom } from "@/lib/data-room-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { FileUploader } from "@/components/file-uploader"
import { FileList } from "@/components/file-list"
import { PDFViewer } from "@/components/pdf-viewer"
import { GlobalSearch } from "@/components/global-search"
import { ShareDialog } from "@/components/share-dialog"

export function FolderView() {
  const {
    currentDataRoom,
    currentFolder,
    folders,
    files,
    createFolder,
    renameFolder,
    deleteFolder,
    selectFolder,
    getFolderPath,
  } = useDataRoom()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [viewingFileId, setViewingFileId] = useState<string | null>(null)

  if (!currentDataRoom) return null

  // Get current folder contents
  const currentFolderId = currentFolder?.id || null
  const childFolders = folders.filter(
    (f) => f.data_room_id === currentDataRoom.id && f.parent_id === currentFolderId,
  )
  const currentFiles = files
    .filter((f) => f.data_room_id === currentDataRoom.id && f.folder_id === (currentFolderId || "root"))
    .map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      createdAt: new Date(f.created_at).getTime(),
    }))

  const folderPath = getFolderPath(currentFolderId)

  const handleCreate = async () => {
    const trimmedName = newFolderName.trim()

    if (!trimmedName) {
      setError("Folder name cannot be empty")
      return
    }

    // Check for duplicate names in current folder
    if (childFolders.some((f) => f.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError("A folder with this name already exists")
      return
    }

    await createFolder(trimmedName, currentFolderId)
    setNewFolderName("")
    setIsCreateOpen(false)
    setError("")
  }

  const handleRename = async () => {
    const trimmedName = editName.trim()

    if (!trimmedName || !editingFolder) {
      setError("Folder name cannot be empty")
      return
    }

    // Check for duplicate names
    if (childFolders.some((f) => f.id !== editingFolder && f.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError("A folder with this name already exists")
      return
    }

    await renameFolder(editingFolder, trimmedName)
    setEditingFolder(null)
    setEditName("")
    setError("")
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteFolder(deleteId)
      setDeleteId(null)
    }
  }

  const isEmpty = childFolders.length === 0 && currentFiles.length === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <GlobalSearch
          dataRoomId={currentDataRoom.id}
          folderId={currentFolderId}
          placeholder={`Search in ${currentFolder?.name || "this data room"}...`}
        />
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => selectFolder(null)} className="flex items-center gap-1.5 cursor-pointer">
                <Home className="h-4 w-4" />
                Root
              </BreadcrumbLink>
            </BreadcrumbItem>
            {folderPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center">
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {index === folderPath.length - 1 ? (
                    <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink onClick={() => selectFolder(folder)} className="cursor-pointer">
                      {folder.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2">
          <FileUploader currentFolderId={currentFolderId || "root"} />
          <Button onClick={() => setIsCreateOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {isEmpty ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FolderOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">This folder is empty</h3>
            <p className="text-sm text-muted-foreground mb-4">Create a folder or upload files to get started</p>
            <div className="flex gap-2">
              <Button onClick={() => setIsCreateOpen(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
              <FileUploader currentFolderId={currentFolderId || "root"} variant="button" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Folders */}
          {childFolders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">Folders</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {childFolders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => selectFolder(folder)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Folder className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="font-medium truncate">{folder.name}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <ShareDialog itemType="folder" itemId={folder.id} itemName={folder.name}>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault()
                                }}
                              >
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                            </ShareDialog>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingFolder(folder.id)
                                setEditName(folder.name)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteId(folder.id)
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {currentFiles.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">Files</h2>
              <FileList currentFiles={currentFiles} onViewFile={setViewingFileId} />
            </div>
          )}
        </div>
      )}

      {/* Create Folder Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter a name for your new folder</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Documents"
                value={newFolderName}
                onChange={(e) => {
                  setNewFolderName(e.target.value)
                  setError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreate()
                  }
                }}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={!!editingFolder} onOpenChange={(open) => !open && setEditingFolder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>Enter a new name for this folder</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Folder Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value)
                  setError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRename()
                  }
                }}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFolder(null)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this folder and all its contents including nested folders and files. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {viewingFileId && <PDFViewer fileId={viewingFileId} onClose={() => setViewingFileId(null)} />}
    </div>
  )
}
