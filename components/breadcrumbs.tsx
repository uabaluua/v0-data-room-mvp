"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {useMemo} from "react";
import {redirect} from "next/navigation";
import {ChevronRight, Home} from "lucide-react";
import {DataRoom, Folder} from "@/types";

const getFolderPath = (folderId: string | null, folders: Folder[]): Folder[] => {
  if (!folderId) return []

  const path: Folder[] = []
  let currentId: string | null = folderId

  while (currentId) {
    const folder = folders.find((f) => f.id === currentId)
    if (!folder) break
    path.unshift(folder)
    currentId = folder.parent_id
  }

  return path
}

export default function Breadcrumbs({dataRoom, folders, folderId}: {dataRoom: DataRoom, folders: Folder[], folderId: string | null}) {
  const folderPath = useMemo(() => getFolderPath(folderId, folders), [folders]);
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => redirect(`/data-room/${dataRoom.id}`)} className="flex items-center gap-1.5 cursor-pointer">
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
                <BreadcrumbLink onClick={() => redirect(`/data-room/${dataRoom.id}/folder/${folder.id}`)} className="cursor-pointer">
                  {folder.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
