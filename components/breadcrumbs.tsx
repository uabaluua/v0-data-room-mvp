"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { redirect } from "next/navigation";
import {
  ChevronRight,
  Home,
  FolderRoot,
  Folder as FolderIcon,
} from "lucide-react";
import { DataRoom, Folder } from "@/types";

const getFolderPath = (
  folderId: string | null,
  folders: Folder[],
): Folder[] => {
  if (!folderId) return [];

  const path: Folder[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder = folders.find((f) => f.id === currentId);
    if (!folder) break;
    path.unshift(folder);
    currentId = folder.parent_id;
  }

  return path;
};

export default function Breadcrumbs({
  dataRoom,
  folders,
  folderId,
}: {
  dataRoom: DataRoom;
  folders: Folder[];
  folderId: string | null;
}) {
  const folderPath = getFolderPath(folderId, folders);
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-wrap">
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => redirect(`/`)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <div className="flex items-center">
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => redirect(`/data-room/${dataRoom.id}`)}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <FolderRoot className="h-4 w-4" />
              {dataRoom.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </div>
        {folderPath.map((folder, index) => (
          <div key={folder.id} className="flex items-center">
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <FolderIcon className="h-4 w-4" />
              {index === folderPath.length - 1 ? (
                <BreadcrumbPage>{folder.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  onClick={() =>
                    redirect(`/data-room/${dataRoom.id}/folder/${folder.id}`)
                  }
                  className="cursor-pointer"
                >
                  {folder.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
