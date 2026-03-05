
-- Drop all existing restrictive policies on matches
DROP POLICY IF EXISTS "Publication owners can update matches" ON public.matches;
DROP POLICY IF EXISTS "Users can create matches" ON public.matches;
DROP POLICY IF EXISTS "Users can update own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can view matches on their publications" ON public.matches;

-- Recreate as PERMISSIVE policies (so ANY matching policy grants access)
CREATE POLICY "Users can view own matches"
ON public.matches FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Publication owners can view matches"
ON public.matches FOR SELECT TO authenticated
USING (auth.uid() IN (SELECT publications.user_id FROM publications WHERE publications.id = matches.publication_id));

CREATE POLICY "Users can create matches"
ON public.matches FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own matches"
ON public.matches FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Publication owners can update matches"
ON public.matches FOR UPDATE TO authenticated
USING (auth.uid() IN (SELECT publications.user_id FROM publications WHERE publications.id = matches.publication_id));
