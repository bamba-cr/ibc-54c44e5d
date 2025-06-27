
-- Remover função existente para poder recriar com novo tipo de retorno
DROP FUNCTION IF EXISTS public.get_user_profile(uuid);

-- Criar enum para status de usuário (se não existir)
DO $$ BEGIN
    CREATE TYPE public.user_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Atualizar tabela profiles para incluir status e campos adicionais
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Criar função para verificar se usuário está aprovado
CREATE OR REPLACE FUNCTION public.is_user_approved(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = $1
      AND status = 'approved'
  );
$$;

-- Recriar função get_user_profile com novo tipo de retorno
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  email text,
  username text,
  full_name text,
  avatar_url text,
  phone text,
  is_admin boolean,
  status user_status,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.email,
    p.username,
    p.full_name,
    p.avatar_url,
    p.phone,
    public.is_admin(p.id) as is_admin,
    COALESCE(p.status, 'pending'::user_status) as status,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = $1;
$$;

-- Criar função para obter usuários pendentes (apenas para admins)
CREATE OR REPLACE FUNCTION public.get_pending_users()
RETURNS TABLE(
  id uuid,
  email text,
  username text,
  full_name text,
  created_at timestamptz,
  status user_status
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.email,
    p.username,
    p.full_name,
    p.created_at,
    COALESCE(p.status, 'pending'::user_status) as status
  FROM public.profiles p
  WHERE COALESCE(p.status, 'pending'::user_status) = 'pending'
    AND public.is_admin(auth.uid())
  ORDER BY p.created_at ASC;
$$;

-- Criar função para aprovar usuário
CREATE OR REPLACE FUNCTION public.approve_user(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se quem está aprovando é admin
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN false;
  END IF;
  
  -- Aprovar o usuário
  UPDATE public.profiles
  SET 
    status = 'approved',
    approved_by = auth.uid(),
    approved_at = now()
  WHERE id = user_id_param;
  
  RETURN true;
END;
$$;

-- Criar função para rejeitar usuário
CREATE OR REPLACE FUNCTION public.reject_user(user_id_param uuid, reason text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se quem está rejeitando é admin
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN false;
  END IF;
  
  -- Rejeitar o usuário
  UPDATE public.profiles
  SET 
    status = 'rejected',
    approved_by = auth.uid(),
    approved_at = now(),
    rejection_reason = reason
  WHERE id = user_id_param;
  
  RETURN true;
END;
$$;

-- Criar função para configurar o primeiro admin
CREATE OR REPLACE FUNCTION public.setup_initial_admin(admin_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
  admin_exists boolean;
BEGIN
  -- Verificar se já existe algum administrador
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE role = 'admin'
  ) INTO admin_exists;
  
  IF admin_exists THEN
    RETURN false; -- Já existe um admin
  END IF;
  
  -- Buscar o usuário pelo email
  SELECT id INTO admin_user_id
  FROM profiles
  WHERE LOWER(email) = LOWER(admin_email);
  
  IF admin_user_id IS NULL THEN
    RETURN false; -- Usuário não encontrado
  END IF;
  
  -- Criar o role de admin e aprovar automaticamente
  INSERT INTO user_roles (user_id, role)
  VALUES (admin_user_id, 'admin');
  
  UPDATE profiles 
  SET status = 'approved', approved_at = now()
  WHERE id = admin_user_id;
  
  RETURN true;
END;
$$;
