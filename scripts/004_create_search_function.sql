-- Create a function for global search across files and folders
CREATE OR REPLACE FUNCTION public.search_items(
  search_query TEXT,
  user_id UUID,
  search_data_room_id UUID DEFAULT NULL,
  search_folder_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  data_room_id UUID,
  folder_id UUID,
  parent_id UUID,
  owner_id UUID,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Search folders
  SELECT 
    f.id,
    f.name,
    'folder'::TEXT as type,
    f.data_room_id,
    NULL::UUID as folder_id,
    f.parent_id,
    f.owner_id,
    f.created_at
  FROM public.folders f
  WHERE 
    LOWER(f.name) LIKE LOWER('%' || search_query || '%')
    AND (
      f.owner_id = user_id 
      OR f.data_room_id IN (SELECT data_room_id FROM public.shares WHERE shared_with = user_id)
      OR f.id IN (SELECT folder_id FROM public.shares WHERE shared_with = user_id)
    )
    AND (search_data_room_id IS NULL OR f.data_room_id = search_data_room_id)
    AND (search_folder_id IS NULL OR f.parent_id = search_folder_id)
  
  UNION ALL
  
  -- Search files
  SELECT 
    fi.id,
    fi.name,
    'file'::TEXT as type,
    fi.data_room_id,
    fi.folder_id,
    NULL::UUID as parent_id,
    fi.owner_id,
    fi.created_at
  FROM public.files fi
  WHERE 
    LOWER(fi.name) LIKE LOWER('%' || search_query || '%')
    AND (
      fi.owner_id = user_id 
      OR fi.data_room_id IN (SELECT data_room_id FROM public.shares WHERE shared_with = user_id)
      OR fi.folder_id IN (SELECT folder_id FROM public.shares WHERE shared_with = user_id)
      OR fi.id IN (SELECT file_id FROM public.shares WHERE shared_with = user_id)
    )
    AND (search_data_room_id IS NULL OR fi.data_room_id = search_data_room_id)
    AND (search_folder_id IS NULL OR fi.folder_id = search_folder_id)
  
  ORDER BY created_at DESC;
END;
$$;
