-- Corrigir search_path nas funções de banco para prevenir SQL injection
-- Recriar todas as funções com SET search_path = public

CREATE OR REPLACE FUNCTION public.has_permission(user_uuid uuid, permission_name permission_type)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.role_permissions rp ON p.role_id = rp.role_id
    JOIN public.roles r ON rp.role_id = r.id
    WHERE p.user_id = user_uuid 
      AND rp.permission = permission_name
      AND p.status = 'approved'
      AND r.is_active = true
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND is_admin = TRUE AND status = 'approved'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_pending_users()
 RETURNS TABLE(id uuid, user_id uuid, email text, username text, full_name text, created_at timestamp with time zone, status user_status)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.approve_user(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid DEFAULT auth.uid())
 RETURNS TABLE(permission permission_type)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT rp.permission
  FROM public.profiles p
  JOIN public.role_permissions rp ON p.role_id = rp.role_id
  JOIN public.roles r ON rp.role_id = r.id
  WHERE p.user_id = user_uuid 
    AND p.status = 'approved'
    AND r.is_active = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reject_user(target_user_id uuid, reason text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.promote_to_admin(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.create_user_by_admin(email_param text, password_param text, full_name_param text, role_id_param uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Verificar se quem está chamando é admin
  IF NOT public.is_admin() THEN
    RETURN json_build_object('error', 'Acesso negado: apenas administradores podem criar usuários');
  END IF;
  
  -- Verificar se o role existe
  IF NOT EXISTS(SELECT 1 FROM public.roles WHERE id = role_id_param AND is_active = true) THEN
    RETURN json_build_object('error', 'Cargo inválido');
  END IF;
  
  -- Criar usuário no auth.users (isso seria feito via API do Supabase)
  -- Por enquanto, apenas retornamos sucesso para implementação no frontend
  RETURN json_build_object(
    'success', true,
    'message', 'Usuário criado com sucesso'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.user_sessions 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid uuid DEFAULT auth.uid())
 RETURNS TABLE(id uuid, user_id uuid, email text, username text, full_name text, avatar_url text, phone text, is_admin boolean, status user_status, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
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
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = user_uuid;
END;
$function$;

CREATE OR REPLACE FUNCTION public.find_user_by_identifier(identifier text)
 RETURNS TABLE(user_id uuid, email text, username text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT 
    p.id as user_id,
    p.email,
    p.username
  FROM profiles p
  WHERE LOWER(p.email) = LOWER(identifier) 
     OR LOWER(p.username) = LOWER(identifier)
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_error_logs_with_details()
 RETURNS TABLE(id uuid, user_id uuid, user_email text, error_type error_type, message text, stack_trace text, additional_data jsonb, route text, created_at timestamp with time zone, resolved boolean, resolution_notes text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_users()
 RETURNS TABLE(user_id uuid, email text, username text, role_id uuid, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- Criar tabela para rate limiting de login
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  attempt_time timestamp with time zone DEFAULT now(),
  success boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela de tentativas de login
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de tentativas de login
CREATE POLICY "Permitir inserção de tentativas de login" ON public.login_attempts
FOR INSERT WITH CHECK (true);

-- Política para admins visualizarem tentativas de login
CREATE POLICY "Admins podem ver tentativas de login" ON public.login_attempts
FOR SELECT USING (is_admin());

-- Função para validar CPF mais robusta
CREATE OR REPLACE FUNCTION public.validate_cpf(cpf_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $function$
DECLARE
    cpf_clean text;
    digit1 integer;
    digit2 integer;
    sum1 integer := 0;
    sum2 integer := 0;
    i integer;
BEGIN
    -- Remover caracteres não numéricos e validar formato
    cpf_clean := regexp_replace(cpf_input, '[^0-9]', '', 'g');
    
    -- Verificar se tem 11 dígitos
    IF length(cpf_clean) != 11 THEN
        RETURN false;
    END IF;
    
    -- Verificar se não são todos dígitos iguais
    IF cpf_clean IN ('00000000000', '11111111111', '22222222222', '33333333333', 
                     '44444444444', '55555555555', '66666666666', '77777777777',
                     '88888888888', '99999999999') THEN
        RETURN false;
    END IF;
    
    -- Calcular primeiro dígito verificador
    FOR i IN 1..9 LOOP
        sum1 := sum1 + (substring(cpf_clean, i, 1)::integer * (11 - i));
    END LOOP;
    
    digit1 := 11 - (sum1 % 11);
    IF digit1 >= 10 THEN
        digit1 := 0;
    END IF;
    
    -- Verificar primeiro dígito
    IF digit1 != substring(cpf_clean, 10, 1)::integer THEN
        RETURN false;
    END IF;
    
    -- Calcular segundo dígito verificador
    FOR i IN 1..10 LOOP
        sum2 := sum2 + (substring(cpf_clean, i, 1)::integer * (12 - i));
    END LOOP;
    
    digit2 := 11 - (sum2 % 11);
    IF digit2 >= 10 THEN
        digit2 := 0;
    END IF;
    
    -- Verificar segundo dígito
    IF digit2 != substring(cpf_clean, 11, 1)::integer THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$function$;

-- Função para verificar rate limiting de login
CREATE OR REPLACE FUNCTION public.check_login_rate_limit(user_email text, user_ip text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    recent_attempts integer;
    blocked_until timestamp with time zone;
BEGIN
    -- Contar tentativas recentes (últimos 15 minutos)
    SELECT COUNT(*) INTO recent_attempts
    FROM public.login_attempts
    WHERE email = user_email
    AND attempt_time > (now() - interval '15 minutes')
    AND success = false;
    
    -- Se mais de 5 tentativas falharam, bloquear
    IF recent_attempts >= 5 THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$function$;

-- Função para registrar tentativa de login
CREATE OR REPLACE FUNCTION public.log_login_attempt(user_email text, was_successful boolean, user_ip text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.login_attempts (email, ip_address, success)
    VALUES (user_email, user_ip, was_successful);
    
    -- Limpar tentativas antigas (mais de 1 dia)
    DELETE FROM public.login_attempts
    WHERE attempt_time < (now() - interval '1 day');
END;
$function$;