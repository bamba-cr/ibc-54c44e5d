
-- Melhorar a estrutura da tabela profiles com mais campos úteis
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Criar função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar o updated_at na tabela profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

-- Melhorar a função handle_new_user para incluir mais dados
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
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    now(),
    now()
  );
  RETURN NEW;
END;
$$;

-- Função para verificar se um usuário é administrador
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = $1
      AND role = 'admin'
  );
$$;

-- Função para obter perfil completo do usuário
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  email text,
  username text,
  full_name text,
  avatar_url text,
  phone text,
  is_admin boolean,
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
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = $1;
$$;

-- Função para criar o primeiro administrador do sistema
CREATE OR REPLACE FUNCTION public.create_initial_admin(admin_email text)
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
  
  -- Criar o role de admin
  INSERT INTO user_roles (user_id, role)
  VALUES (admin_user_id, 'admin');
  
  RETURN true;
END;
$$;

-- Atualizar as políticas RLS para ser mais específicas
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Política para user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
