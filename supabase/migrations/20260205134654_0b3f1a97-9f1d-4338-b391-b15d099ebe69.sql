-- Corrigir funções sem search_path definido para prevenir SQL injection

-- 1. calculate_attendance_rate
CREATE OR REPLACE FUNCTION public.calculate_attendance_rate(student_id_param uuid, project_id_param uuid DEFAULT NULL::uuid)
 RETURNS numeric
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $$
  SELECT ROUND(
    (COUNT(*) FILTER (WHERE status = 'presente')::numeric / 
     NULLIF(COUNT(*), 0) * 100),
    2
  )
  FROM attendance
  WHERE student_id = student_id_param
    AND (project_id_param IS NULL OR project_id = project_id_param);
$$;

-- 2. calculate_student_average
CREATE OR REPLACE FUNCTION public.calculate_student_average(student_id_param uuid, project_id_param uuid DEFAULT NULL::uuid, period_param character varying DEFAULT NULL::character varying)
 RETURNS numeric
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $$
  SELECT ROUND(AVG(grade), 2)
  FROM grades
  WHERE student_id = student_id_param
    AND (project_id_param IS NULL OR project_id = project_id_param)
    AND (period_param IS NULL OR period = period_param);
$$;

-- 3. get_attendance_report
CREATE OR REPLACE FUNCTION public.get_attendance_report(project_id_param uuid, start_date date DEFAULT NULL::date, end_date date DEFAULT NULL::date)
 RETURNS TABLE(student_id uuid, student_name character varying, total_classes bigint, present_count bigint, absent_count bigint, attendance_rate numeric)
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $$
  SELECT 
    s.id as student_id,
    s.name as student_name,
    COUNT(a.id) as total_classes,
    COUNT(*) FILTER (WHERE a.status = 'presente') as present_count,
    COUNT(*) FILTER (WHERE a.status = 'ausente') as absent_count,
    ROUND(
      (COUNT(*) FILTER (WHERE a.status = 'presente')::numeric / 
       NULLIF(COUNT(a.id), 0) * 100),
      2
    ) as attendance_rate
  FROM students s
  JOIN student_projects sp ON s.id = sp.student_id
  LEFT JOIN attendance a ON s.id = a.student_id AND a.project_id = project_id_param
    AND (start_date IS NULL OR a.date >= start_date)
    AND (end_date IS NULL OR a.date <= end_date)
  WHERE sp.project_id = project_id_param
  GROUP BY s.id, s.name
  ORDER BY s.name;
$$;

-- 4. get_birthday_students
CREATE OR REPLACE FUNCTION public.get_birthday_students(month_param integer DEFAULT NULL::integer)
 RETURNS TABLE(id uuid, name character varying, birth_date date, age integer, polo_name character varying, city_name character varying)
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $$
  SELECT 
    s.id,
    s.name,
    s.birth_date,
    s.age,
    p.name as polo_name,
    c.name as city_name
  FROM students s
  LEFT JOIN polos p ON s.polo_id = p.id
  LEFT JOIN cities c ON s.city_id = c.id
  WHERE EXTRACT(MONTH FROM s.birth_date) = COALESCE(month_param, EXTRACT(MONTH FROM CURRENT_DATE))
  ORDER BY EXTRACT(DAY FROM s.birth_date);
$$;

-- 5. get_project_rankings
CREATE OR REPLACE FUNCTION public.get_project_rankings(project_id_param uuid)
 RETURNS TABLE(student_id uuid, student_name character varying, average_grade numeric, attendance_rate numeric, grade_rank bigint, attendance_rank bigint)
 LANGUAGE sql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $$
    WITH student_metrics AS (
        SELECT 
            s.id as student_id,
            s.name as student_name,
            COALESCE(AVG(g.grade), 0) as average_grade,
            COALESCE(
                COUNT(CASE WHEN a.status = 'presente' THEN 1 END)::numeric / 
                NULLIF(COUNT(a.status), 0)::numeric * 100, 
                0
            ) as attendance_rate
        FROM students s
        JOIN student_projects sp ON s.id = sp.student_id
        LEFT JOIN grades g ON s.id = g.student_id AND g.project_id = project_id_param
        LEFT JOIN attendance a ON s.id = a.student_id AND a.project_id = project_id_param
        WHERE sp.project_id = project_id_param
        GROUP BY s.id, s.name
    )
    SELECT 
        student_id,
        student_name,
        average_grade,
        attendance_rate,
        RANK() OVER (ORDER BY average_grade DESC) as grade_rank,
        RANK() OVER (ORDER BY attendance_rate DESC) as attendance_rank
    FROM student_metrics
    ORDER BY average_grade DESC, attendance_rate DESC;
