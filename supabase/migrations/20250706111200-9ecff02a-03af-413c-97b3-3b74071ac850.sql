
-- Remove todas as tabelas e funções relacionadas ao sistema atual
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.error_logs CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- Remove tipos personalizados
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.user_status CASCADE;
DROP TYPE IF EXISTS public.error_type CASCADE;

-- Remove funções existentes
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_pending_users() CASCADE;
DROP FUNCTION IF EXISTS public.approve_user(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.reject_user(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.promote_to_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_profile(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.find_user_by_identifier(text) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_events(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.create_initial_admin(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_error_logs_with_details() CASCADE;
DROP FUNCTION IF EXISTS public.get_admin_users() CASCADE;

-- Cria novo tipo para status do usuário
CREATE TYPE public.user_status AS ENUM ('pending', 'approved', 'rejected');

-- Cria tabela de usuários simplificada
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  status user_status DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all users" 
  ON public.users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND is_admin = TRUE 
      AND status = 'approved'
    )
  );

CREATE POLICY "Users can insert their own profile" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Admins can update all users" 
  ON public.users 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND is_admin = TRUE 
      AND status = 'approved'
    )
  );

CREATE POLICY "Users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = auth_user_id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (
    auth_user_id,
    email,
    full_name,
    phone
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_user_id = user_id 
    AND is_admin = TRUE 
    AND status = 'approved'
  );
$$;

-- Função para buscar usuários pendentes
CREATE OR REPLACE FUNCTION public.get_pending_users()
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem ver usuários pendentes';
  END IF;
  
  RETURN QUERY
  SELECT u.id, u.email, u.full_name, u.phone, u.created_at
  FROM public.users u
  WHERE u.status = 'pending'
  ORDER BY u.created_at DESC;
END;
$$;

-- Função para aprovar usuário
CREATE OR REPLACE FUNCTION public.approve_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_admin() THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.users 
  SET status = 'approved', rejection_reason = NULL, updated_at = NOW()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Função para rejeitar usuário
CREATE OR REPLACE FUNCTION public.reject_user(target_user_id UUID, reason TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_admin() THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.users 
  SET status = 'rejected', rejection_reason = reason, updated_at = NOW()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Função para promover a admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_admin() THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.users 
  SET is_admin = TRUE, updated_at = NOW()
  WHERE id = target_user_id AND status = 'approved';
  
  RETURN FOUND;
END;
$$;

-- Criar administrador inicial (executar apenas uma vez)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@sistema.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Inserir perfil do admin
INSERT INTO public.users (auth_user_id, email, full_name, is_admin, status)
SELECT id, 'admin@sistema.com', 'Administrador Geral', TRUE, 'approved'
FROM auth.users 
WHERE email = 'admin@sistema.com'
ON CONFLICT (email) DO UPDATE SET 
  is_admin = TRUE, 
  status = 'approved';
