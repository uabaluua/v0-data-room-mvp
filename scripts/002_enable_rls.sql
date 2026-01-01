-- Create helper functions to check ownership without triggering RLS recursion
-- These functions use SECURITY DEFINER to bypass RLS when checking ownership
CREATE OR REPLACE FUNCTION public.is_data_room_owner(room_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.data_rooms
    WHERE id = room_id AND owner_id = user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_folder_owner(folder_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.folders
    WHERE id = folder_id AND owner_id = user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_file_owner(file_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.files
    WHERE id = file_id AND owner_id = user_id
  );
$$;

-- Function to check if a data room is shared via token
CREATE OR REPLACE FUNCTION public.is_data_room_shared_by_token(room_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shares
    WHERE data_room_id = room_id
    AND share_token IS NOT NULL
    AND (expires_at IS NULL OR expires_at > NOW())
  );
$$;

-- Function to check if a user has access to a data room
CREATE OR REPLACE FUNCTION public.is_user_has_data_room_access(room_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shares
    WHERE data_room_id = room_id
      AND shared_with = auth.uid()
  );
$$;

-- Function to check if a folder is shared via token
CREATE OR REPLACE FUNCTION public.is_folder_shared_by_token(folder_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shares
    WHERE folder_id = folder_id_param
    AND share_token IS NOT NULL
    AND (expires_at IS NULL OR expires_at > NOW())
  );
$$;

-- Function to check if a user has access to a folder
CREATE OR REPLACE FUNCTION public.is_user_has_folder_access(folder_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.shares
    WHERE folder_id = folder_id_param
      AND shared_with = auth.uid()
);
$$;

-- Function to check if a file is shared via token
CREATE OR REPLACE FUNCTION public.is_file_shared_by_token(file_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shares
    WHERE file_id = file_id_param
    AND share_token IS NOT NULL
    AND (expires_at IS NULL OR expires_at > NOW())
  );
$$;

-- Function to find user by email
CREATE OR REPLACE FUNCTION public.get_profile_id_by_email(p_email text)
RETURNS public.profiles
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT p.*
    FROM public.profiles p
    WHERE p.email = p_email
    LIMIT 1;
$$;

ALTER FUNCTION public.get_profile_id_by_email(text) OWNER TO postgres;

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view profiles of users who shared with them"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT shared_by FROM public.shares WHERE shared_with = auth.uid()
      UNION
      SELECT shared_with FROM public.shares WHERE shared_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Data rooms policies
CREATE POLICY "Users can view their own data rooms"
  ON public.data_rooms FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view data rooms shared with them"
  ON public.data_rooms FOR SELECT
  USING (
   public.is_user_has_data_room_access(id)
   OR public.is_data_room_shared_by_token(id)
  );

CREATE POLICY "Users can insert their own data rooms"
  ON public.data_rooms FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own data rooms"
  ON public.data_rooms FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can update data rooms with edit permission"
  ON public.data_rooms FOR UPDATE
  USING (
    id IN (
      SELECT data_room_id FROM public.shares
      WHERE shared_with = auth.uid() AND permission = 'edit'
    )
  );

CREATE POLICY "Users can delete their own data rooms"
  ON public.data_rooms FOR DELETE
  USING (owner_id = auth.uid());

-- Folders policies
CREATE POLICY "Users can view their own folders"
  ON public.folders FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view folders in shared data rooms"
  ON public.folders FOR SELECT
  USING (
    data_room_id IN (
      SELECT data_room_id FROM public.shares
      WHERE shared_with = auth.uid()
    )
  );

CREATE POLICY "Users can view folders shared directly with them"
  ON public.folders FOR SELECT
  USING (
    id IN (
      SELECT folder_id FROM public.shares
      WHERE shared_with = auth.uid()
    ) OR public.is_folder_shared_by_token(id)
  );

CREATE POLICY "Users can insert folders in their own data rooms"
  ON public.folders FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can insert folders in data rooms with edit permission"
  ON public.folders FOR INSERT
  WITH CHECK (
    data_room_id IN (
      SELECT data_room_id FROM public.shares 
      WHERE shared_with = auth.uid() AND permission = 'edit'
    )
  );

CREATE POLICY "Users can update their own folders"
  ON public.folders FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can update folders with edit permission"
  ON public.folders FOR UPDATE
  USING (
    data_room_id IN (
      SELECT data_room_id FROM public.shares
      WHERE shared_with = auth.uid() AND permission = 'edit'
    )
  );

CREATE POLICY "Users can delete their own folders"
  ON public.folders FOR DELETE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete folders with edit permission"
  ON public.folders FOR DELETE
  USING (
    data_room_id IN (
      SELECT data_room_id FROM public.shares 
      WHERE shared_with = auth.uid() AND permission = 'edit'
    )
  );

-- Files policies (similar to folders)
CREATE POLICY "Users can view their own files"
  ON public.files FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view files in shared data rooms"
  ON public.files FOR SELECT
  USING (
    data_room_id IN (
      SELECT data_room_id FROM public.shares
      WHERE shared_with = auth.uid()
    )
  );

CREATE POLICY "Users can view files in shared folders"
  ON public.files FOR SELECT
  USING (
    folder_id IN (
      SELECT folder_id FROM public.shares
      WHERE shared_with = auth.uid()
    )
  );

CREATE POLICY "Users can view files shared directly with them"
  ON public.files FOR SELECT
  USING (
    id IN (
      SELECT file_id FROM public.shares
      WHERE shared_with = auth.uid()
    ) OR public.is_file_shared_by_token(id)
  );

CREATE POLICY "Users can insert files in their own data rooms"
  ON public.files FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can insert files with edit permission"
  ON public.files FOR INSERT
  WITH CHECK (
    data_room_id IN (
      SELECT data_room_id FROM public.shares 
      WHERE shared_with = auth.uid() AND permission = 'edit'
    )
  );

CREATE POLICY "Users can update their own files"
  ON public.files FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can update files with edit permission"
  ON public.files FOR UPDATE
  USING (
    data_room_id IN (
      SELECT data_room_id FROM public.shares
      WHERE shared_with = auth.uid() AND permission = 'edit'
    )
  );

CREATE POLICY "Users can delete their own files"
  ON public.files FOR DELETE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete files with edit permission"
  ON public.files FOR DELETE
  USING (
    data_room_id IN (
      SELECT data_room_id FROM public.shares 
      WHERE shared_with = auth.uid() AND permission = 'edit'
    )
  );

-- Shares policies
CREATE POLICY "Users can view shares they created"
  ON public.shares FOR SELECT
  USING (shared_by = auth.uid());

CREATE POLICY "Users can view shares for their items"
  ON public.shares FOR SELECT
  USING (
    (data_room_id IS NOT NULL AND public.is_data_room_owner(data_room_id, auth.uid())) OR
    (folder_id IS NOT NULL AND public.is_folder_owner(folder_id, auth.uid())) OR
    (file_id IS NOT NULL AND public.is_file_owner(file_id, auth.uid()))
  );

CREATE POLICY "Users can view shares for themselves"
  ON public.shares FOR SELECT
  USING (shared_with = auth.uid());

CREATE POLICY "Users can create shares for their own items"
  ON public.shares FOR INSERT
  WITH CHECK (
    shared_by = auth.uid() AND (
      (data_room_id IS NOT NULL AND public.is_data_room_owner(data_room_id, auth.uid())) OR
      (folder_id IS NOT NULL AND public.is_folder_owner(folder_id, auth.uid())) OR
      (file_id IS NOT NULL AND public.is_file_owner(file_id, auth.uid()))
    )
  );

CREATE POLICY "Users can delete shares they created"
  ON public.shares FOR DELETE
  USING (shared_by = auth.uid());

CREATE POLICY "Anyone can view shares by token"
  ON public.shares FOR SELECT
  USING (share_token IS NOT NULL);
