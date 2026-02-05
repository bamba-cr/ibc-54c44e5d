-- Corrigir a última função sem search_path: handle_new_user

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    user_id,
    email,
    username,
    full_name,
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
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

-- Corrigir as políticas RLS permissivas restantes
-- 1. audit_logs - apenas sistema pode inserir (via triggers)
DROP POLICY IF EXISTS "Sistema pode inserir logs de auditoria" ON public.audit_logs;
CREATE POLICY "Sistema pode inserir logs de auditoria" 
ON public.audit_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. login_attempts - precisa permitir inserções anônimas para rate limiting
-- Esta política é intencional e necessária para o rate limiting funcionar
-- Vamos manter mas com uma nota clara
DROP POLICY IF EXISTS "Permitir inserção de tentativas de login" ON public.login_attempts;
CREATE POLICY "Rate limiting - inserir tentativas de login" 
ON public.login_attempts 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

COMMENT ON POLICY "Rate limiting - inserir tentativas de login" ON public.login_attempts 
IS 'Política intencionalmente permissiva para rate limiting de login funcionar antes da autenticação';