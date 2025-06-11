
-- Security fixes migration
-- Add missing RLS policies and security functions

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "app_users_select_policy" ON public.app_users;
DROP POLICY IF EXISTS "app_users_update_policy" ON public.app_users;
DROP POLICY IF EXISTS "app_users_insert_policy" ON public.app_users;

-- Create comprehensive RLS policies for app_users
CREATE POLICY "app_users_select_policy"
  ON public.app_users
  FOR SELECT
  USING (
    auth.uid() = auth_user_id OR 
    (SELECT role FROM public.app_users WHERE auth_user_id = auth.uid()) = 'admin'
  );

CREATE POLICY "app_users_update_policy"
  ON public.app_users
  FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "app_users_insert_policy"
  ON public.app_users
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- Create input validation functions
CREATE OR REPLACE FUNCTION public.validate_username(username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Username must be 3-50 characters, alphanumeric plus underscore/dash
  RETURN username ~ '^[a-zA-Z0-9_-]{3,50}$';
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_email(email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Basic email validation
  RETURN email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' 
    AND length(email) <= 254;
END;
$$;

CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove potentially dangerous characters and trim whitespace
  RETURN trim(regexp_replace(input_text, '[<>''";\\]', '', 'g'));
END;
$$;

-- Update the handle_new_app_user function to include validation
CREATE OR REPLACE FUNCTION public.handle_new_app_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
DECLARE
  clean_username TEXT;
  clean_email TEXT;
BEGIN
  -- Validate and sanitize email
  clean_email := lower(trim(NEW.email));
  IF NOT public.validate_email(clean_email) THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Get and validate username from metadata
  clean_username := COALESCE(
    public.sanitize_text_input(NEW.raw_user_meta_data->>'username'),
    'user_' || substr(gen_random_uuid()::text, 1, 8)
  );
  
  IF NOT public.validate_username(clean_username) THEN
    clean_username := 'user_' || substr(gen_random_uuid()::text, 1, 8);
  END IF;

  -- Ensure username is unique
  WHILE EXISTS (SELECT 1 FROM public.app_users WHERE username = clean_username) LOOP
    clean_username := clean_username || '_' || substr(gen_random_uuid()::text, 1, 4);
  END LOOP;

  INSERT INTO public.app_users (
    auth_user_id,
    email,
    username,
    avatar_url
  )
  VALUES (
    NEW.id,
    clean_email,
    clean_username,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://robohash.org/' || NEW.id)
  );
  RETURN NEW;
END;
$$;

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_log_admin_only"
  ON public.security_audit_log
  FOR ALL
  USING ((SELECT role FROM public.app_users WHERE auth_user_id = auth.uid()) = 'admin');

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_resource TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource,
    success,
    details
  )
  VALUES (
    auth.uid(),
    p_action,
    p_resource,
    p_success,
    p_details
  );
END;
$$;

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limits
CREATE POLICY "rate_limits_user_only"
  ON public.rate_limits
  FOR ALL
  USING (user_id = auth.uid());

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action TEXT,
  p_max_attempts INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get current count for this action in the time window
  SELECT COALESCE(SUM(count), 0)
  INTO current_count
  FROM public.rate_limits
  WHERE user_id = auth.uid()
    AND action = p_action
    AND window_start > window_start;
  
  -- If under limit, record this attempt
  IF current_count < p_max_attempts THEN
    INSERT INTO public.rate_limits (user_id, action)
    VALUES (auth.uid(), p_action);
    RETURN true;
  END IF;
  
  -- Log rate limit violation
  PERFORM public.log_security_event(
    'rate_limit_exceeded',
    p_action,
    false,
    jsonb_build_object('current_count', current_count, 'max_attempts', p_max_attempts)
  );
  
  RETURN false;
END;
$$;

-- Clean up old rate limit records (function to be called by cron)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < now() - INTERVAL '24 hours';
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action 
  ON public.rate_limits(user_id, action, window_start);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_created 
  ON public.security_audit_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_app_users_username 
  ON public.app_users(username);
CREATE INDEX IF NOT EXISTS idx_app_users_email 
  ON public.app_users(email);

