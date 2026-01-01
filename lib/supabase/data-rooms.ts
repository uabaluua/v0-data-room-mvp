import {createClient} from "@/lib/supabase/client";

export async function loadFolders(dataRoomId: string, folderId: string | null) {
  if (!dataRoomId) {
    return [];
  }

  const supabase = createClient()

  let query = supabase
    .from("folders")
    .select("*")
    .eq("data_room_id", dataRoomId)
    .order("created_at", { ascending: true })

  // if (folderId) {
  //   query = query.eq("parent_id", folderId)
  // } else {
  //   query = query.is("parent_id", null)   // root folders
  // }

  const { data, error } = await query

  if (error) {
    console.error("loadFolders error:", error)
    return []
  }

  return data ?? []
}


export async function loadFiles(dataRoomId: string, folderId: string | null) {
  if (!dataRoomId) {
    return []
  }

  const supabase = createClient()
  let query = supabase
    .from("files")
    .select("*")
    .eq("data_room_id", dataRoomId)
    .order("created_at", { ascending: true })

  if (folderId) {
    query = query.eq("folder_id", folderId)
  } else {
    query = query.is("folder_id", null)   // root folders
  }

  const { data, error } = await query

  if (error) {
    console.error("loadFiles error:", error)
    return []
  }

  return data ?? [];
}