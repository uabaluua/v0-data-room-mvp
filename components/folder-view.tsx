"use client";

import { useState } from "react";
import { FolderPlus } from "lucide-react";
import { useDataRoom } from "@/lib/data-room-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUploader } from "@/components/file-uploader";
import { FileList } from "@/components/file-list";
import { PDFViewer } from "@/components/pdf-viewer";
import { GlobalSearch } from "@/components/global-search";
import type { DataRoom } from "@/types";
import Breadcrumbs from "@/components/breadcrumbs";
import FolderEmpty from "@/components/folder-empty";
import FolderCard from "@/components/folder-card";
import ConfirmDeletion from "@/components/confirm-deletion";

export function FolderView({
  dataRoom,
  folderId,
}: {
  dataRoom: DataRoom;
  folderId: string | null;
}) {
  const {
    currentFolder,
    folders,
    files,
    createFolder,
    renameFolder,
    deleteFolder,
  } = useDataRoom();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [viewingFileId, setViewingFileId] = useState<string | null>(null);

  if (!dataRoom) return null;

  const childFolders = folders.filter(
    (f) => f.data_room_id === dataRoom.id && f.parent_id === folderId,
  );
  const currentFiles = files.map((f) => ({
    id: f.id,
    name: f.name,
    size: f.size,
    createdAt: new Date(f.created_at).getTime(),
    updatedAt: new Date(f.updated_at).getTime(),
  }));

  const handleCreate = async () => {
    const trimmedName = newFolderName.trim();

    if (!trimmedName) {
      setError("Folder name cannot be empty");
      return;
    }

    // Check for duplicate names in current folder
    if (
      childFolders.some(
        (f) => f.name.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      setError("A folder with this name already exists");
      return;
    }

    await createFolder(trimmedName, folderId);
    setNewFolderName("");
    setIsCreateOpen(false);
    setError("");
  };

  const handleRename = async () => {
    const trimmedName = editName.trim();

    if (!trimmedName || !editingFolder) {
      setError("Folder name cannot be empty");
      return;
    }

    // Check for duplicate names
    if (
      childFolders.some(
        (f) =>
          f.id !== editingFolder &&
          f.name.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      setError("A folder with this name already exists");
      return;
    }

    await renameFolder(editingFolder, trimmedName);
    setEditingFolder(null);
    setEditName("");
    setError("");
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteFolder(deleteId);
      setDeleteId(null);
    }
  };

  const isEmpty = childFolders.length === 0 && currentFiles.length === 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Breadcrumbs
            dataRoom={dataRoom}
            folders={folders}
            folderId={folderId}
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <div className="[&_button]:w-auto">
            <GlobalSearch
              dataRoomId={dataRoom.id}
              folderId={folderId}
              placeholder={`Search in ${currentFolder?.name || "this data room"}...`}
            />
          </div>
          <FileUploader
            currentFolderId={folderId || "root"}
            dataRoom={dataRoom}
          />
          <Button onClick={() => setIsCreateOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Folder</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {isEmpty ? (
        <FolderEmpty
          currentFolderId={folderId}
          createNewFolder={() => setIsCreateOpen(true)}
          dataRoom={dataRoom}
        />
      ) : (
        <div className="space-y-6">
          {/* Folders */}
          {childFolders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                Folders
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {childFolders.map((folder) => (
                  <FolderCard
                    folder={folder}
                    dataRoom={dataRoom}
                    key={folder.id}
                    setEditingFolder={setEditingFolder}
                    setEditName={setEditName}
                    setDeleteId={setDeleteId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {currentFiles.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                Files
              </h2>
              <FileList
                currentFiles={currentFiles}
                onViewFile={setViewingFileId}
              />
            </div>
          )}
        </div>
      )}

      {/* Create Folder Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Documents"
                value={newFolderName}
                onChange={(e) => {
                  setNewFolderName(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreate();
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
      <Dialog
        open={!!editingFolder}
        onOpenChange={(open) => !open && setEditingFolder(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              Enter a new name for this folder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Folder Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRename();
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

      <ConfirmDeletion
        open={!!deleteId}
        onOpenChange={(open: boolean) => !open && setDeleteId(null)}
        handleDelete={handleDelete}
      />

      {viewingFileId && (
        <PDFViewer
          fileId={viewingFileId}
          onClose={() => setViewingFileId(null)}
        />
      )}
    </div>
  );
}
