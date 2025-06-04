-- Add stringer_id column to stringing_jobs table
ALTER TABLE public.stringing_jobs
ADD COLUMN stringer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing jobs to associate with the first available stringer
-- This is just a fallback - in production, you'd want to handle this differently
UPDATE public.stringing_jobs
SET stringer_id = (
  SELECT id 
  FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'stringer' 
  LIMIT 1
)
WHERE stringer_id IS NULL;

-- Make the column required after backfilling
ALTER TABLE public.stringing_jobs
ALTER COLUMN stringer_id SET NOT NULL;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_stringing_jobs_stringer_id ON public.stringing_jobs(stringer_id);

-- Update RLS policies for stringing_jobs table
DROP POLICY IF EXISTS "Enable read access for stringers on their jobs" ON public.stringing_jobs;
CREATE POLICY "Enable read access for stringers on their jobs"
ON public.stringing_jobs
FOR SELECT
TO authenticated
USING (stringer_id = auth.uid() OR user_id = auth.uid());

-- Allow stringers to update their own jobs
DROP POLICY IF EXISTS "Enable update access for stringers on their jobs" ON public.stringing_jobs;
CREATE POLICY "Enable update access for stringers on their jobs"
ON public.stringing_jobs
FOR UPDATE
TO authenticated
USING (stringer_id = auth.uid() OR user_id = auth.uid())
WITH CHECK (stringer_id = auth.uid() OR user_id = auth.uid());

-- Allow stringers to delete their own jobs
DROP POLICY IF EXISTS "Enable delete access for stringers on their jobs" ON public.stringing_jobs;
CREATE POLICY "Enable delete access for stringers on their jobs"
ON public.stringing_jobs
FOR DELETE
TO authenticated
USING (stringer_id = auth.uid() OR user_id = auth.uid());
