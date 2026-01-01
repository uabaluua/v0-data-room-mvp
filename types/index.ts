export interface DataRoom {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  name: string
  data_room_id: string
  parent_id: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface File {
  id: string
  name: string
  data_room_id: string
  folder_id: string | null
  data: string
  size: number
  mime_type: string
  owner_id: string
  created_at: string
  updated_at: string
}