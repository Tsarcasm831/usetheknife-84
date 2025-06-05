
import { DevLogEntry, User, NavItem } from "@/types";

export const mockUser: User = {
  id: "user-1",
  username: "GameTester123",
  avatar: "https://i.pravatar.cc/150?img=3",
  lastLogin: "2023-05-15T10:30:00Z",
  role: "member"
};

export const mockNavItems: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "DevLog", href: "#devlog" },
  { title: "About", href: "#about" },
  { title: "Media", href: "#media" },
  { title: "Community", href: "#community" },
  { title: "Game", href: "/game" }
];

export const mockDevLogs: DevLogEntry[] = [
  {
    id: "devlog-1",
    title: "Combat System Overhaul",
    excerpt: "We've completely redesigned the combat mechanics to be more fluid and responsive.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultricies, nunc nisl ultricies nunc, eget ultricies nisl nisl eget ultricies ultricies, nunc nisl ultricies nunc, eget ultricies nisl.",
    date: "2023-05-12T15:30:00Z",
    author: "Lead Developer",
    tags: ["combat", "gameplay", "mechanics"],
    featured: true,
    imageUrl: "https://via.placeholder.com/640x360/FF6B00/FFFFFF/?text=Combat+System"
  },
  {
    id: "devlog-2",
    title: "New Environment: The Wastes",
    excerpt: "Explore the desolate and dangerous region known as The Wastes in our next update.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultricies, nunc nisl ultricies nunc, eget ultricies nisl nisl eget ultricies ultricies, nunc nisl ultricies nunc, eget ultricies nisl.",
    date: "2023-05-08T09:45:00Z",
    author: "Environment Artist",
    tags: ["environment", "level design", "art"],
    imageUrl: "https://via.placeholder.com/640x360/2E3440/FFFFFF/?text=The+Wastes"
  },
  {
    id: "devlog-3",
    title: "Performance Improvements",
    excerpt: "Major optimizations to improve framerates on all platforms.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultricies, nunc nisl ultricies nunc, eget ultricies nisl nisl eget ultricies ultricies, nunc nisl ultricies nunc, eget ultricies nisl.",
    date: "2023-05-01T14:20:00Z",
    author: "Technical Director",
    tags: ["performance", "optimization", "technical"],
    imageUrl: "https://via.placeholder.com/640x360/4C566A/FFFFFF/?text=Performance"
  },
  {
    id: "devlog-4",
    title: "Story Expansion: The Fallen City",
    excerpt: "New story missions will take players through the ruins of a once-great civilization.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultricies, nunc nisl ultricies nunc, eget ultricies nisl nisl eget ultricies ultricies, nunc nisl ultricies nunc, eget ultricies nisl.",
    date: "2023-04-25T11:15:00Z",
    author: "Narrative Designer",
    tags: ["story", "missions", "narrative"],
    imageUrl: "https://via.placeholder.com/640x360/FF3A20/FFFFFF/?text=Fallen+City"
  }
];
