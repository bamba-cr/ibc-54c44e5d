-- Allow multiple subjects per (student, project, period) and enable upsert
DO $$
BEGIN
  -- Drop old unique constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.conname = 'unique_student_project_period'
      AND n.nspname = 'public'
      AND t.relname = 'grades'
  ) THEN
    ALTER TABLE public.grades DROP CONSTRAINT unique_student_project_period;
  END IF;

  -- Create a new unique constraint including subject
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.conname = 'unique_student_project_period_subject'
      AND n.nspname = 'public'
      AND t.relname = 'grades'
  ) THEN
    ALTER TABLE public.grades
    ADD CONSTRAINT unique_student_project_period_subject
    UNIQUE (student_id, project_id, period, subject);
  END IF;

  -- Helpful index for lookups by student/project
  CREATE INDEX IF NOT EXISTS idx_grades_student_project_period
  ON public.grades (student_id, project_id, period);
END $$;