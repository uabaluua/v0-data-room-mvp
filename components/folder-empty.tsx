"use client"

import {Card, CardContent} from "@/components/ui/card";
import {FolderOpen, FolderPlus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {FileUploader} from "@/components/file-uploader";

export default function FolderEmpty({currentFolderId, setIsCreateOpen, dataRoom}: any) {
  return (
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
          <FileUploader currentFolderId={currentFolderId || "root"} variant="button" dataRoom={dataRoom} />
        </div>
      </CardContent>
    </Card>
  )
}
