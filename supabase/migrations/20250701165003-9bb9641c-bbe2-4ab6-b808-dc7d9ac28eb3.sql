
-- Primeiro, vamos dropar as políticas que dependem da função is_admin
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

-- Agora podemos dropar as funções existentes
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_profile(uuid);
DROP FUNCTION IF EXISTS public.get_pending_users();
DROP FUNCTION IF EXISTS public.approve_user(uuid);
DROP FUNCTION IF EXISTS public.reject_user(uuid, text);
DROP FUNCTION IF EXISTS public.setup_initial_admin(text);
DROP FUNCTION IF EXISTS public.promote_to_admin(uuid);

-- Vamos manter a tabela profiles existente e apenas adicionar colunas se necessário
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Atualizar a coluna status se ela existir mas não tiver o check constraint correto
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at (se não existir)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Função para verificar se usuário é admin (nova versão compatível)
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND is_admin = TRUE AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar as políticas RLS para user_roles usando a nova função
CREATE POLICY "Users can view own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage roles" 
  ON public.user_roles 
  FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Função para obter perfil do usuário
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email TEXT,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_admin BOOLEAN,
  status user_status,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
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
    p.is_admin,
    COALESCE(p.status, 'pending'::user_status) as status,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter usuários pendentes
CREATE OR REPLACE FUNCTION public.get_pending_users()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email TEXT,
  username TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  status user_status
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para aprovar usuário
CREATE OR REPLACE FUNCTION public.approve_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para rejeitar usuário
CREATE OR REPLACE FUNCTION public.reject_user(target_user_id UUID, reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para promover usuário a admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que existe pelo menos um admin no sistema
-- Vamos atualizar qualquer usuário existente com email admin@localibc.com
UPDATE public.profiles 
SET 
  is_admin = TRUE,
  status = 'approved',
  approved_at = NOW()
WHERE email = 'admin@localibc.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE is_admin = TRUE);
