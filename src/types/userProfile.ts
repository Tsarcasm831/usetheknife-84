
export interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}
