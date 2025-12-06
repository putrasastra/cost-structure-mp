-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role, metadata)
  VALUES (new.id, new.email, 'individual', new.raw_user_meta_data)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill existing users from auth.users to public.users
INSERT INTO public.users (id, email, role, metadata)
SELECT 
  id, 
  email, 
  'individual', 
  raw_user_meta_data
FROM auth.users
ON CONFLICT (id) DO NOTHING;
