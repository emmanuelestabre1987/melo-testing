-- Drop existing restrictive policy and create a broader one for the board
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile " ON public.profiles;

-- Try dropping with both naming variants
DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);