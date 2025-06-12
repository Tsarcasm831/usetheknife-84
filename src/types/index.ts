
export interface UserProfile {
  id: string;
  auth_user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  username: string;
  avatar_url: string;
}

export interface DevLogEntry {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  imageUrl: string;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  lastLogin: string;
  role: string;
}

export interface NavItem {
  title: string;
  href: string;
}
