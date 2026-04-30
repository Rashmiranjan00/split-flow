-- Add optional note field to settlements
ALTER TABLE public.settlements ADD COLUMN note text;
