
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
