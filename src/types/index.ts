
export interface User {
  id: string;
  username: string;
  avatar: string;
  lastLogin: string;
  role: 'admin' | 'moderator' | 'member';
}

export interface DevLogEntry {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  imageUrl?: string;
  featured?: boolean;
}

export interface NavItem {
  title: string;
  href: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  username?: string;
}

export interface ProfileFormData {
  username: string;
  avatar_url: string;
}

export interface UserProfile {
  id: string;
  created_at: string;
  email: string;
  username: string;
  avatar_url: string | null;
  role: string;
  updated_at: string;
}
