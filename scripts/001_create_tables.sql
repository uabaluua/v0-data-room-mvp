-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (references auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data rooms table
CREATE TABLE IF NOT EXISTS public.data_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folders table with self-referencing parent_id
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  data_room_id UUID NOT NULL REFERENCES public.data_rooms(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files table (stores PDFs)
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  data TEXT NOT NULL, -- Base64 encoded file data
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  data_room_id UUID NOT NULL REFERENCES public.data_rooms(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shares table for sharing data rooms, folders, or files
CREATE TABLE IF NOT EXISTS public.shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- What is being shared
  data_room_id UUID REFERENCES public.data_rooms(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  file_id UUID REFERENCES public.files(id) ON DELETE CASCADE,
  -- Who shared it
  shared_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Who it's shared with (NULL means public link)
  shared_with UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Share link token for public access
  share_token TEXT UNIQUE,
  -- Permission level: 'view' or 'edit'
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  -- Ensure only one type of share per row
  CONSTRAINT share_type_check CHECK (
    (data_room_id IS NOT NULL AND folder_id IS NULL AND file_id IS NULL) OR
    (data_room_id IS NULL AND folder_id IS NOT NULL AND file_id IS NULL) OR
    (data_room_id IS NULL AND folder_id IS NULL AND file_id IS NOT NULL)
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_data_rooms_owner ON public.data_rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_folders_data_room ON public.folders(data_room_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON public.folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_owner ON public.folders(owner_id);
CREATE INDEX IF NOT EXISTS idx_files_folder ON public.files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_data_room ON public.files(data_room_id);
CREATE INDEX IF NOT EXISTS idx_files_owner ON public.files(owner_id);
CREATE INDEX IF NOT EXISTS idx_shares_data_room ON public.shares(data_room_id);
CREATE INDEX IF NOT EXISTS idx_shares_folder ON public.shares(folder_id);
CREATE INDEX IF NOT EXISTS idx_shares_file ON public.shares(file_id);
CREATE INDEX IF NOT EXISTS idx_shares_shared_with ON public.shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_shares_token ON public.shares(share_token);
