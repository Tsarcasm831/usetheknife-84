
-- Remove the old trigger that's causing the conflict
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove the old function for the profiles table
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop the old profiles table since we're now using app_users
DROP TABLE IF EXISTS public.profiles;
