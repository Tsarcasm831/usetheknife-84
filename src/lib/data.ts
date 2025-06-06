
import { DevLogEntry, User, NavItem } from "@/types";

export const mockUser: User = {
  id: "user-1",
  username: "GameTester123",
  avatar: "https://i.pravatar.cc/150?img=3",
  lastLogin: "2025-05-15T10:30:00Z",
  role: "member"
};

export const mockNavItems: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "DevLog", href: "#devlog" },
  { title: "About Me", href: "/about" },
  { title: "About", href: "#about" },
  { title: "Media", href: "#media" },
  { title: "Media", href: "/media" },
  { title: "Community", href: "#community" },
  { title: "Game", href: "/game" }
];

export const mockDevLogs: DevLogEntry[] = [
  {
    id: "devlog-7",
    title: "Navigation Cleanup",
    excerpt: "Removed extra links from the top navigation bar.",
    content: "We trimmed the nav bar by dropping the Community button and the duplicate DevLog link so the interface is less cluttered.",
    date: "2025-06-08T09:00:00Z",
    author: "Web Team",
    tags: ["ui", "navigation"],
    imageUrl: "https://via.placeholder.com/640x360/2DD4BF/FFFFFF/?text=Navigation"
  },
  {
    id: "devlog-6",
    title: "Updated site branding",
    excerpt: "Renamed landing page title to usetheknife.com.",
    content: "The main index now references the new domain in the title and Open Graph meta tags.",
    date: "2025-06-07T00:00:00Z",
    author: "Web Team",
    tags: ["meta", "branding"],
    imageUrl: "https://via.placeholder.com/640x360/2DD4BF/FFFFFF/?text=Branding"
    title: "Media page now live",
    excerpt: "Visit our new page for links to Facebook, Spotify and YouTube.",
    content: "We've launched a dedicated Media page collecting our online channels. Check it out to follow us on Facebook, Spotify and YouTube.",
    date: "2025-06-07T12:00:00Z",
    author: "Web Team",
    tags: ["website", "community"],
    imageUrl: "https://via.placeholder.com/640x360/1E90FF/FFFFFF/?text=Media+Page"
    title: "Trailer Button Updated",
    excerpt: "The homepage trailer button now says Coming Soon.",
    content: "We've renamed the 'Watch Trailer' button to 'Coming Soon' as we finalize footage for the next trailer.",
    date: "2025-06-07T12:00:00Z",
    author: "Web Team",
    tags: ["ui", "update"],
    imageUrl: "https://via.placeholder.com/640x360/FFA500/FFFFFF/?text=Coming+Soon"
  },
  {
    id: "devlog-5",
    title: "UI Fixes and Asset Updates",
    excerpt: "Improved team and loadout tabs. Fixed broken images in the mission modal.",
    content: "This patch cleans up the Prepare Event interface. Available units are easier to read, loadout slots are clearer, and briefing/map images now load correctly.",
    date: "2025-06-06T10:00:00Z",
    author: "Web Team",
    tags: ["ui", "bugfix"],
    imageUrl: "https://via.placeholder.com/640x360/2DD4BF/FFFFFF/?text=UI+Fixes"
  },
  {
    id: "devlog-4",
    title: "Roadmap to Release",
    excerpt: "We've published an updated roadmap detailing the final steps to 1.0.",
    content: "In this post we outline our remaining milestones including balancing passes, localization and console certification. Thank you for sticking with us on this journey!",
    date: "2025-04-20T11:15:00Z",
    author: "Project Lead",
    tags: ["roadmap", "development"],
    imageUrl: "https://via.placeholder.com/640x360/FF3A20/FFFFFF/?text=Roadmap"
  }
];
