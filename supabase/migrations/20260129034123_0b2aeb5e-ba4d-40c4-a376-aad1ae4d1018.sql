-- Adicionar os novos valores ao enum existente
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'coordenador';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'instrutor';

-- Criar função para verificar se usuário é coordenador ou admin
CREATE OR REPLACE FUNCTION public.is_coordenador_or_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role IN ('admin', 'coordenador')
  );
END;
$$;

-- Criar função para verificar se usuário é instrutor ou superior
CREATE OR REPLACE FUNCTION public.is_instrutor_or_above(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role IN ('admin', 'coordenador', 'instrutor')
  );
END;
$$;

-- Criar função para obter a role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role::text INTO user_role
  FROM public.user_roles
  WHERE user_id = user_uuid
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'coordenador' THEN 2 
      WHEN 'instrutor' THEN 3 
      ELSE 4 
    END
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Criar função para atribuir role a um usuário (apenas admins)
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id uuid, new_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se quem está chamando é admin
  IF NOT public.is_admin() THEN
    RETURN FALSE;
  END IF;
  
  -- Remover roles existentes do usuário
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Inserir nova role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role);
  
  RETURN TRUE;
END;
$$;

-- Atualizar RLS de projetos para permitir apenas coordenadores e admins modificarem
DROP POLICY IF EXISTS "Projects can be modified by authenticated users" ON public.projects;

CREATE POLICY "Projects can be modified by coordenadores and admins" 
ON public.projects 
FOR ALL 
USING (is_coordenador_or_admin())
WITH CHECK (is_coordenador_or_admin());

-- Atualizar RLS de alunos para permitir apenas coordenadores e admins criarem/editarem
DROP POLICY IF EXISTS "Students can be modified by authenticated users" ON public.students;

CREATE POLICY "Students can be modified by coordenadores and admins" 
ON public.students 
FOR ALL 
USING (is_coordenador_or_admin())
WITH CHECK (is_coordenador_or_admin());

-- Atualizar RLS de student_projects
DROP POLICY IF EXISTS "Student projects can be modified by authenticated users" ON public.student_projects;

CREATE POLICY "Student projects can be modified by coordenadores and admins" 
ON public.student_projects 
FOR ALL 
USING (is_coordenador_or_admin())
WITH CHECK (is_coordenador_or_admin());

-- Instrutores podem registrar frequência e notas
DROP POLICY IF EXISTS "Attendance records can be modified by authenticated users" ON public.attendance;
DROP POLICY IF EXISTS "Grades can be modified by authenticated users" ON public.grades;

CREATE POLICY "Attendance can be modified by instrutores coordenadores and admins" 
ON public.attendance 
FOR ALL 
USING (is_instrutor_or_above())
WITH CHECK (is_instrutor_or_above());

CREATE POLICY "Grades can be modified by instrutores coordenadores and admins" 
ON public.grades 
FOR ALL 
USING (is_instrutor_or_above())
WITH CHECK (is_instrutor_or_above());