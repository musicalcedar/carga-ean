-- Reload the PostgREST schema cache
-- This is needed after creating new tables so the API can see them
NOTIFY pgrst, 'reload schema';
