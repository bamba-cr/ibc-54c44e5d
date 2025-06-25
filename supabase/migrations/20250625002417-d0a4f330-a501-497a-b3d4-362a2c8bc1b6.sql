
-- Primeiro, vamos garantir que temos um trigger funcional para criar profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Migrar dados existentes de auth.users para profiles (se não existirem)
INSERT INTO public.profiles (id, email, username)
SELECT 
  au.id, 
  au.email, 
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1))
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Criar função melhorada para buscar administradores
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(
  user_id uuid,
  email text,
  username text,
  role_id uuid,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    ur.user_id,
    COALESCE(p.email, au.email) as email,
    COALESCE(p.username, split_part(COALESCE(p.email, au.email), '@', 1)) as username,
    ur.id as role_id,
    ur.created_at
  FROM user_roles ur
  LEFT JOIN profiles p ON ur.user_id = p.id
  LEFT JOIN auth.users au ON ur.user_id = au.id
  WHERE ur.role = 'admin'
  ORDER BY ur.created_at DESC;
$$;

-- Criar função para buscar usuário por email ou username
CREATE OR REPLACE FUNCTION public.find_user_by_identifier(identifier text)
RETURNS TABLE(
  user_id uuid,
  email text,
  username text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id as user_id,
    p.email,
    p.username
  FROM profiles p
  WHERE LOWER(p.email) = LOWER(identifier) 
     OR LOWER(p.username) = LOWER(identifier)
  LIMIT 1;
$$;

-- Melhorar a função de logs de erro
CREATE OR REPLACE FUNCTION public.get_error_logs_with_details()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  user_email text,
  error_type error_type,
  message text,
  stack_trace text,
  additional_data jsonb,
  route text,
  created_at timestamptz,
  resolved boolean,
  resolution_notes text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    el.id,
    el.user_id,
    COALESCE(p.email, au.email)::text as user_email,
    el.error_type,
    el.message,
    el.stack_trace,
    el.additional_data,
    el.route,
    el.created_at,
    COALESCE(el.resolved, false) as resolved,
    el.resolution_notes
  FROM error_logs el
  LEFT JOIN profiles p ON el.user_id = p.id
  LEFT JOIN auth.users au ON el.user_id = au.id
  ORDER BY el.created_at DESC;
END;
$$;

-- Adicionar política RLS para a tabela profiles se não existir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
