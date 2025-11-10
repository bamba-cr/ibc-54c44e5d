-- Funções para gerenciamento de estudantes

-- Obter estudantes por polo com informações completas
CREATE OR REPLACE FUNCTION public.get_students_by_polo(polo_id_param uuid)
RETURNS TABLE(
  id uuid,
  name varchar,
  birth_date date,
  age integer,
  cpf varchar,
  rg varchar,
  address varchar,
  photo_url text,
  city_name varchar,
  polo_name varchar,
  guardian_name varchar,
  guardian_phone varchar,
  guardian_email varchar,
  projects jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.birth_date,
    s.age,
    s.cpf,
    s.rg,
    s.address,
    s.photo_url,
    c.name as city_name,
    p.name as polo_name,
    s.guardian_name,
    s.guardian_phone,
    s.guardian_email,
    COALESCE(
      jsonb_agg(
        jsonb_build_object('id', pr.id, 'name', pr.name, 'code', pr.code)
      ) FILTER (WHERE pr.id IS NOT NULL),
      '[]'::jsonb
    ) as projects
  FROM students s
  LEFT JOIN cities c ON s.city_id = c.id
  LEFT JOIN polos p ON s.polo_id = p.id
  LEFT JOIN student_projects sp ON s.id = sp.student_id
  LEFT JOIN projects pr ON sp.project_id = pr.id
  WHERE s.polo_id = polo_id_param
  GROUP BY s.id, s.name, s.birth_date, s.age, s.cpf, s.rg, s.address, 
           s.photo_url, c.name, p.name, s.guardian_name, s.guardian_phone, s.guardian_email
  ORDER BY s.name;
END;
$$;

-- Obter detalhes completos de um estudante
CREATE OR REPLACE FUNCTION public.get_student_details(student_id_param uuid)
RETURNS TABLE(
  id uuid,
  name varchar,
  birth_date date,
  age integer,
  cpf varchar,
  rg varchar,
  address varchar,
  photo_url text,
  city jsonb,
  polo jsonb,
  guardian jsonb,
  projects jsonb,
  attendance_summary jsonb,
  grades_summary jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.birth_date,
    s.age,
    s.cpf,
    s.rg,
    s.address,
    s.photo_url,
    jsonb_build_object('id', c.id, 'name', c.name, 'state', c.state) as city,
    jsonb_build_object('id', p.id, 'name', p.name, 'address', p.address) as polo,
    jsonb_build_object(
      'name', s.guardian_name,
      'relationship', s.guardian_relationship,
      'cpf', s.guardian_cpf,
      'rg', s.guardian_rg,
      'phone', s.guardian_phone,
      'email', s.guardian_email
    ) as guardian,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object('id', pr.id, 'name', pr.name, 'code', pr.code, 'description', pr.description)
      )
      FROM student_projects sp
      JOIN projects pr ON sp.project_id = pr.id
      WHERE sp.student_id = s.id),
      '[]'::jsonb
    ) as projects,
    COALESCE(
      (SELECT jsonb_build_object(
        'total', COUNT(*),
        'present', COUNT(*) FILTER (WHERE status = 'presente'),
        'absent', COUNT(*) FILTER (WHERE status = 'ausente'),
        'rate', ROUND((COUNT(*) FILTER (WHERE status = 'presente')::numeric / NULLIF(COUNT(*), 0) * 100), 2)
      )
      FROM attendance a
      WHERE a.student_id = s.id),
      jsonb_build_object('total', 0, 'present', 0, 'absent', 0, 'rate', 0)
    ) as attendance_summary,
    COALESCE(
      (SELECT jsonb_build_object(
        'total', COUNT(*),
        'average', ROUND(AVG(grade), 2)
      )
      FROM grades g
      WHERE g.student_id = s.id),
      jsonb_build_object('total', 0, 'average', 0)
    ) as grades_summary
  FROM students s
  LEFT JOIN cities c ON s.city_id = c.id
  LEFT JOIN polos p ON s.polo_id = p.id
  WHERE s.id = student_id_param;
END;
$$;

-- Funções para frequência

-- Calcular percentual de presença de um estudante em um projeto
CREATE OR REPLACE FUNCTION public.calculate_attendance_rate(
  student_id_param uuid,
  project_id_param uuid DEFAULT NULL
)
RETURNS numeric
LANGUAGE sql
STABLE
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

-- Obter relatório de frequência por projeto
CREATE OR REPLACE FUNCTION public.get_attendance_report(
  project_id_param uuid,
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL
)
RETURNS TABLE(
  student_id uuid,
  student_name varchar,
  total_classes bigint,
  present_count bigint,
  absent_count bigint,
  attendance_rate numeric
)
LANGUAGE sql
STABLE
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

-- Funções para notas

-- Calcular média de um estudante em um projeto
CREATE OR REPLACE FUNCTION public.calculate_student_average(
  student_id_param uuid,
  project_id_param uuid DEFAULT NULL,
  period_param varchar DEFAULT NULL
)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT ROUND(AVG(grade), 2)
  FROM grades
  WHERE student_id = student_id_param
    AND (project_id_param IS NULL OR project_id = project_id_param)
    AND (period_param IS NULL OR period = period_param);
$$;

-- Obter boletim de um estudante
CREATE OR REPLACE FUNCTION public.get_student_report_card(
  student_id_param uuid,
  project_id_param uuid DEFAULT NULL
)
RETURNS TABLE(
  project_id uuid,
  project_name varchar,
  subject varchar,
  period varchar,
  grade numeric,
  observations text
)
LANGUAGE sql
STABLE
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

-- Funções para dashboard e estatísticas

-- Obter estatísticas gerais do sistema
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE(
  total_students bigint,
  total_projects bigint,
  total_polos bigint,
  total_cities bigint,
  pending_users bigint,
  recent_students bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    (SELECT COUNT(*) FROM students) as total_students,
    (SELECT COUNT(*) FROM projects) as total_projects,
    (SELECT COUNT(*) FROM polos) as total_polos,
    (SELECT COUNT(*) FROM cities) as total_cities,
    (SELECT COUNT(*) FROM profiles WHERE status = 'pending') as pending_users,
    (SELECT COUNT(*) FROM students WHERE created_at > NOW() - INTERVAL '30 days') as recent_students;
$$;

-- Obter aniversariantes do mês
CREATE OR REPLACE FUNCTION public.get_birthday_students(month_param integer DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  name varchar,
  birth_date date,
  age integer,
  polo_name varchar,
  city_name varchar
)
LANGUAGE sql
STABLE
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

-- Obter estatísticas de um projeto específico
CREATE OR REPLACE FUNCTION public.get_project_statistics(project_id_param uuid)
RETURNS TABLE(
  project_name varchar,
  total_students bigint,
  average_grade numeric,
  average_attendance numeric,
  total_grades bigint,
  total_attendance_records bigint
)
LANGUAGE sql
STABLE
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