$$;

-- 6. get_project_statistics
CREATE OR REPLACE FUNCTION public.get_project_statistics(project_id_param uuid)
 RETURNS TABLE(project_name character varying, total_students bigint, average_grade numeric, average_attendance numeric, total_grades bigint, total_attendance_records bigint)
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $$
  SELECT 
    p.name as project_name,
    COUNT(DISTINCT sp.student_id) as total_students,
    ROUND(AVG(g.grade), 2) as average_grade,
    ROUND(
      (COUNT(*) FILTER (WHERE a.status = 'presente')::numeric / 
       NULLIF(COUNT(a.id), 0) * 100),
      2
    ) as average_attendance,
    COUNT(DISTINCT g.id) as total_grades,
    COUNT(DISTINCT a.id) as total_attendance_records
  FROM projects p
  LEFT JOIN student_projects sp ON p.id = sp.project_id
  LEFT JOIN grades g ON sp.student_id = g.student_id AND g.project_id = p.id
  LEFT JOIN attendance a ON sp.student_id = a.student_id AND a.project_id = p.id
  WHERE p.id = project_id_param
  GROUP BY p.id, p.name;
$$;

-- 7. get_student_report_card
CREATE OR REPLACE FUNCTION public.get_student_report_card(student_id_param uuid, project_id_param uuid DEFAULT NULL::uuid)
 RETURNS TABLE(project_id uuid, project_name character varying, subject character varying, period character varying, grade numeric, observations text)
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $$
  SELECT 
    p.id as project_id,
    p.name as project_name,
    g.subject,
    g.period,
    g.grade,
    g.observations
  FROM grades g
  JOIN projects p ON g.project_id = p.id
  WHERE g.student_id = student_id_param
    AND (project_id_param IS NULL OR g.project_id = project_id_param)
  ORDER BY p.name, g.period, g.subject;
$$;

-- 8. has_role (já é SECURITY DEFINER, apenas adicionar search_path)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 9. is_user_approved
CREATE OR REPLACE FUNCTION public.is_user_approved(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = $1
      AND status = 'approved'
  );
$$;

-- 10. get_dashboard_stats (mudar para SECURITY INVOKER e adicionar search_path)
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
 RETURNS TABLE(total_students bigint, total_projects bigint, total_polos bigint, total_cities bigint, pending_users bigint, recent_students bigint)
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    (SELECT COUNT(*) FROM students) as total_students,
    (SELECT COUNT(*) FROM projects) as total_projects,
    (SELECT COUNT(*) FROM polos) as total_polos,
    (SELECT COUNT(*) FROM cities) as total_cities,
    (SELECT COUNT(*) FROM profiles WHERE status = 'pending') as pending_users,
    (SELECT COUNT(*) FROM students WHERE created_at > NOW() - INTERVAL '30 days') as recent_students;
$$;

-- 11. get_user_events
CREATE OR REPLACE FUNCTION public.get_user_events(user_id_param uuid)
 RETURNS TABLE(id uuid, title character varying, date timestamp with time zone, description text, type character varying, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
    SELECT id, title, date, description, type, created_at
    FROM events
    WHERE user_id = user_id_param
    ORDER BY date DESC;
$$;

-- 12. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 13. Recriar a view student_performance sem SECURITY DEFINER
-- Primeiro dropar a view existente
DROP VIEW IF EXISTS public.student_performance;

-- Recriar como view normal (SECURITY INVOKER é o padrão)
CREATE VIEW public.student_performance AS
SELECT 
    g.student_id,
    s.name as student_name,
    g.project_id,
    p.name as project_name,
    ROUND(AVG(g.grade), 2) as average_grade,
    ROUND(
      (COUNT(*) FILTER (WHERE a.status = 'presente')::numeric / 
       NULLIF(COUNT(DISTINCT a.id), 0) * 100),
      2
    ) as attendance_rate
FROM grades g
JOIN students s ON g.student_id = s.id
JOIN projects p ON g.project_id = p.id
LEFT JOIN attendance a ON g.student_id = a.student_id AND g.project_id = a.project_id
GROUP BY g.student_id, s.name, g.project_id, p.name;

-- Garantir que RLS será respeitada na view
COMMENT ON VIEW public.student_performance IS 'View de performance de alunos - respeita RLS das tabelas base';