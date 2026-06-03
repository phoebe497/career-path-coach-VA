CREATE TABLE public.analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fit_score INTEGER NOT NULL,
  recommendation TEXT NOT NULL,
  matched_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  weak_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  learning_roadmap JSONB NOT NULL DEFAULT '[]'::jsonb,
  cv_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  job_title TEXT
);

GRANT SELECT, INSERT ON public.analysis_results TO anon, authenticated;
GRANT ALL ON public.analysis_results TO service_role;

ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- MVP: allow anyone to insert and read their own (or anonymous) analyses
CREATE POLICY "anyone can insert analyses"
ON public.analysis_results FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "users read own or anonymous analyses"
ON public.analysis_results FOR SELECT
TO anon, authenticated
USING (user_id IS NULL OR user_id = auth.uid());