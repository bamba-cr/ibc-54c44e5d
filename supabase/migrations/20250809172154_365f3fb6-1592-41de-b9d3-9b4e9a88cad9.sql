-- Promote a specific user to admin by email
DO $$
DECLARE
  v_uid uuid;
BEGIN
  -- Try to find the user id from profiles by email
  SELECT user_id INTO v_uid
  FROM public.profiles 
  WHERE LOWER(email) = LOWER('marcospcra@gmail.com')
  LIMIT 1;

  -- Fallback: find in auth.users if not present in profiles
  IF v_uid IS NULL THEN
    SELECT id INTO v_uid
    FROM auth.users 
    WHERE LOWER(email) = LOWER('marcospcra@gmail.com')
    LIMIT 1;
  END IF;

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado para o email: %', 'marcospcra@gmail.com';
  END IF;

  -- Ensure profile exists and is approved and admin
  UPDATE public.profiles
  SET 
    is_admin = TRUE,
    status = 'approved',
    updated_at = NOW()
  WHERE user_id = v_uid;

  -- Add admin role in user_roles (idempotent)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;