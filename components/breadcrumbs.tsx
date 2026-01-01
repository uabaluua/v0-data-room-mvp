"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {redirect} from "next/navigation";
import {ChevronRight, Home} from "lucide-react";
import {DataRoom} from "@/types";

export default function Breadcrumbs({dataRoom}: {dataRoom: DataRoom}) {
  const folderPath: any[] = [];
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