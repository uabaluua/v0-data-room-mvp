"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { DataRoom, Folder, File } from "@/types";

interface DataRoomContextType {
  // State
  dataRooms: DataRoom[];
  currentDataRoom: DataRoom | null;
  currentFolder: Folder | null;
  folders: Folder[];
  files: File[];

  // Data Room operations
  createDataRoom: (name: string) => Promise<void>;
  renameDataRoom: (id: string, newName: string) => Promise<void>;
  deleteDataRoom: (id: string) => Promise<void>;
  selectDataRoom: (id: string | null) => DataRoom | null;

  selectLoadedDataRoom: (dataRoom: DataRoom | null) => void;

  // Folder operations
  createFolder: (name: string, parentFolderId: string | null) => Promise<void>;
  renameFolder: (id: string, newName: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  selectFolder: (folderId: string | null) => void;

  // File operations
  uploadFile: (
    name: string,
    content: string,
    folderId: string | null,
    size: number,
    dataRoom: DataRoom,
  ) => Promise<void>;
  renameFile: (id: string, newName: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;

  // Loading state
  isLoading: boolean;
}

const DataRoomContext = createContext<DataRoomContextType | undefined>(
  undefined,
);

export function DataRoomProvider({ children }: { children: React.ReactNode }) {
  const [dataRooms, setDataRooms] = useState<DataRoom[]>([]);
  const [currentDataRoom, setCurrentDataRoom] = useState<DataRoom | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      setUserId(user.id);

      // Load data rooms
      const { data: dataRoomsData } = await supabase
        .from("data_rooms")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("owner_id", user.id);

      if (dataRoomsData) {
        setDataRooms(dataRoomsData);
      }

      setIsLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadFolders(dataRoomId?: string) {
      if (!dataRoomId) {
        return setFolders([]);
      }

      const supabase = createClient();

      const query = supabase
        .from("folders")
        .select("*")
        .eq("data_room_id", dataRoomId)
        .order("created_at", { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error("loadFolders error:", error);
        return setFolders([]);
      }

      return setFolders(data ?? []);
    }

    loadFolders(currentDataRoom?.id);
  }, [currentDataRoom]);

  useEffect(() => {
    async function loadFiles(dataRoomId?: string, folderId?: string | null) {
      if (!dataRoomId) {
        return setFiles([]);
      }

      const supabase = createClient();
      let query = supabase
        .from("files")
        .select("*")
        .eq("data_room_id", dataRoomId)
        .order("created_at", { ascending: true });

      if (folderId) {
        query = query.eq("folder_id", folderId);
      } else {
        query = query.is("folder_id", null); // root folders
      }

      const { data, error } = await query;

      if (error) {
        console.error("loadFiles error:", error);
        return setFiles([]);
      }

      return setFiles(data ?? []);
    }

    console.log(
      "Loading files for dataRoom:",
      currentDataRoom?.id,
      "folder:",
      currentFolder?.id,
    );
    loadFiles(currentDataRoom?.id, currentFolder?.id);
  }, [currentDataRoom, currentFolder]);

  // Data Room operations
  const createDataRoom = useCallback(
    async (name: string) => {
      if (!userId) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("data_rooms")
        .insert({
          name,
          owner_id: userId,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating data room:", error);
        throw error;
      }

      if (data) {
        setDataRooms((prev) => [...prev, data]);
      }
    },
    [userId],
  );

  const renameDataRoom = useCallback(
    async (id: string, newName: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("data_rooms")
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error renaming data room:", error);
        throw error;
      }

      if (data) {
        setDataRooms((prev) => prev.map((dr) => (dr.id === id ? data : dr)));

        if (currentDataRoom?.id === id) {
          setCurrentDataRoom(data);
        }
      }
    },
    [currentDataRoom],
  );

  const deleteDataRoom = useCallback(
    async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("data_rooms").delete().eq("id", id);

      if (error) {
        console.error("Error deleting data room:", error);
        throw error;
      }

      setDataRooms((prev) => prev.filter((dr) => dr.id !== id));

      if (currentDataRoom?.id === id) {
        setCurrentDataRoom(null);
        setCurrentFolder(null);
      }
    },
    [currentDataRoom],
  );

  const selectDataRoom = useCallback(
    (id: string | null) => {
      const dataRoom = dataRooms.find((dr) => dr.id === id);
      setCurrentDataRoom(dataRoom || null);
      setCurrentFolder(null);
      return dataRoom || null;
    },
    [dataRooms],
  );

  const selectLoadedDataRoom = useCallback((dataRoom: DataRoom | null) => {
    setCurrentDataRoom(dataRoom || null);
    setCurrentFolder(null);
    return dataRoom || null;
  }, []);

  // Folder operations
  const createFolder = useCallback(
    async (name: string, parentFolderId: string | null) => {
      if (!currentDataRoom || !userId) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("folders")
        .insert({
          name,
          data_room_id: currentDataRoom.id,
          parent_id: parentFolderId,
          owner_id: userId,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating folder:", error);
        throw error;
      }

      if (data) {
        setFolders((prev) => [...prev, data]);
      }
    },
    [currentDataRoom, userId],
  );

  const renameFolder = useCallback(async (id: string, newName: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("folders")
      .update({ name: newName, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error renaming folder:", error);
      throw error;
    }

    if (data) {
      setFolders((prev) => prev.map((f) => (f.id === id ? data : f)));
    }
  }, []);

  const deleteFolder = useCallback(
    async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("folders").delete().eq("id", id);

      if (error) {
        console.error("Error deleting folder:", error);
        throw error;
      }

      setFolders((prev) => prev.filter((f) => f.id !== id));

      if (currentFolder?.id === id) {
        setCurrentFolder(null);
      }
    },
    [currentFolder],
  );

  const selectFolder = useCallback(
    (id: string | null) => {
      const folder = folders.find((f) => f.id === id);
      setCurrentFolder(folder || null);
    },
    [folders],
  );

  // File operations
  const uploadFile = useCallback(
    async (
      name: string,
      content: string,
      folderId: string | null,
      size: number,
      dataRoom: DataRoom,
    ) => {
      if (!dataRoom || !userId) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("files")
        .insert({
          name,
          data_room_id: dataRoom.id,
          folder_id: folderId,
          data: content,
          size,
          mime_type: "application/pdf",
          owner_id: userId,
        })
        .select()
        .single();

      if (error) {
        console.error("Error uploading file:", error);
        throw error;
      }

      if (data) {
        setFiles((prev) => [...prev, data]);
      }
    },
    [userId],
  );

  const renameFile = useCallback(async (id: string, newName: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("files")
      .update({ name: newName, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error renaming file:", error);
      throw error;
    }

    if (data) {
      setFiles((prev) => prev.map((f) => (f.id === id ? data : f)));
    }
  }, []);

  const deleteFile = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("files").delete().eq("id", id);

    if (error) {
      console.error("Error deleting file:", error);
      throw error;
    }

    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <DataRoomContext.Provider
      value={{
        dataRooms,
        folders,
        files,
        currentDataRoom,
        currentFolder,
        createDataRoom,
        renameDataRoom,
        deleteDataRoom,
        selectDataRoom,
        selectLoadedDataRoom,
        createFolder,
        renameFolder,
        deleteFolder,
        selectFolder,
        uploadFile,
        renameFile,
        deleteFile,
        isLoading,
      }}
    >
      {children}
    </DataRoomContext.Provider>
  );
}

export function useDataRoom() {
  const context = useContext(DataRoomContext);
  if (context === undefined) {
    throw new Error("useDataRoom must be used within a DataRoomProvider");
  }
  return context;
}
