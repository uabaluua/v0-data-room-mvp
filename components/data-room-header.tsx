"use client";

import { DataRoom } from "@/types";

export default function DataRoomHeader({ dataRoom }: { dataRoom: DataRoom }) {
  return (
    <div className="flex items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold">{dataRoom.name}</h1>
        <p className="text-sm text-muted-foreground">
          Manage folders and documents
        </p>
      </div>
    </div>
  );
}
