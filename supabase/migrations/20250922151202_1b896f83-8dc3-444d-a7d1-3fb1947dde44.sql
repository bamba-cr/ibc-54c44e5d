-- Fix critical security vulnerability: profiles table publicly readable
-- Remove the overly permissive policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new secure policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all profiles (for admin functionality)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin());

-- Keep existing insert and update policies as they are already secure
-- Users can insert own profile: WITH CHECK (auth.uid() = id)
-- Users can update own profile: USING (auth.uid() = id) WITH CHECK (auth.uid() = id)