-- Ensure profiles are created for auth users and linked via user_id
-- 1) Update handle_new_user to also set user_id
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

-- 2) Create trigger on auth.users to invoke handle_new_user after signup
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE t.tgname = 'on_auth_user_created'
      AND c.relname = 'users'
      AND n.nspname = 'auth'
  ) THEN
    -- Drop existing trigger to ensure it's up-to-date
    EXECUTE 'DROP TRIGGER on_auth_user_created ON auth.users;';
  END IF;
  -- Create trigger
  EXECUTE 'CREATE TRIGGER on_auth_user_created
           AFTER INSERT ON auth.users
           FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();';
END $$;

-- 3) Backfill: create profile rows for existing auth users without a profile
INSERT INTO public.profiles (id, user_id, email, username, full_name, status, created_at, updated_at)
SELECT au.id,
       au.id,
       au.email,
       COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
       COALESCE(au.raw_user_meta_data->>'full_name', ''),
       'pending'::user_status,
       now(),
       now()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- 4) Backfill: ensure user_id is populated on existing profiles
UPDATE public.profiles
SET user_id = id
WHERE user_id IS NULL;