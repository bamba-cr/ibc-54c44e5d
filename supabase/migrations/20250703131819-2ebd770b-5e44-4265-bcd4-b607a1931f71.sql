
-- Update the get_user_profile function to include rejection_reason in the return type
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  email text, 
  username text, 
  full_name text, 
  avatar_url text, 
  phone text, 
  is_admin boolean, 
  status user_status, 
  rejection_reason text,
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.email,
    p.username,
    p.full_name,
    p.avatar_url,
    p.phone,
    COALESCE(p.is_admin, false) as is_admin,
    COALESCE(p.status, 'pending'::user_status) as status,
    p.rejection_reason,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = user_uuid;
END;
$function$
