
-- Corrigir a estrutura da tabela profiles para usar user_id em vez de id como referência
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Copiar dados da coluna id para user_id se necessário
UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;

-- Atualizar a função get_user_profile para usar a estrutura correta e incluir rejection_reason
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
