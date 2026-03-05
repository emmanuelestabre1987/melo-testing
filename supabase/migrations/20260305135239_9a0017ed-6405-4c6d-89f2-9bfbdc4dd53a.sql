-- Allow publication owners to update matches on their publications (accept/reject)
CREATE POLICY "Publication owners can update matches"
ON public.matches
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT publications.user_id
    FROM publications
    WHERE publications.id = matches.publication_id
  )
);