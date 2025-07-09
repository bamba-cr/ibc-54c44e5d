
-- Criar enum para status de usuário se não existir
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adicionar colunas de aprovação na tabela profiles se não existirem
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Função para verificar se um usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND is_admin = TRUE AND status = 'approved'
  );
END;
$$;

-- Função para obter usuários pendentes de aprovação
CREATE OR REPLACE FUNCTION public.get_pending_users()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  email text,
  username text,
  full_name text,
  created_at timestamp with time zone,
  status user_status
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se quem está chamando é admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem ver usuários pendentes';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.email,
    p.username,
    p.full_name,
    p.created_at,
    COALESCE(p.status, 'pending'::user_status) as status
  FROM public.profiles p
  WHERE COALESCE(p.status, 'pending'::user_status) = 'pending'
  ORDER BY p.created_at DESC;
END;
$$;

-- Função para verificar se usuário está aprovado
CREATE OR REPLACE FUNCTION public.is_user_approved(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = $1
      AND status = 'approved'
  );
$$;

-- Função para aprovar usuário
CREATE OR REPLACE FUNCTION public.approve_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se quem está chamando é admin
  IF NOT public.is_admin() THEN
    RETURN FALSE;
  END IF;
  
  -- Aprovar o usuário
  UPDATE public.profiles 
  SET 
    status = 'approved',
    approved_by = auth.uid(),
    approved_at = NOW(),
    rejection_reason = NULL
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Função para rejeitar usuário
CREATE OR REPLACE FUNCTION public.reject_user(target_user_id uuid, reason text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se quem está chamando é admin
  IF NOT public.is_admin() THEN
    RETURN FALSE;
  END IF;
  
  -- Rejeitar o usuário
  UPDATE public.profiles 
  SET 
    status = 'rejected',
    rejection_reason = reason,
    approved_by = auth.uid(),
    approved_at = NOW()
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Função para promover usuário a admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se quem está chamando é admin
  IF NOT public.is_admin() THEN
    RETURN FALSE;
  END IF;
  
  -- Promover o usuário (apenas se já estiver aprovado)
  UPDATE public.profiles 
  SET 
    is_admin = TRUE,
    approved_by = auth.uid(),
    approved_at = NOW()
  WHERE user_id = target_user_id AND status = 'approved';
  
  RETURN FOUND;
END;
$$;

-- Atualizar a função get_user_profile para incluir status
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
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = user_uuid;
END;
$$;

-- Atualizar o trigger para definir novos usuários como pendentes por padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    full_name,
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'pending'::user_status,
    now(),
    now()
  );
  RETURN NEW;
END;
$$;

-- Aprovar automaticamente o usuário atual como admin root
UPDATE profiles 
SET 
  status = 'approved',
  is_admin = true,
  approved_by = user_id,
  approved_at = NOW()
WHERE user_id = '9eb5dc7e-2995-405e-90a4-b24e1f5df5cd';
