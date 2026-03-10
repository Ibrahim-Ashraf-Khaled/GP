-- Create a secure function to notify all administrators
CREATE OR REPLACE FUNCTION public.notify_admins(
    p_title text, 
    p_message text, 
    p_type text, 
    p_link text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with the privileges of the creator
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT id, p_title, p_message, p_type, p_link
  FROM public.profiles
  WHERE is_admin = true;
END;
$$;;
