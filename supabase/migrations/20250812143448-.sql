-- Fix RLS for grades to allow INSERTs (add WITH CHECK)
DO $$
BEGIN
  -- Try to alter existing policy; if it doesn't exist, create it properly
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'grades' 
      AND policyname = 'Grades can be modified by authenticated users'
  ) THEN
    ALTER POLICY "Grades can be modified by authenticated users"
    ON public.grades
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  ELSE
    CREATE POLICY "Grades can be modified by authenticated users"
    ON public.grades
    AS PERMISSIVE
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;