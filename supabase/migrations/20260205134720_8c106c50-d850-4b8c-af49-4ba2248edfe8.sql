-- Corrigir problema restante: função find_user_by_identifier sem search_path

-- 1. Corrigir find_user_by_identifier
CREATE OR REPLACE FUNCTION public.find_user_by_identifier(identifier text)
 RETURNS TABLE(user_id uuid, email text, username text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
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

-- 2. Corrigir políticas RLS permissivas (WITH CHECK true para INSERT em error_logs e audit_logs)
-- Essas são intencionais pois qualquer usuário autenticado pode criar logs de erro
-- Vou adicionar uma verificação mais segura

-- Para error_logs - permitir apenas usuários autenticados
DROP POLICY IF EXISTS "Users can create logs" ON public.error_logs;
CREATE POLICY "Authenticated users can create error logs" 
ON public.error_logs 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Para audit_logs - permitir apenas inserções pelo sistema (já está correto, mantendo)

-- Para login_attempts - já está correto, é necessário permitir inserções anônimas

-- 3. Recriar a view student_performance corretamente para não usar SECURITY DEFINER
-- A view anterior ainda pode estar com problema, vamos garantir que está correta
DROP VIEW IF EXISTS public.student_performance CASCADE;

CREATE OR REPLACE VIEW public.student_performance 
WITH (security_invoker = true)
AS
SELECT 
    g.student_id,
    s.name as student_name,
    g.project_id,
    p.name as project_name,
    ROUND(AVG(g.grade), 2) as average_grade,
    COALESCE(
      ROUND(
        (COUNT(*) FILTER (WHERE a.status = 'presente')::numeric / 
         NULLIF(COUNT(DISTINCT a.id), 0) * 100),
        2
      ),
      0
    ) as attendance_rate
FROM grades g
JOIN students s ON g.student_id = s.id
JOIN projects p ON g.project_id = p.id
LEFT JOIN attendance a ON g.student_id = a.student_id AND g.project_id = a.project_id
GROUP BY g.student_id, s.name, g.project_id, p.name;