"use client"

import {useState} from "react"
import {Plus, Trash2, FolderOpen, MoreVertical, Pencil, Share2} from "lucide-react"
import {useDataRoom} from "@/lib/data-room-context"
import {Button} from "@/components/ui/button"
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
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
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {ShareDialog} from "@/components/share-dialog"
import Link from "next/link";

export function DataRoomSelector() {
  const {dataRooms, createDataRoom, renameDataRoom, deleteDataRoom} = useDataRoom()
  const [newRoomName, setNewRoomName] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingRoom, setEditingRoom] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [error, setError] = useState("")

  const handleCreate = async () => {
    const trimmedName = newRoomName.trim()

    if (!trimmedName) {
      setError("Data room name cannot be empty")
      return
    }

    if (dataRooms.some((dr) => dr.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError("A data room with this name already exists")
      return
    }

    await createDataRoom(trimmedName)
    setNewRoomName("")
    setIsCreateOpen(false)
    setError("")
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDataRoom(deleteId)
      setDeleteId(null)
    }
  }

  const handleRename = async () => {
    const trimmedName = editName.trim()

    if (!trimmedName) {
      setError("Data room name cannot be empty")
      return
    }

    if (dataRooms.some((dr) => dr.id !== editingRoom && dr.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError("A data room with this name already exists")
      return
    }

    if (editingRoom) {
      await renameDataRoom(editingRoom, trimmedName)
      setEditingRoom(null)
      setEditName("")
      setError("")
    }
  }

  return (
    <div className="space-y-6">
      {dataRooms.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FolderOpen className="h-10 w-10 text-muted-foreground"/>
            </div>
            <h3 className="text-lg font-semibold mb-1">No data rooms yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first data room to get started</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2"/>
              Create Data Room
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataRooms.map((room) => (
            <Link
              key={room.id}
              href={`/data-room/${room.id}`}
            >
              <Card
                key={room.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="rounded-lg bg-primary/10 p-2.5 mt-0.5">
                        <FolderOpen className="h-5 w-5 text-primary"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{room.name}</CardTitle>
                        <CardDescription className="mt-1.5">
                          Created {new Date(room.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 -mr-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4 text-muted-foreground"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <ShareDialog itemType="data_room" itemId={room.id} itemName={room.name}>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault()
                            }}
                          >
                            <Share2 className="h-4 w-4 mr-2"/>
                            Share
                          </DropdownMenuItem>
                        </ShareDialog>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingRoom(room.id)
                            setEditName(room.name)
                            setError("")
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2"/>
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteId(room.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2"/>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Data Room</DialogTitle>
            <DialogDescription>Enter a name for your new data room</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Data Room Name</Label>
              <Input
                id="name"
                placeholder="Q1 2024 Due Diligence"
                value={newRoomName}
                onChange={(e) => {
                  setNewRoomName(e.target.value)
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

      <Dialog open={!!editingRoom} onOpenChange={(open) => !open && setEditingRoom(null)}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename Data Room</DialogTitle>
            <DialogDescription>Enter a new name for this data room</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Data Room Name</Label>
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
            <Button variant="outline" onClick={() => setEditingRoom(null)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Data Room?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this data room and all its contents including folders and files. This action
              cannot be undone.
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
    </div>
  )
}
