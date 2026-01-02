"use client"

import {Card, CardContent} from "@/components/ui/card";
import {Edit, Folder as FolderIcon, MoreVertical, Share2, Trash2} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {ShareDialog} from "@/components/share-dialog";
import {redirect} from "next/navigation"

export default function FolderCard({dataRoom, folder, setEditingFolder, setEditName, setDeleteId}: any) {
  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer group"
      key={folder.id}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div
            onClick={() => redirect(`/data-room/${dataRoom.id}/folder/${folder.id}`)}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <FolderIcon className="h-5 w-5 text-primary flex-shrink-0" />
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
  )
}
