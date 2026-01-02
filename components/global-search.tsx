"use client";

import { useState, useEffect } from "react";
import { Search, FolderIcon, FileText, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useDataRoom } from "@/lib/data-room-context";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  type: "folder" | "file";
  data_room_id: string;
  folder_id: string | null;
  parent_id: string | null;
  owner_id: string;
  created_at: string;
}

interface GlobalSearchProps {
  dataRoomId?: string | null;
  folderId?: string | null;
  placeholder?: string;
}

export function GlobalSearch({
  dataRoomId = null,
  folderId = null,
  placeholder = "Search files and folders...",
}: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { selectDataRoom, selectFolder, dataRooms } = useDataRoom();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      try {
        const { data, error } = await supabase.rpc("search_items", {
          search_query: query,
          user_id: user.id,
          search_data_room_id: dataRoomId,
          search_folder_id: folderId,
        });

        if (error) {
          console.error("Search error:", error);
        } else if (data) {
          setResults(data);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, dataRoomId, folderId]);

  const handleSelectResult = (result: SearchResult) => {
    const dataRoom = dataRooms.find((dr) => dr.id === result.data_room_id);
    if (!dataRoom) return;

    selectDataRoom(dataRoom.id);

    if (result.type === "folder") {
      selectFolder(result.id);
    } else if (result.type === "file" && result.folder_id) {
      selectFolder(result.folder_id);
    }

    setIsOpen(false);
    setQuery("");
  };

  const getScopeLabel = () => {
    if (folderId) return "in this folder";
    if (dataRoomId) return "in this data room";
    return "everywhere";
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 w-full justify-start"
      >
        <Search className="h-4 w-4" />
        <span className="hidden lg:inline">Search</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search {getScopeLabel()}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={placeholder}
                className="pl-9 pr-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg",
                        "hover:bg-accent transition-colors text-left",
                      )}
                    >
                      {result.type === "folder" ? (
                        <FolderIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      ) : (
                        <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {result.type === "folder" ? "Folder" : "PDF File"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.length >= 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No results found for &quot;{query}&quot;
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Type at least 2 characters to search
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
