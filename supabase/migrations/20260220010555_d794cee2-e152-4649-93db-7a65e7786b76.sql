-- Create matches table to link publications
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  matched_publication_id UUID REFERENCES public.publications(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view matches on their publications"
  ON public.matches FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT user_id FROM public.publications WHERE id = publication_id)
  );

CREATE POLICY "Users can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own matches"
  ON public.matches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();