"use client";

import { useState } from "react";
import {
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Share2,
} from "lucide-react";
import { useDataRoom } from "@/lib/data-room-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShareDialog } from "@/components/share-dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface FileListProps {
  currentFiles: Array<{
    id: string;
    name: string;
    size: number;
    createdAt: number;
    updatedAt: number;
  }>;
  onViewFile: (fileId: string) => void;
}

export function FileList({ currentFiles, onViewFile }: FileListProps) {
  const { renameFile, deleteFile, files } = useDataRoom();
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleRename = async () => {
    const trimmedName = editName.trim();

    if (!trimmedName || !editingFile) {
      setError("File name cannot be empty");
      return;
    }

    // Ensure .pdf extension
    const fileName = trimmedName.endsWith(".pdf")
      ? trimmedName
      : `${trimmedName}.pdf`;

    // Check for duplicate names
    const editingFileObj = files.find((f) => f.id === editingFile);
    if (
      editingFileObj &&
      currentFiles.some(
        (f) =>
          f.id !== editingFile &&
          f.name.toLowerCase() === fileName.toLowerCase(),
      )
    ) {
      setError("A file with this name already exists");
      return;
    }

    await renameFile(editingFile, fileName);
    setEditingFile(null);
    setEditName("");
    setError("");
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteFile(deleteId);
      setDeleteId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`;
  };

  const formatFileName = (
    name: string,
  ): { name: string; extension: string } => {
    const lastDotIndex = name.lastIndexOf(".");

    if (lastDotIndex <= 0) {
      return { name, extension: "" };
    }

    return {
      name: name.slice(0, lastDotIndex),
      extension: name.slice(lastDotIndex + 1),
    };
  };

  return (
    <>
      <div className="space-y-2">
        {currentFiles.map((file) => (
          <Card
            key={file.id}
            className="hover:shadow-md transition-shadow group"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {formatFileName(file.name).name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <Tooltip>
                        <TooltipTrigger>
                          {new Date(file.createdAt).toLocaleDateString()}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Uploaded</p>
                        </TooltipContent>
                      </Tooltip>{" "}
                      • {formatFileSize(file.size)} •{" "}
                      {formatFileName(file.name).extension} •{" "}
                      <Tooltip>
                        <TooltipTrigger>
                          {new Date(file.updatedAt).toLocaleDateString()}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Last Updated</p>
                        </TooltipContent>
                      </Tooltip>{" "}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onViewFile(file.id)}
                    title="View file"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <ShareDialog
                        itemType="file"
                        itemId={file.id}
                        itemName={file.name}
                      >
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                      </ShareDialog>
                      <DropdownMenuItem onClick={() => onViewFile(file.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingFile(file.id);
                          setEditName(file.name.replace(/\.pdf$/i, ""));
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(file.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rename Dialog */}
      <Dialog
        open={!!editingFile}
        onOpenChange={(open) => !open && setEditingFile(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>
              Enter a new name for this file
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file-name">File Name</Label>
              <div className="flex gap-2">
                <Input
                  id="file-name"
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
                  className="flex-1"
                />
                <span className="flex items-center text-muted-foreground">
                  .pdf
                </span>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFile(null)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this file. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
